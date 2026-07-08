/**
 * @file Tests for P030 / ADR-0021: `--update` reconciles package-lock.json.
 *
 * After `applyUpdates()` writes package.json, `updatePackages()` reconciles
 * package-lock.json by spawning `npm install --ignore-scripts --package-lock-only`
 * so the post-update project is immediately installable via
 * `npm ci --prefer-frozen-lockfile`. The reconcile runs ONLY when ≥1 update was
 * applied, uses `--ignore-scripts` (supply-chain posture) + `--package-lock-only`
 * (incremental, no node_modules install), and fails loud on npm error.
 *
 * Co-located beside src/update-packages.js per ADR-0020.
 *
 * @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-POST-UPDATE
 * @see docs/decisions/0021-update-reconciles-package-lock-via-incremental-install.proposed.md
 * @see docs/rfcs/RFC-003-update-reconciles-lockfile.proposed.md
 * @see docs/problems/open/030-update-leaves-lockfile-stale-breaking-npm-ci-for-adopters.md
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';
import os from 'os';
import { promises as fsp } from 'fs';
import { execFile } from 'child_process';
import { updatePackages, reconcileLockfile } from './update-packages.js';

vi.mock('child_process', () => ({ execFile: vi.fn() }));

describe('Story 011.0-DEV-AUTO-UPDATE: --update reconciles package-lock.json (ADR-0021, P030)', () => {
  let tmpDir;
  let originalCwd;
  let consoleLogSpy;
  let consoleErrorSpy;
  const summary = { totalOutdated: 1, safeUpdates: 1, filteredByAge: 0, filteredBySecurity: 0 };

  beforeEach(async () => {
    originalCwd = process.cwd();
    tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'p030-reconcile-test-'));
    process.chdir(tmpDir);
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(execFile).mockReset();
  });

  afterEach(async () => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    process.chdir(originalCwd);
    await fsp.rm(tmpDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('[REQ-POST-UPDATE] runs the lockfile reconcile once after a successful apply', async () => {
    /** @story prompts/011.0-DEV-AUTO-UPDATE.md REQ-POST-UPDATE */
    const pkg = { name: 'test', version: '1.0.0', devDependencies: { typescript: '5.9.3' } };
    await fsp.writeFile('package.json', JSON.stringify(pkg, null, 2), 'utf8');
    /** @type {Array<[string, string, string, string, number|string, string]>} */
    const safeRows = [['typescript', '5.9.3', '5.9.3', '5.10.0', 14, 'dev']];
    const reconcile = vi.fn().mockResolvedValue(undefined);

    await updatePackages(safeRows, true, summary, { reconcile });

    expect(reconcile).toHaveBeenCalledTimes(1);
  });

  it('[REQ-POST-UPDATE] does NOT reconcile when there are no safe updates', async () => {
    /** @story prompts/011.0-DEV-AUTO-UPDATE.md REQ-POST-UPDATE */
    const reconcile = vi.fn().mockResolvedValue(undefined);

    await updatePackages([], true, summary, { reconcile });

    expect(reconcile).not.toHaveBeenCalled();
  });

  it('[REQ-POST-UPDATE] reconcileLockfile spawns npm install --ignore-scripts --package-lock-only', async () => {
    /** @story prompts/011.0-DEV-AUTO-UPDATE.md REQ-POST-UPDATE */
    await fsp.writeFile('package-lock.json', '{}', 'utf8');
    vi.mocked(execFile).mockImplementation((_cmd, _args, _opts, cb) => cb(null, '', ''));

    await reconcileLockfile();

    expect(execFile).toHaveBeenCalledTimes(1);
    const [cmd, args] = vi.mocked(execFile).mock.calls[0];
    expect(cmd).toBe('npm');
    expect(args).toEqual(expect.arrayContaining(['install', '--ignore-scripts', '--package-lock-only']));
  });

  it('[REQ-POST-UPDATE] reconcileLockfile fails loud — rejects on npm error', async () => {
    /** @story prompts/011.0-DEV-AUTO-UPDATE.md REQ-POST-UPDATE */
    await fsp.writeFile('package-lock.json', '{}', 'utf8');
    const npmErr = new Error('npm ERR! ERESOLVE');
    vi.mocked(execFile).mockImplementation((_cmd, _args, _opts, cb) => cb(npmErr, '', 'npm ERR! ERESOLVE'));

    await expect(reconcileLockfile()).rejects.toThrow(/ERESOLVE|npm/);
  });
});
