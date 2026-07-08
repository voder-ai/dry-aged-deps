/**
 * @file Tests for P028 / ADR-0022 / RFC-004: flag and skip un-landable updates.
 *
 * `computeUnlandable()` splits the safe target set into landable vs
 * `incompatible-peers` using npm's real resolver (an injectable `probe`), and
 * `probeResolve()` classifies an npm run as clean / ERESOLVE / fail-loud.
 *
 * Co-located beside src/compute-unlandable.js per ADR-0020.
 *
 * @supports prompts/019.0-DEV-FLAG-UN-LANDABLE-UPDATES.md REQ-UNLANDABLE-DETECT REQ-UNLANDABLE-ISOLATE REQ-UNLANDABLE-REASON REQ-UNLANDABLE-FAIL-LOUD REQ-UNLANDABLE-NO-FORCE
 * @see docs/decisions/0022-update-flags-and-skips-un-landable-updates-via-npm-resolver-bisect.proposed.md
 * @see docs/rfcs/RFC-004-flag-and-skip-un-landable-updates.proposed.md
 * @see docs/problems/known-error/028-update-should-flag-and-skip-un-landable-updates-incompatible-peers.md
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';
import os from 'os';
import { promises as fsp } from 'fs';
import { execFile } from 'child_process';
import { computeUnlandable, probeResolve } from './compute-unlandable.js';

vi.mock('child_process', () => ({ execFile: vi.fn() }));

const pkgData = { name: 'host', version: '1.0.0', devDependencies: { vite: '7.0.0', eslint: '10.4.0' } };
/** @type {Array<[string, string, string, string, number|string, string]>} */
const rows = [
  ['vite', '7.0.0', '7.0.0', '8.0.0', 30, 'dev'],
  ['eslint', '10.4.0', '10.4.0', '10.6.0', 14, 'dev'],
];

