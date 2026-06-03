/**
 * RFC-002 T7 — live-case regression for the P014-originating Critical-exposure
 * scenario.
 *
 * Cross-cutting test that exercises the wired pipeline from
 * `src/exposure-soak-modifier.js` through `src/print-outdated.js`, the filter
 * stage in `src/filter-by-age.js`, and the JSON formatter. The realistic-shape
 * `npm audit --json` fixture (Critical severity + `isDirect` + `fixAvailable`
 * + `via[].source`/`url`/`range`) and the parsed JSON output are the load-bearing
 * axes the unit tests at `src/print-outdated.test.js:163-219` do NOT cover —
 * the unit layer uses the minimal `{ severity: 'critical' }` shape and reads
 * the summary via `returnSummary: true`. This file pins the boundary contract
 * at the realistic-payload + real-formatter layer.
 *
 * Placed under `test/` per ADR-0020 narrow exception for cross-module
 * integration tests; mirrors `test/cli.overrides-hygiene-regression.test.js`
 * (the RFC-001 T7 precedent — also a wired-pipeline regression spanning
 * multiple `src/` modules with no single-module pair).
 *
 * Load-bearing JTBD anchors:
 *
 *   - JTBD-006 (Trust default policy) — load-bearing on the default-OFF arm.
 *     Pins that non-opt-in users see byte-identical pre-RFC-002 behaviour;
 *     the v1 minor MUST NOT silently change the unconditional soak.
 *
 *   - JTBD-001 (See safe updates) — extended on the opt-in arm to surface
 *     the Critical-exposure fresh fix that the unconditional soak would
 *     otherwise hide.
 *
 *   - JTBD-204 (Retroactive revet) — descriptive cite for the operator
 *     journey this regression represents (a supply-chain advisory has
 *     landed against the installed version; the operator wants the fix
 *     surfaced sooner than the default soak).
 *
 * @supports prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md REQ-EXPOSURE-PER-PACKAGE-APPLY REQ-EXPOSURE-OFF-BY-DEFAULT-PRESERVED REQ-EXPOSURE-JSON REQ-EXPOSURE-REGRESSION-TEST
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { printOutdated } from '../src/print-outdated.js';
import * as loadModule from '../src/load-package-json.js';

describe('Story 018.0-DEV-EXPOSURE-AWARE-SOAK: P014 Critical-exposure live-case regression (RFC-002 T7)', () => {
  /** @type {import('vitest').MockInstance} */
  let logSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(loadModule, 'loadPackageJson').mockReturnValue({
      dependencies: { 'critical-pkg': '^1.0.0' },
      devDependencies: {},
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Realistic-shape `npm audit --json` payload — mirrors the field set the
  // tool encounters in production runs (isDirect, fixAvailable, via with
  // source + url + range). The unit tests at src/print-outdated.test.js use
  // the minimal `{ severity: 'critical' }` shape; this fixture is the T7
  // contract pin at the realistic-payload layer.
  /** @story prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md */
  const auditFixture = {
    vulnerabilities: {
      'critical-pkg': {
        name: 'critical-pkg',
        severity: 'critical',
        isDirect: true,
        fixAvailable: true,
        via: [
          {
            source: 1234567,
            url: 'https://github.com/advisories/GHSA-aaaa-bbbb-cccc',
            severity: 'critical',
            range: '<1.0.5',
          },
        ],
      },
    },
  };

  /** @story prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md */
  const outdatedFixture = {
    'critical-pkg': { current: '1.0.0', wanted: '1.0.5', latest: '1.0.5' },
  };

  /** @story prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md */
  const sharedMocks = {
    fetchVersionTimes: async () => ({ '1.0.5': '2026-06-01T00:00:00Z' }),
    calculateAgeInDays: () => 2,
    checkVulnerabilities: async () => ({}),
    runProjectAudit: async () => auditFixture,
    overridesHygiene: false,
    unfixable: false,
  };

  it('[REQ-EXPOSURE-PER-PACKAGE-APPLY] with --exposure-aware-soak, the 2-day-old Critical fix passes the age gate (0-day floor applied) and carries the viaExposureModifier annotation', async () => {
    await printOutdated(outdatedFixture, {
      format: 'json',
      prodMinAge: 7,
      devMinAge: 7,
      exposureAwareSoak: true,
      ...sharedMocks,
    });

    const printed = JSON.parse(logSpy.mock.calls[0][0]);

    expect(printed.summary.safeUpdates).toBe(1);
    expect(printed.summary.filteredByAge).toBe(0);
    expect(printed.packages).toHaveLength(1);
    expect(printed.packages[0].name).toBe('critical-pkg');
    expect(printed.packages[0]).toHaveProperty('viaExposureModifier');
    expect(printed.packages[0].viaExposureModifier).toEqual({
      severity: 'critical',
      baseSoakDays: 7,
      effectiveSoakDays: 0,
      advisories: ['GHSA-aaaa-bbbb-cccc'],
    });
  });

  it('[REQ-EXPOSURE-OFF-BY-DEFAULT-PRESERVED] WITHOUT --exposure-aware-soak (default-OFF), the same Critical-exposure fix is blocked by the unconditional soak — preserves the opt-in default contract', async () => {
    await printOutdated(outdatedFixture, {
      format: 'json',
      prodMinAge: 7,
      devMinAge: 7,
      // exposureAwareSoak omitted → default-OFF
      ...sharedMocks,
    });

    const printed = JSON.parse(logSpy.mock.calls[0][0]);

    expect(printed.summary.safeUpdates).toBe(0);
    expect(printed.summary.filteredByAge).toBe(1);
    expect(printed.packages).toHaveLength(0);
  });
});
