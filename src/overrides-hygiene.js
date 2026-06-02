// @ts-check
/**
 * Overrides-hygiene module — surfaces stale and/or vulnerable
 * `package.json` `overrides` pins.
 *
 * T3 minimum-to-pass per RFC-001 (docs/rfcs/RFC-001-overrides-hygiene-module.in-progress.md).
 * Pipeline wiring (T4), formatter rendering (T5), exit-code extension (T6),
 * and live-case regression (T7) land in subsequent iters.
 *
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-PARSE REQ-OVERRIDES-AGE REQ-OVERRIDES-AUDIT-XREF REQ-OVERRIDES-OUTDATED-XREF REQ-OVERRIDES-REASON-TAXONOMY REQ-OVERRIDES-EXCEPTION-RESPECT
 */

import { calculateAgeInDays } from './age-calculator.js';

/**
 * @typedef {{
 *   id: string,
 *   severity: string,
 *   patchedRange: string|null,
 * }} OverrideAdvisory
 */

/**
 * @typedef {{
 *   name: string,
 *   pinned: string|null,
 *   latest: string|null,
 *   ageDays: number|null,
 *   reason: string,
 *   advisories: OverrideAdvisory[],
 *   safeUpgrade: string|null,
 * }} OverrideFinding
 */

/**
 * Run the overrides-hygiene scan.
 *
 * @param {object} options
 * @param {object} options.packageJson - Parsed package.json object.
 * @param {{ vulnerabilities?: Record<string, { via?: Array<{ source?: number, url?: string, severity?: string, range?: string }> }> }} options.auditData - Pre-fetched `npm audit --json` payload.
 * @param {Record<string, { current?: string, latest?: string }>} options.outdatedData - Pre-fetched `npm outdated --json` payload.
 * @param {Record<string, string>} [options.versionTimes] - Injected `name@version` -> ISO publish-date map.
 * @param {Date} [options.now] - Reference clock for age math (defaults to current time).
 * @param {number[]} [options.exclusions] - Advisory `source` IDs to filter (audit-resolve.json mirror).
 * @returns {Promise<OverrideFinding[]>}
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-PARSE REQ-OVERRIDES-AGE REQ-OVERRIDES-AUDIT-XREF REQ-OVERRIDES-OUTDATED-XREF REQ-OVERRIDES-REASON-TAXONOMY REQ-OVERRIDES-EXCEPTION-RESPECT
 */
export async function runOverridesHygiene({
  packageJson,
  auditData,
  outdatedData,
  versionTimes = {},
  now = new Date(),
  exclusions = [],
}) {
  const overrides = packageJson?.overrides;
  if (!overrides || typeof overrides !== 'object') {
    return [];
  }

  // Materialise Maps for name-keyed lookups so the per-entry assess loop avoids
  // dynamic object-index access (and the false-positive
  // security/detect-object-injection lint it triggers).
  const outdatedMap = toMap(outdatedData);
  const vulnMap = toMap(auditData?.vulnerabilities);
  const versionTimeMap = toMap(versionTimes);

  const entries = parseOverrideEntries(overrides);
  const findings = [];

  for (const entry of entries) {
    if (entry.malformed) {
      findings.push(buildMalformedFinding(entry.name));
      continue;
    }

    const finding = assessOverride({
      name: entry.name,
      pinned: entry.pinned,
      vulnMap,
      outdatedMap,
      versionTimeMap,
      now,
      exclusions,
    });

    if (finding) {
      findings.push(finding);
    }
  }

  return findings;
}

/**
 * @param {Record<string, unknown>|undefined} obj
 * @returns {Map<string, any>}
 */
function toMap(obj) {
  return obj && typeof obj === 'object' ? new Map(Object.entries(obj)) : new Map();
}

/**
 * Walk the overrides block and yield normalised entries (both simple and
 * nested shapes per the npm overrides spec).
 *
 * @param {Record<string, unknown>} overrides
 * @returns {Array<{ name: string, pinned?: string, malformed?: boolean }>}
 */
function parseOverrideEntries(overrides) {
  const entries = [];

  for (const [name, value] of Object.entries(overrides)) {
    if (typeof value === 'string') {
      entries.push({ name, pinned: value });
      continue;
    }

    if (value && typeof value === 'object') {
      const nested = /** @type {Record<string, unknown>} */ (value);
      const selfPin = nested['.'];
      if (typeof selfPin === 'string') {
        entries.push({ name, pinned: selfPin });
      }
      for (const [subName, subPin] of Object.entries(nested)) {
        if (subName === '.') continue;
        if (typeof subPin === 'string') {
          entries.push({ name: subName, pinned: subPin });
        }
      }
      continue;
    }

    entries.push({ name, malformed: true });
  }

  return entries;
}