describe('Story 019.0-DEV-FLAG-UN-LANDABLE-UPDATES: computeUnlandable / probeResolve (P028, ADR-0022)', () => {
  describe('computeUnlandable (isolation logic, injected probe)', () => {
    it('[REQ-UNLANDABLE-DETECT] clean batch → all landable, probes once', async () => {
      /** @story prompts/019.0-DEV-FLAG-UN-LANDABLE-UPDATES.md REQ-UNLANDABLE-DETECT */
      const probe = vi.fn().mockResolvedValue(null);
      const result = await computeUnlandable(rows, pkgData, { probe });
      expect(result.landable).toEqual(rows);
      expect(result.unlandable).toEqual([]);
      expect(probe).toHaveBeenCalledTimes(1);
    });

    it('[REQ-UNLANDABLE-ISOLATE] isolates the one ERESOLVE culprit; the rest land', async () => {
      /** @story prompts/019.0-DEV-FLAG-UN-LANDABLE-UPDATES.md REQ-UNLANDABLE-ISOLATE */
      // full batch ERESOLVEs; vite alone ERESOLVEs; eslint alone is clean; remainder [eslint] clean.
      const probe = vi.fn(async (_pkg, set) => {
        const names = set.map((r) => r[0]);
        if (names.includes('vite')) return 'npm error code ERESOLVE ...';
        return null;
      });
      const result = await computeUnlandable(rows, pkgData, { probe });
      expect(result.landable.map((r) => r[0])).toEqual(['eslint']);
      expect(result.unlandable).toEqual([
        { name: 'vite', current: '7.0.0', latest: '8.0.0', reason: 'incompatible-peers' },
      ]);
    });

    it('[REQ-UNLANDABLE-ISOLATE] combination conflict (no single culprit) → conservatively flags the remainder', async () => {
      /** @story prompts/019.0-DEV-FLAG-UN-LANDABLE-UPDATES.md REQ-UNLANDABLE-ISOLATE */
      // full batch ERESOLVEs; each row alone is clean; but the remainder-as-a-set still ERESOLVEs.
      let call = 0;
      const probe = vi.fn(async (_pkg, set) => {
        call += 1;
        if (call === 1) return 'ERESOLVE'; // full batch
        if (set.length === 1) return null; // each row alone is fine
        return 'ERESOLVE'; // remainder-as-a-set still conflicts
      });
      const result = await computeUnlandable(rows, pkgData, { probe });
      expect(result.landable).toEqual([]);
      expect(result.unlandable.map((r) => r.name).sort()).toEqual(['eslint', 'vite']);
      expect(result.unlandable.every((r) => r.reason === 'incompatible-peers')).toBe(true);
    });

    it('[REQ-UNLANDABLE-DETECT] empty safe set → empty result, no probe', async () => {
      /** @story prompts/019.0-DEV-FLAG-UN-LANDABLE-UPDATES.md REQ-UNLANDABLE-DETECT */
      const probe = vi.fn();
      const result = await computeUnlandable([], pkgData, { probe });
      expect(result).toEqual({ landable: [], unlandable: [] });
      expect(probe).not.toHaveBeenCalled();
    });

    it('[REQ-UNLANDABLE-FAIL-LOUD] a non-ERESOLVE probe error propagates (fail-loud)', async () => {
      /** @story prompts/019.0-DEV-FLAG-UN-LANDABLE-UPDATES.md REQ-UNLANDABLE-FAIL-LOUD */
      const probe = vi.fn().mockRejectedValue(new Error('npm error code EACCES'));
      await expect(computeUnlandable(rows, pkgData, { probe })).rejects.toThrow(/EACCES/);
    });
  });

  describe('probeResolve (npm classification)', () => {
    let tmpDir;
    let originalCwd;
    beforeEach(async () => {
      originalCwd = process.cwd();
      tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'p028-probe-test-'));
      process.chdir(tmpDir);
      await fsp.writeFile('package.json', JSON.stringify(pkgData, null, 2), 'utf8');
      vi.mocked(execFile).mockReset();
    });
    afterEach(async () => {
      process.chdir(originalCwd);
      await fsp.rm(tmpDir, { recursive: true, force: true });
      vi.restoreAllMocks();
    });

    it('[REQ-UNLANDABLE-DETECT] clean npm run → resolves null', async () => {
      /** @story prompts/019.0-DEV-FLAG-UN-LANDABLE-UPDATES.md REQ-UNLANDABLE-DETECT */
      vi.mocked(execFile).mockImplementation((_c, _a, _o, cb) => cb(null, '', ''));
      await expect(probeResolve(pkgData, rows)).resolves.toBeNull();
    });

    it('[REQ-UNLANDABLE-DETECT] ERESOLVE npm error → resolves the error text (not throw)', async () => {
      /** @story prompts/019.0-DEV-FLAG-UN-LANDABLE-UPDATES.md REQ-UNLANDABLE-DETECT */
      vi.mocked(execFile).mockImplementation((_c, _a, _o, cb) =>
        cb(new Error('exit 1'), '', 'npm error code ERESOLVE\nnpm error unable to resolve dependency tree')
      );
      await expect(probeResolve(pkgData, rows)).resolves.toMatch(/ERESOLVE/);
    });

    it('[REQ-UNLANDABLE-FAIL-LOUD] non-ERESOLVE npm error → throws', async () => {
      /** @story prompts/019.0-DEV-FLAG-UN-LANDABLE-UPDATES.md REQ-UNLANDABLE-FAIL-LOUD */
      vi.mocked(execFile).mockImplementation((_c, _a, _o, cb) =>
        cb(new Error('exit 1'), '', 'npm error code EACCES: permission denied')
      );
      await expect(probeResolve(pkgData, rows)).rejects.toThrow(/EACCES/);
    });

    it('[REQ-UNLANDABLE-NO-FORCE] never passes --force / --legacy-peer-deps', async () => {
      /** @story prompts/019.0-DEV-FLAG-UN-LANDABLE-UPDATES.md REQ-UNLANDABLE-NO-FORCE */
      vi.mocked(execFile).mockImplementation((_c, _a, _o, cb) => cb(null, '', ''));
      await probeResolve(pkgData, rows);
      const args = vi.mocked(execFile).mock.calls[0][1];
      expect(args).toContain('--package-lock-only');
      expect(args).toContain('--ignore-scripts');
      expect(args).not.toContain('--force');
      expect(args).not.toContain('--legacy-peer-deps');
    });
  });
});
