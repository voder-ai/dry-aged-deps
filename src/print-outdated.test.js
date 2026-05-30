/**
 * Tests for RFC-001 T4 — wires runOverridesHygiene into the printOutdated pipeline.
 *
 * Lives at the canonical `print-outdated.test.js` path so the TDD hook pairs
 * it with `print-outdated.js` for the T4 edit cycle (the older `printOutdated.*`
 * variant tests don't satisfy the strict stem-match pairing).
 *
 * T4 scope is the wire only — the formatters do NOT render the findings in T4.
 * Render (table / JSON / XML) lands in T5.
 *
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-PIPELINE-WIRE REQ-OVERRIDES-DEFAULT-ON
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

  it('[REQ-OVERRIDES-PIPELINE-WIRE] threads findings into format=json output options without rendering them in T4', async () => {
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

    // T4 explicitly defers rendering to T5 — the JSON output should NOT yet
    // contain an `overridesHygiene` key. T5 will flip this assertion.
    const printedJson = JSON.parse(logSpy.mock.calls[0][0]);
    expect(printedJson).not.toHaveProperty('overridesHygiene');
  });
});