/**
 * @param {string} name
 * @returns {OverrideFinding}
 */
function buildMalformedFinding(name) {
  return {
    name,
    pinned: null,
    latest: null,
    ageDays: null,
    reason: 'pin-to-malformed-entry',
    advisories: [],
    safeUpgrade: null,
  };
}

/**
 * Build a finding row for a parsed override entry. Returns null when the
 * entry is neither stale nor advisory-hit (no row needed).
 *
 * @param {object} ctx
 * @param {string} ctx.name
 * @param {string} ctx.pinned
 * @param {Map<string, { via?: Array<{ source?: number, url?: string, severity?: string, range?: string }> }>} ctx.vulnMap
 * @param {Map<string, { current?: string, latest?: string }>} ctx.outdatedMap
 * @param {Map<string, string>} ctx.versionTimeMap
 * @param {Date} ctx.now
 * @param {number[]} ctx.exclusions
 * @returns {OverrideFinding|null}
 */
function assessOverride({ name, pinned, vulnMap, outdatedMap, versionTimeMap, now, exclusions }) {
  const exactVersion = stripRangeSpecifier(pinned);
  const publishDate = versionTimeMap.get(`${name}@${exactVersion}`);
  const ageDays = publishDate ? calculateAgeInDays(publishDate, now.getTime()) : null;

  const outdatedEntry = outdatedMap.get(name);
  const latest = outdatedEntry?.latest ?? null;
  const isStale = Boolean(latest) && exactVersion !== latest;

  const advisories = collectAdvisories(vulnMap, name, exclusions);
  const hasAdvisory = advisories.length > 0;

  if (!isStale && !hasAdvisory) {
    return null;
  }

  return {
    name,
    pinned,
    latest,
    ageDays,
    reason: composeReason({ ageDays, isStale, advisories }),
    advisories,
    safeUpgrade: latest,
  };
}

/**
 * Strip a leading semver-range operator so a pinned spec like `^4.0.1`
 * resolves to the exact `4.0.1` for version-time lookup.
 *
 * @param {string} versionRange
 * @returns {string}
 */
function stripRangeSpecifier(versionRange) {
  return versionRange.replace(/^[\^~>=<]+\s*/, '').trim();
}

/**
 * Collect non-excluded advisories for a package from the `npm audit` payload.
 *
 * @param {Map<string, { via?: Array<{ source?: number, url?: string, severity?: string, range?: string }> }>} vulnMap
 * @param {string} name
 * @param {number[]} exclusions
 * @returns {OverrideAdvisory[]}
 */
function collectAdvisories(vulnMap, name, exclusions) {
  const vuln = vulnMap.get(name);
  if (!vuln || !Array.isArray(vuln.via)) {
    return [];
  }

  const exclusionSet = new Set(exclusions);
  const advisories = [];

  for (const via of vuln.via) {
    if (!via || typeof via !== 'object') continue;
    if (typeof via.source === 'number' && exclusionSet.has(via.source)) continue;

    const id = extractAdvisoryId(via.url);
    if (!id) continue;

    advisories.push({
      id,
      severity: via.severity ?? 'unknown',
      patchedRange: via.range ?? null,
    });
  }

  return advisories;
}

/**
 * Pull the GHSA identifier out of an advisory URL.
 *
 * @param {string|undefined} url
 * @returns {string|null}
 */
function extractAdvisoryId(url) {
  if (typeof url !== 'string') return null;
  const match = url.match(/(GHSA-[\w-]+)/);
  return match ? match[1] : null;
}

/**
 * Compose the short-vocabulary reason string per REQ-OVERRIDES-REASON-TAXONOMY.
 *
 * @param {object} ctx
 * @param {number|null} ctx.ageDays
 * @param {boolean} ctx.isStale
 * @param {OverrideAdvisory[]} ctx.advisories
 * @returns {string}
 */
function composeReason({ ageDays, isStale, advisories }) {
  const hasAdvisory = advisories.length > 0;
  const advisoryId = hasAdvisory ? advisories[0].id : null;

  if (isStale && hasAdvisory) {
    return `stale-and-vulnerable: ${ageDays} days behind, ${advisoryId}`;
  }
  if (hasAdvisory) {
    return `vulnerable: ${advisoryId}`;
  }
  if (isStale) {
    return `stale: ${ageDays} days behind latest`;
  }
  return '';
}
