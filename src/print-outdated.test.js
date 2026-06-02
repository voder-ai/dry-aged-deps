/**
 * Tests for RFC-001 T4 — wires runOverridesHygiene into the printOutdated pipeline.
 *
 * Lives at the canonical `print-outdated.test.js` path so the TDD hook pairs
 * it with `print-outdated.js` for the T4 edit cycle (the older `printOutdated.*`
 * variant tests don't satisfy the strict stem-match pairing).
 *
 * T4 scope is the wire only — the formatters do NOT render the findings in T4.
 * Render (table / JSON / XML) lands in T5 (extends handleJsonOutput / handleXmlOutput
 * / handleTableOutput call-sites to thread the captured findings).
 *
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-PIPELINE-WIRE REQ-OVERRIDES-DEFAULT-ON
 * @supports prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md REQ-EXPOSURE-PER-PACKAGE-APPLY REQ-EXPOSURE-OFF-BY-DEFAULT-PRESERVED
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { printOutdated } from './print-outdated.js';
import * as loadModule from './load-package-json.js';

describe('Story 017.0-DEV-OVERRIDES-HYGIENE: printOutdated overrides-hygiene wire (RFC-001 T4)', () => {
  let logSpy;
  let errorSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('[REQ-OVERRIDES-PIPELINE-WIRE] invokes runOverridesHygieneFn with the shared audit + outdated payloads when overridesHygiene: true', async () => {
    vi.spyOn(loadModule, 'loadPackageJson').mockReturnValue({
      dependencies: {},
      devDependencies: {},
      overrides: { 'brace-expansion': '^4.0.1' },
    });

    const calls = [];
    const auditPayload = {
      vulnerabilities: {
        'brace-expansion': {
          name: 'brace-expansion',
          severity: 'moderate',
          via: [{ source: 1115543, url: 'https://github.com/advisories/GHSA-f886-m6hf-6m8v', severity: 'moderate' }],
        },
      },
    };

    await printOutdated(
      {},
      {
        overridesHygiene: true,
        unfixable: false,
        runOverridesHygieneFn: async (args) => {
          calls.push(args);
          return [];
        },
        runProjectAudit: async () => auditPayload,
        fetchVersionTimes: () => ({ '4.0.1': '2024-01-01T00:00:00Z' }),
      }
    );

    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      packageJson: { overrides: { 'brace-expansion': '^4.0.1' } },
      auditData: auditPayload,
      outdatedData: {},
    });
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('[REQ-OVERRIDES-DEFAULT-ON] skips runOverridesHygieneFn when overridesHygiene: false', async () => {
    vi.spyOn(loadModule, 'loadPackageJson').mockReturnValue({
      dependencies: {},
      devDependencies: {},
      overrides: { 'brace-expansion': '^4.0.1' },
    });

    const calls = [];
    await printOutdated(
      {},
      {
        overridesHygiene: false,
        unfixable: false,
        runOverridesHygieneFn: async (args) => {
          calls.push(args);
          return [];
        },
      }
    );

    expect(calls).toHaveLength(0);
  });

  it('[REQ-OVERRIDES-EXIT-CODE-LOGIC] surfaces overridesWithSafeUpgrade count in summary when ≥ 1 finding carries non-null safeUpgrade (RFC-001 T6)', async () => {
    vi.spyOn(loadModule, 'loadPackageJson').mockReturnValue({
      dependencies: {},
      devDependencies: {},
      overrides: { 'brace-expansion': '^4.0.1', 'other-pkg': '^1.0.0' },
    });

    const findings = [
      {
        name: 'brace-expansion',
        pinned: '^4.0.1',
        latest: '5.0.6',
        ageDays: 100,
        reason: 'stale-and-vulnerable: 100 days behind, GHSA-f886-m6hf-6m8v',
        advisories: [],
        safeUpgrade: '5.0.6',
      },
      {
        name: 'other-pkg',
        pinned: '^1.0.0',
        latest: null,
        ageDays: null,
        reason: 'pin-to-unknown-version',
        advisories: [],
        safeUpgrade: null,
      },
    ];

    const summary = await printOutdated(
      {},
      {
        format: 'json',
        returnSummary: true,
        overridesHygiene: true,
        unfixable: false,
        runOverridesHygieneFn: async () => findings,
        runProjectAudit: async () => ({ vulnerabilities: {} }),
      }
    );

    expect(summary).toHaveProperty('overridesWithSafeUpgrade');
    expect(summary.overridesWithSafeUpgrade).toBe(1);
    expect(summary.safeUpdates).toBe(0);
  });

  it('[REQ-OVERRIDES-EXIT-CODE-LOGIC] overridesWithSafeUpgrade defaults to 0 when no findings carry a safeUpgrade (RFC-001 T6)', async () => {
    vi.spyOn(loadModule, 'loadPackageJson').mockReturnValue({
      dependencies: {},
      devDependencies: {},
      overrides: {},
    });

    const summary = await printOutdated(
      {},
      {
        format: 'json',
        returnSummary: true,
        overridesHygiene: false,
        unfixable: false,
      }
    );

    expect(summary).toHaveProperty('overridesWithSafeUpgrade');
    expect(summary.overridesWithSafeUpgrade).toBe(0);
  });

  it('[REQ-EXPOSURE-PER-PACKAGE-APPLY] RFC-002 T4 opt-in: Critical-exposure fix 2 days old joins safeUpdates (0-day floor applied)', async () => {
    vi.spyOn(loadModule, 'loadPackageJson').mockReturnValue({
      dependencies: { 'critical-pkg': '^1.0.0' },
      devDependencies: {},
    });

    const summary = await printOutdated(
      { 'critical-pkg': { current: '1.0.0', wanted: '1.0.5', latest: '1.0.5' } },
      {
        format: 'json',
        returnSummary: true,
        prodMinAge: 7,
        devMinAge: 7,
        exposureAwareSoak: true,
        overridesHygiene: false,
        unfixable: false,
        fetchVersionTimes: async () => ({ '1.0.5': '2026-06-01T00:00:00Z' }),
        calculateAgeInDays: () => 2,
        checkVulnerabilities: async () => ({}),
        runProjectAudit: async () => ({
          vulnerabilities: { 'critical-pkg': { severity: 'critical' } },
        }),
      }
    );

    expect(summary.safeUpdates).toBe(1);
    expect(summary.filteredByAge).toBe(0);
  });

  it('[REQ-EXPOSURE-OFF-BY-DEFAULT-PRESERVED] RFC-002 T4 default-OFF: same Critical-exposure inputs, fix stays blocked by unconditional soak', async () => {
    vi.spyOn(loadModule, 'loadPackageJson').mockReturnValue({
      dependencies: { 'critical-pkg': '^1.0.0' },
      devDependencies: {},
    });

    const summary = await printOutdated(
      { 'critical-pkg': { current: '1.0.0', wanted: '1.0.5', latest: '1.0.5' } },
      {
        format: 'json',
        returnSummary: true,
        prodMinAge: 7,
        devMinAge: 7,
        // exposureAwareSoak omitted → default-OFF
        overridesHygiene: false,
        unfixable: false,
        fetchVersionTimes: async () => ({ '1.0.5': '2026-06-01T00:00:00Z' }),
        calculateAgeInDays: () => 2,
        checkVulnerabilities: async () => ({}),
        runProjectAudit: async () => ({
          vulnerabilities: { 'critical-pkg': { severity: 'critical' } },
        }),
      }
    );

    expect(summary.safeUpdates).toBe(0);
    expect(summary.filteredByAge).toBe(1);
  });

  it('[REQ-EXPOSURE-JSON] RFC-002 T5: JSON output carries the viaExposureModifier per-row annotation for a Critical-exposure 2-day-old fix', async () => {
    vi.spyOn(loadModule, 'loadPackageJson').mockReturnValue({
      dependencies: { 'critical-pkg': '^1.0.0' },
      devDependencies: {},
    });

    await printOutdated(
      { 'critical-pkg': { current: '1.0.0', wanted: '1.0.5', latest: '1.0.5' } },
      {
        format: 'json',
        prodMinAge: 7,
        devMinAge: 7,
        exposureAwareSoak: true,
        overridesHygiene: false,
        unfixable: false,
        fetchVersionTimes: async () => ({ '1.0.5': '2026-06-01T00:00:00Z' }),
        calculateAgeInDays: () => 2,
        checkVulnerabilities: async () => ({}),
        runProjectAudit: async () => ({
          vulnerabilities: {
            'critical-pkg': {
              severity: 'critical',
              via: [{ source: 12345, url: 'https://github.com/advisories/GHSA-aaaa-bbbb-cccc', severity: 'critical' }],
            },
          },
        }),
      }
    );

    const printed = JSON.parse(logSpy.mock.calls[0][0]);
    expect(printed.packages).toHaveLength(1);
    expect(printed.packages[0]).toHaveProperty('viaExposureModifier');
    expect(printed.packages[0].viaExposureModifier).toEqual({
      severity: 'critical',
      baseSoakDays: 7,
      effectiveSoakDays: 0,
      advisories: ['GHSA-aaaa-bbbb-cccc'],
    });
  });

  it('[REQ-EXPOSURE-OFF-BY-DEFAULT-PRESERVED] RFC-002 T5: JSON output omits viaExposureModifier under default-OFF (exposureAwareSoak absent)', async () => {
    vi.spyOn(loadModule, 'loadPackageJson').mockReturnValue({
      dependencies: { 'mature-pkg': '^1.0.0' },
      devDependencies: {},
    });

    await printOutdated(
      { 'mature-pkg': { current: '1.0.0', wanted: '1.0.5', latest: '1.0.5' } },
      {
        format: 'json',
        prodMinAge: 7,
        devMinAge: 7,
        // exposureAwareSoak omitted → default-OFF
        overridesHygiene: false,
        unfixable: false,
        fetchVersionTimes: async () => ({ '1.0.5': '2026-05-20T00:00:00Z' }),
        calculateAgeInDays: () => 14,
        checkVulnerabilities: async () => ({}),
      }
    );

    const printed = JSON.parse(logSpy.mock.calls[0][0]);
    expect(printed.packages).toHaveLength(1);
    expect(printed.packages[0]).not.toHaveProperty('viaExposureModifier');
  });

  it('[REQ-OVERRIDES-JSON] renders findings into the JSON output (T5 flip of the T4 deferred-render assertion)', async () => {
    vi.spyOn(loadModule, 'loadPackageJson').mockReturnValue({
      dependencies: {},
      devDependencies: {},
      overrides: { 'brace-expansion': '^4.0.1' },
    });

    const finding = {
      name: 'brace-expansion',
      pinned: '^4.0.1',
      latest: '5.0.6',
      ageDays: 100,
      reason: 'stale-and-vulnerable: 100 days behind, GHSA-f886-m6hf-6m8v',
      advisories: [{ id: 'GHSA-f886-m6hf-6m8v', severity: 'moderate', patchedRange: '>=4.0.0 <5.0.5' }],
      safeUpgrade: '5.0.6',
    };

    await printOutdated(
      {},
      {
        format: 'json',
        overridesHygiene: true,
        unfixable: false,
        runOverridesHygieneFn: async () => [finding],
        runProjectAudit: async () => ({ vulnerabilities: {} }),
      }
    );

    // T5 lands the formatter render — the JSON output now carries the
    // findings under the top-level `overridesHygiene` field per REQ-OVERRIDES-JSON.
    const printedJson = JSON.parse(logSpy.mock.calls[0][0]);
    expect(printedJson).toHaveProperty('overridesHygiene');
    expect(printedJson.overridesHygiene).toHaveLength(1);
    expect(printedJson.overridesHygiene[0]).toMatchObject({
      name: 'brace-expansion',
      pinned: '^4.0.1',
      latest: '5.0.6',
      safeUpgrade: '5.0.6',
    });
  });
});
