/**
 * @file Wiring tests for P028 / ADR-0022 / RFC-004 T2/T3: printOutdated splits
 * un-landable updates out of safeRows (so `--check`'s safeUpdates count and the
 * JSON/table surfaces exclude them) and surfaces them as `incompatible`.
 *
 * Uses an injected `computeUnlandable` (no real npm spawn). Co-located beside
 * src/print-outdated.js per ADR-0020.
 *
 * @supports prompts/019.0-DEV-FLAG-UN-LANDABLE-UPDATES.md REQ-UNLANDABLE-DETECT REQ-UNLANDABLE-ISOLATE REQ-UNLANDABLE-REASON
 */

import { printOutdated } from './print-outdated.js';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';

const DATA = {
  pkg1: { current: '1.0.0', wanted: '1.1.0', latest: '1.1.0' },
  pkg2: { current: '2.0.0', wanted: '2.2.0', latest: '2.2.0' },
};

function baseStubs() {
  const fetchStub = vi
    .fn()
    .mockResolvedValue({ '1.1.0': '2020-01-01T00:00:00.000Z', '2.2.0': '2020-02-01T00:00:00.000Z' });
  return {
    fetchVersionTimes: fetchStub,
    calculateAgeInDays: vi.fn().mockReturnValue(30),
    checkVulnerabilities: vi.fn().mockResolvedValue(0),
  };
}

// Injected resolver: marks pkg2 un-landable, pkg1 landable.
const splitPkg2 = vi.fn(async (safeRows) => ({
  landable: safeRows.filter((r) => r[0] !== 'pkg2'),
  unlandable: safeRows
    .filter((r) => r[0] === 'pkg2')
    .map((r) => ({ name: r[0], current: r[1], latest: r[3], reason: 'incompatible-peers' })),
}));

describe('Story 019.0-DEV-FLAG-UN-LANDABLE-UPDATES: printOutdated landability wiring (P028)', () => {
  let logSpy;
  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  test('[REQ-UNLANDABLE-ISOLATE] JSON: un-landable update drops from safeUpdates and surfaces as incompatible', async () => {
    /** @story prompts/019.0-DEV-FLAG-UN-LANDABLE-UPDATES.md REQ-UNLANDABLE-ISOLATE */
    const summary = await printOutdated(DATA, {
      format: 'json',
      landableCheck: true,
      computeUnlandable: splitPkg2,
      ...baseStubs(),
    });

    expect(summary.safeUpdates).toBe(1); // pkg2 no longer counts toward --check exit-1
    const obj = JSON.parse(logSpy.mock.calls[0][0]);
    expect(obj.packages.map((p) => p.name)).toEqual(['pkg1']); // only landable rendered
    expect(obj.incompatible).toEqual([
      { name: 'pkg2', current: '2.0.0', latest: '2.2.0', reason: 'incompatible-peers' },
    ]);
  });

  test('[REQ-UNLANDABLE-REASON] table: un-landable update prints in the incompatible section', async () => {
    /** @story prompts/019.0-DEV-FLAG-UN-LANDABLE-UPDATES.md REQ-UNLANDABLE-REASON */
    await printOutdated(DATA, { format: 'table', landableCheck: true, computeUnlandable: splitPkg2, ...baseStubs() });
    const out = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(out).toContain('Updates skipped (incompatible peer dependencies):');
    expect(out).toContain('incompatible-peers');
    expect(out).toMatch(/pkg2/);
  });

  test('[REQ-UNLANDABLE-REASON] xml: un-landable update renders an additive <incompatible> section', async () => {
    /** @story prompts/019.0-DEV-FLAG-UN-LANDABLE-UPDATES.md REQ-UNLANDABLE-REASON */
    await printOutdated(DATA, { format: 'xml', landableCheck: true, computeUnlandable: splitPkg2, ...baseStubs() });
    const out = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(out).toContain('<incompatible>');
    expect(out).toMatch(/<update name="pkg2"[^>]*reason="incompatible-peers"/);
  });

  test('[REQ-UNLANDABLE-DETECT] default (landableCheck off): no split, no probe, no incompatible field', async () => {
    /** @story prompts/019.0-DEV-FLAG-UN-LANDABLE-UPDATES.md REQ-UNLANDABLE-DETECT */
    const probe = vi.fn();
    const summary = await printOutdated(DATA, { format: 'json', computeUnlandable: probe, ...baseStubs() });
    expect(probe).not.toHaveBeenCalled();
    expect(summary.safeUpdates).toBe(2);
    const obj = JSON.parse(logSpy.mock.calls[0][0]);
    expect(obj.incompatible).toBeUndefined();
  });
});
