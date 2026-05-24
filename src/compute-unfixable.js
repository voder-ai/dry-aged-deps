// @ts-check
import { readFileSync } from 'fs';
import { join } from 'path';
import { runProjectAudit as defaultRunProjectAudit } from './run-project-audit.js';
import { findUnfixableVulns } from './find-unfixable-vulns.js';

/**
 * @file Orchestrates the unfixable-vulnerability surface: load excepted
 * advisories, run the project-level audit, and apply the pure detection rule.
 * Kept separate from print-outdated.js so the orchestrator stays within the
 * project's complexity/line limits and this remains unit-testable.
 * @module compute-unfixable
 */

/**
 * Load excepted advisory ids from `<cwd>/audit-resolve.json` (ADR-0008).
 * Absent or malformed file → no exclusions. Excepted advisories are the
 * maintainer's explicit "known and accepted" mark and must not re-surface.
 * @returns {Array<string|number>}
 * @supports prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md REQ-UNFIXABLE-EXCEPTION-LOOKUP
 */
function loadAuditExclusions() {
  try {
    const raw = readFileSync(join(process.cwd(), 'audit-resolve.json'), 'utf8');
    const parsed = JSON.parse(raw);
    const exclusions = Array.isArray(parsed.exclusions) ? parsed.exclusions : [];
    return exclusions.map((entry) => entry && entry.id).filter((id) => id != null);
  } catch {
    return [];
  }
}

/**
 * Compute the known-vulnerable-but-unfixable rows for the current project.
 *
 * @param {object} params
 * @param {Set<string>} params.safePackages - names dry-aged-deps will recommend a safe update for
 * @param {boolean} [params.enabled] - false when `--no-unfixable` is set (default true)
 * @param {string} [params.severityFloor] - minimum severity to surface (default 'low')
 * @param {() => Promise<Array<object>>} [params.runProjectAudit] - injectable audit runner
 * @param {Array<string|number>} [params.exclusions] - injectable exclusions (defaults to audit-resolve.json)
 * @returns {Promise<Array<{ name: string, severity: string, advisory: string, reason: string, via: Array<string> }>>}
 * @supports prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md REQ-UNFIXABLE-DETECT REQ-UNFIXABLE-DEFAULT-ON REQ-UNFIXABLE-EXCEPTION-RESPECT
 */
export async function computeUnfixable({
  safePackages,
  enabled = true,
  severityFloor = 'low',
  runProjectAudit = defaultRunProjectAudit,
  exclusions,
}) {
  if (!enabled) return [];
  const vulnerabilities = await runProjectAudit();
  const resolvedExclusions = exclusions ?? loadAuditExclusions();
  return findUnfixableVulns({ vulnerabilities, safePackages, exclusions: resolvedExclusions, severityFloor });
}
