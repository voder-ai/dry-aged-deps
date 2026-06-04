// @ts-check

/**
 * @file Identify known-vulnerable packages that dry-aged-deps cannot recommend
 * a safe update for. Pure transformation over parsed `npm audit --json` data;
 * the project-level audit run lives in a separate thin I/O wrapper.
 * @module find-unfixable-vulns
 */

/** Severity ordering for the configurable floor. A Map avoids dynamic
 * object-index access (and the false-positive security/detect-object-injection
 * lint it triggers). */
const SEVERITY_RANK = new Map([
  ['info', 0],
  ['low', 1],
  ['moderate', 2],
  ['high', 3],
  ['critical', 4],
]);

/**
 * Rank a severity string, defaulting unknown severities to the floor (0).
 * Exported so the table renderer can pick the max severity when grouping
 * a package's advisories without duplicating the ordering.
 * @param {string|undefined} severity
 * @returns {number}
 */
export function severityRank(severity) {
  return SEVERITY_RANK.get(severity ?? '') ?? 0;
}

/**
 * Extract a human-readable advisory id (GHSA slug) from an advisory URL,
 * falling back to the numeric npm-audit source id.
 * @param {{ source?: number|string, url?: string }} viaEntry
 * @returns {string}
 */
function advisoryId(viaEntry) {
  const url = viaEntry && viaEntry.url;
  if (typeof url === 'string') {
    const match = url.match(/GHSA-[0-9a-z-]+/i);
    if (match) return match[0];
  }
  return String(viaEntry && viaEntry.source != null ? viaEntry.source : 'unknown');
}

/**
 * Detect a bundling-parent path for the vuln per ADR-0018 §Detection signals
 * Step 2 (class (a) `fix-via-parent-bump`). Walks `nodes[]` for a path matching
 * `node_modules/<parent>/node_modules/<name>` and returns the parent segment.
 * `overrides` cannot reach a bundling parent's own `node_modules`, so the
 * actionable fix is bumping the parent — surfaced in the reason string.
 * Returns `null` when no bundling-parent topology is detected.
 * @param {{ fixAvailable?: boolean|object, nodes?: Array<string> }} vuln
 * @returns {string|null}
 */
function detectBundlingParent(vuln) {
  if (vuln.fixAvailable === false) return null;
  const nodes = Array.isArray(vuln.nodes) ? vuln.nodes : [];
  for (const node of nodes) {
    if (typeof node !== 'string') continue;
    const match = node.match(/node_modules\/([^/]+)\/node_modules\/[^/]+$/);
    if (match) return match[1];
  }
  return null;
}

/**
 * Detect a root-level `node_modules/<name>` install per ADR-0018 §Detection
 * signals Step 2 second sub-bullet (class (b) `fix-via-overrides-edit`). The
 * vulnerable copy lives directly under the root project's `node_modules`, not
 * inside a bundling parent — so a `package.json` `overrides` pin can reach it
 * once the patched range is satisfiable.
 * @param {{ nodes?: Array<string> }} vuln
 * @returns {boolean}
 */
function isAtRootNodeModules(vuln) {
  const nodes = Array.isArray(vuln.nodes) ? vuln.nodes : [];
  for (const node of nodes) {
    if (typeof node !== 'string') continue;
    if (/^node_modules\/[^/]+$/.test(node)) return true;
  }
  return false;
}

/**
 * Short, human-readable reason dry-aged-deps cannot land a safe fix.
 * Per ADR-0018 (2026-06-05 amendment), classification proceeds in precedence
 * order (a) > (b) > legacy-transitive: class (a) `fix via parent bump: <parent>`
 * wins when a bundling-parent topology is detected; class (b) `fix via
 * overrides edit` follows for root-level transitives with a satisfiable patched
 * range; the legacy `vulnerable transitive dependency` string is retained for
 * transitives without `nodes[]` topology data and is staged for retirement in
 * the class (c) iter (ADR-0018 amendment §User-facing reason strings).
 * @param {{ isDirect?: boolean, fixAvailable?: boolean|object, nodes?: Array<string> }} vuln
 * @returns {string}
 */
function deriveReason(vuln) {
  const parent = detectBundlingParent(vuln);
  if (parent) return `fix via parent bump: ${parent}`;
  if (vuln.fixAvailable !== false && isAtRootNodeModules(vuln)) {
    return 'fix via overrides edit';
  }
  if (vuln.isDirect === false) return 'vulnerable transitive dependency';
  if (vuln.fixAvailable === false) return 'no patched version';
  return 'no safe, mature version available';
}

/**
 * Identify known-vulnerable packages that dry-aged-deps cannot recommend a safe
 * update for (transitive vulns, or direct deps with no safe-and-mature fix).
 *
 * The detection rule (ADR-0018): a package is unfixable-by-dry-aged-deps when
 * its name is NOT in the safe-update set. That set is the output of the
 * ADR-0014 smart-search filter pipeline — its absence IS the unfixable signal.
 * Transitive vulns (`isDirect: false`) are never in the set; direct deps with
 * no safe-and-mature target get filtered out of it.
 *
 * One row is emitted per advisory (npm audit groups multiple advisories under a
 * single package `via` array). Advisories excepted in `audit-resolve.json`
 * (ADR-0008) are dropped, as are advisories below the severity floor.
 *
 * @param {object} params
 * @param {Array<{ name: string, severity?: string, isDirect?: boolean, fixAvailable?: boolean|object, via?: Array<any> }>} params.vulnerabilities - parsed `npm audit --json` vulnerability entries
 * @param {Set<string>} params.safePackages - names of packages dry-aged-deps will recommend a safe update for
 * @param {Iterable<string|number>} [params.exclusions] - excepted advisory source ids (audit-resolve.json)
 * @param {string} [params.severityFloor] - minimum severity to surface; default 'low' surfaces all real severities
 * @returns {Array<{ name: string, severity: string, advisory: string, reason: string, via: Array<string> }>}
 * @supports prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md REQ-UNFIXABLE-DETECT REQ-UNFIXABLE-EXCEPTION-RESPECT REQ-UNFIXABLE-SEVERITY-FLOOR REQ-UNFIXABLE-FIXABLE-SOON-BOUNDARY
 */
export function findUnfixableVulns({ vulnerabilities, safePackages, exclusions = [], severityFloor = 'low' }) {
  const excluded = new Set([...exclusions].map((id) => String(id)));
  const floorRank = SEVERITY_RANK.get(severityFloor) ?? SEVERITY_RANK.get('low');
  /** @type {Array<{ name: string, severity: string, advisory: string, reason: string, via: Array<string> }>} */
  const rows = [];

  for (const vuln of vulnerabilities || []) {
    // The package is being safely updated → dry-aged-deps fixes it → not unfixable.
    if (safePackages.has(vuln.name)) continue;

    const via = Array.isArray(vuln.via) ? vuln.via : [];
    // Advisory entries are the object members of `via`; string members are
    // parent package names in the propagation chain.
    const advisories = via.filter((entry) => entry && typeof entry === 'object' && entry.source != null);
    const viaChain = via.map((entry) => (typeof entry === 'string' ? entry : advisoryId(entry)));

    for (const advisory of advisories) {
      if (excluded.has(String(advisory.source))) continue;
      const severity = advisory.severity || vuln.severity || 'low';
      if (severityRank(severity) < floorRank) continue;
      rows.push({
        name: vuln.name,
        severity,
        advisory: advisoryId(advisory),
        reason: deriveReason(vuln),
        via: viaChain,
      });
    }
  }

  return rows;
}
