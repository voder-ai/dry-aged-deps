// @ts-check
/**
 * @file Detect safe updates that cannot land (peer graph won't resolve without
 * --force / --legacy-peer-deps) and split them from the landable rows, using
 * npm's real resolver. Implements P028 / ADR-0022 / RFC-004.
 * @module compute-unlandable
 */

import { execFile } from 'child_process';
import { promises as fsp } from 'fs';
import os from 'os';
import path from 'path';

/**
 * Overlay a safe-update row set onto a parsed package.json, writing each row's
 * target version (`latest`, tuple element 3) into dependencies / devDependencies
 * per its depType — the same rule as applyUpdates() (ADR-0014).
 * @param {object} pkgData
 * @param {Array<[string, string, string, string, number|string, string]>} rows
 * @returns {object} a new package.json object with the rows applied
 */
function applyRows(pkgData, rows) {
  // Computed-key spread (not direct index assignment) matches applyUpdates() and
  // avoids the security/detect-object-injection lint on a dynamic key write.
  let dependencies = { ...(pkgData.dependencies || {}) };
  let devDependencies = { ...(pkgData.devDependencies || {}) };
  for (const [name, , , latest, , depType] of rows) {
    if (depType === 'prod') dependencies = { ...dependencies, [name]: latest };
    else devDependencies = { ...devDependencies, [name]: latest };
  }
  return { ...pkgData, dependencies, devDependencies };
}

/**
 * Probe whether a candidate safe-update set resolves, using npm's real resolver.
 * Writes the candidate package.json (and copies the project's package-lock.json
 * if present — the peer conflict only manifests against the full graph) into a
 * temp dir and runs `npm install --ignore-scripts --package-lock-only` (never
 * `--force` / `--legacy-peer-deps`).
 *
 * @param {object} pkgData - parsed project package.json
 * @param {Array<[string, string, string, string, number|string, string]>} rows - safe rows to overlay
 * @returns {Promise<string|null>} `null` if the set resolves cleanly; the npm
 *   error text if it is an ERESOLVE (un-landable). REJECTS (fail-loud) on any
 *   non-ERESOLVE npm error — a genuine failure must not be mistaken for
 *   un-landable (ADR-0021 / ADR-0022).
 * @supports prompts/019.0-DEV-FLAG-UN-LANDABLE-UPDATES.md REQ-UNLANDABLE-DETECT REQ-UNLANDABLE-FAIL-LOUD REQ-UNLANDABLE-NO-FORCE
 */
export async function probeResolve(pkgData, rows) {
  const candidate = applyRows(pkgData, rows);
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'dad-landable-'));
  try {
    await fsp.writeFile(path.join(tmpDir, 'package.json'), JSON.stringify(candidate, null, 2), 'utf8');
    try {
      const lock = await fsp.readFile(path.join(process.cwd(), 'package-lock.json'), 'utf8');
      await fsp.writeFile(path.join(tmpDir, 'package-lock.json'), lock, 'utf8');
    } catch {
      // No lockfile to seed — npm will resolve from package.json alone.
    }
    return await new Promise((resolve, reject) => {
      execFile(
        'npm',
        ['install', '--ignore-scripts', '--package-lock-only'],
        { cwd: tmpDir, encoding: 'utf8' },
        (error, _stdout, stderr) => {
          if (!error) return resolve(null);
          const text = String(stderr || (error instanceof Error ? error.message : error) || '');
          // ERESOLVE = the peer graph won't resolve without --force → un-landable.
          // Match npm's canonical error code, not a loose substring, so a real
          // failure (EACCES, ENETUNREACH, …) is NOT swallowed as un-landable.
          if (/\bERESOLVE\b/.test(text)) return resolve(text);
          // Fail-loud with the actual npm error text (stderr carries the real
          // reason, e.g. EACCES / ENETUNREACH), not just the bare exit-code error.
          return reject(new Error(text || (error instanceof Error ? error.message : String(error))));
        }
      );
    });
  } finally {
    await fsp.rm(tmpDir, { recursive: true, force: true });
  }
}

/**
 * Split the safe rows into landable vs un-landable (`incompatible-peers`) using
 * npm's resolver. Probes the full batch; on ERESOLVE, isolates the culprit(s) by
 * probing each row alone, then re-probes the landable remainder — if the
 * remainder still ERESOLVEs (a combination conflict with no single culprit), the
 * remainder is conservatively flagged rather than landing a broken set.
 *
 * @param {Array<[string, string, string, string, number|string, string]>} safeRows
 * @param {object} pkgData - parsed project package.json
 * @param {{ probe?: (pkgData: object, rows: Array) => Promise<string|null> }} [inject] - test seam
 * @returns {Promise<{ landable: Array, unlandable: Array<{ name: string, current: string, latest: string, reason: string }> }>}
 * @supports prompts/019.0-DEV-FLAG-UN-LANDABLE-UPDATES.md REQ-UNLANDABLE-DETECT REQ-UNLANDABLE-ISOLATE REQ-UNLANDABLE-REASON
 */
export async function computeUnlandable(safeRows, pkgData, inject = {}) {
  const probe = inject.probe || probeResolve;
  if (!safeRows || safeRows.length === 0) return { landable: [], unlandable: [] };

  // 1. Fast path: the whole batch resolves.
  if ((await probe(pkgData, safeRows)) === null) {
    return { landable: safeRows, unlandable: [] };
  }

  // 2. ERESOLVE: isolate individually-un-landable rows (probe each alone).
  const toUnlandable = (r) => ({ name: r[0], current: r[1], latest: r[3], reason: 'incompatible-peers' });
  const unlandable = [];
  const remainder = [];
  for (const row of safeRows) {
    if ((await probe(pkgData, [row])) !== null) unlandable.push(toUnlandable(row));
    else remainder.push(row);
  }
  if (remainder.length === 0) return { landable: [], unlandable };

  // 3. Re-probe the landable remainder as a set — a combination conflict has no
  //    single culprit, so conservatively flag the whole remainder (don't land a
  //    broken set). ponytail: per-row + one remainder re-probe, not a full
  //    subset bisect; upgrade to bisect if real batches carry many culprits.
  if ((await probe(pkgData, remainder)) === null) {
    return { landable: remainder, unlandable };
  }
  for (const row of remainder) unlandable.push(toUnlandable(row));
  return { landable: [], unlandable };
}
