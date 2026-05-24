// @ts-check
import { execFile } from 'child_process';

/**
 * @file Run `npm audit --json` against the current project and return the
 * parsed vulnerability entries. Thin I/O wrapper kept separate from the pure
 * detection logic in find-unfixable-vulns.js so the latter stays unit-testable.
 * @module run-project-audit
 */

/**
 * Run `npm audit --json` in the current working directory and return the
 * vulnerability entries (the values of npm's `vulnerabilities` map, each of
 * which already carries its own `name`).
 *
 * `npm audit` exits 1 when vulnerabilities are found, so the exit code is not
 * an error signal here — stdout is captured regardless. A genuine failure
 * (npm missing, malformed JSON) degrades to an empty list with a stderr
 * warning rather than crashing the primary `--check` flow, since the unfixable
 * surface is informational and must not perturb the exit-code contract
 * (ADR-0003 / ADR-0004).
 *
 * @returns {Promise<Array<object>>} vulnerability entries, or [] on failure
 * @supports prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md REQ-UNFIXABLE-DETECT
 */
export async function runProjectAudit() {
  const stdout = await new Promise((resolve) => {
    execFile('npm', ['audit', '--json'], { encoding: 'utf8', maxBuffer: 1024 * 1024 * 32 }, (_error, out) =>
      resolve(out || '')
    );
  });

  if (!stdout.trim()) return [];

  let parsed;
  try {
    parsed = JSON.parse(stdout);
  } catch {
    console.error('Warning: could not parse `npm audit --json` output; skipping unfixable-vulnerability surface.');
    return [];
  }

  const vulnerabilities = parsed && parsed.vulnerabilities;
  if (!vulnerabilities || typeof vulnerabilities !== 'object') return [];
  return Object.values(vulnerabilities);
}
