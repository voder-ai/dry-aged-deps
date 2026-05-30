// @ts-check
import { execFile } from 'child_process';

/**
 * @file Run `npm audit --json` against the current project and return the
 * parsed vulnerability entries. Thin I/O wrapper kept separate from the pure
 * detection logic in find-unfixable-vulns.js so the latter stays unit-testable.
 * @module run-project-audit
 */

/**
 * Run `npm audit --json` in the current working directory and return the raw
 * audit payload `{ vulnerabilities: { <name>: <entry> } }`. Consumers pick the
 * shape they need: `Object.values(...)` for the unfixable surface (ADR-0018),
 * the name-keyed map for the overrides-hygiene surface (RFC-001).
 *
 * `npm audit` exits 1 when vulnerabilities are found, so the exit code is not
 * an error signal here — stdout is captured regardless. A genuine failure
 * (npm missing, malformed JSON) degrades to `{ vulnerabilities: {} }` with a
 * stderr warning rather than crashing the primary `--check` flow, since the
 * informational surfaces must not perturb the exit-code contract (ADR-0003 /
 * ADR-0004).
 *
 * @returns {Promise<{ vulnerabilities: Record<string, object> }>} raw audit payload, or `{ vulnerabilities: {} }` on failure
 * @supports prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md REQ-UNFIXABLE-DETECT
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-AUDIT-XREF
 */
export async function runProjectAudit() {
  const stdout = await new Promise((resolve) => {
    execFile('npm', ['audit', '--json'], { encoding: 'utf8', maxBuffer: 1024 * 1024 * 32 }, (_error, out) =>
      resolve(out || '')
    );
  });

  if (!stdout.trim()) return { vulnerabilities: {} };

  let parsed;
  try {
    parsed = JSON.parse(stdout);
  } catch {
    console.error('Warning: could not parse `npm audit --json` output; skipping unfixable-vulnerability surface.');
    return { vulnerabilities: {} };
  }

  const vulnerabilities = parsed && parsed.vulnerabilities;
  if (!vulnerabilities || typeof vulnerabilities !== 'object') return { vulnerabilities: {} };
  return { vulnerabilities };
}
