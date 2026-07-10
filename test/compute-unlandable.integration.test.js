/**
 * @file Real-npm integration test for P028 / ADR-0022 landability detection.
 *
 * The unit tests (src/compute-unlandable.test.js) mock the probe; the wiring
 * tests (src/print-outdated.landability.test.js) inject the resolver. This test
 * exercises the REAL `probeResolve` / `computeUnlandable` against a real, clean
 * dependency graph (this repo) to prove the default-ON CLI probe does NOT
 * false-positive — a landable safe set must resolve cleanly and stay landable,
 * so `--check`'s exit-1 count is never wrongly reduced (the impact-4 scenario).
 *
 * Lives in test/ (not co-located) per ADR-0020: it is a real-subprocess
 * integration test, not a unit paired with the module.
 *
 * @supports prompts/019.0-DEV-FLAG-UN-LANDABLE-UPDATES.md REQ-UNLANDABLE-DETECT REQ-UNLANDABLE-ISOLATE
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { probeResolve, computeUnlandable } from '../src/compute-unlandable.js';

// Real npm resolves can take a few seconds.
const TIMEOUT = 60_000;

describe('Story 019.0-DEV-FLAG-UN-LANDABLE-UPDATES: real-npm landability (P028 integration)', () => {
  const pkgData = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

  it(
    '[REQ-UNLANDABLE-DETECT] real probe on this clean repo resolves cleanly (null) — no false-positive',
    async () => {
      /** @story prompts/019.0-DEV-FLAG-UN-LANDABLE-UPDATES.md REQ-UNLANDABLE-DETECT */
      // Empty row set = resolve the manifest as-is against the committed lockfile.
      const result = await probeResolve(pkgData, []);
      expect(result).toBeNull();
    },
    TIMEOUT
  );

  it(
    '[REQ-UNLANDABLE-ISOLATE] computeUnlandable keeps a landable set landable via the real resolver',
    async () => {
      /** @story prompts/019.0-DEV-FLAG-UN-LANDABLE-UPDATES.md REQ-UNLANDABLE-ISOLATE */
      // A no-op "bump" (latest === current) applied to a real devDependency: the
      // graph still resolves, so the row must come back landable, never flagged.
      const [name, current] = Object.entries(pkgData.devDependencies)[0];
      /** @type {Array<[string, string, string, string, number, string]>} */
      const rows = [[name, current, current, current, 30, 'dev']];
      const { landable, unlandable } = await computeUnlandable(rows, pkgData);
      expect(unlandable).toEqual([]);
      expect(landable).toEqual(rows);
    },
    TIMEOUT
  );
});
