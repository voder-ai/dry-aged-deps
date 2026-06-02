/**
 * Canonical test file for src/print-outdated-utils.js (P020 stem-match registration).
 * Table-section tests for printOverridesHygieneSection (RFC-001 T5).
 *
 * Mirrors the printUnfixableSection precedent: appended section, space-aligned
 * columns, skip-when-empty. Column shape per REQ-OVERRIDES-TABLE.
 *
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-TABLE REQ-OVERRIDES-REASON-TAXONOMY
 * @supports prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md REQ-EXPOSURE-REPORT-MODIFIED REQ-EXPOSURE-REASON-VOCABULARY REQ-EXPOSURE-OFF-BY-DEFAULT-PRESERVED
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { handleTableOutput, printOverridesHygieneSection } from './print-outdated-utils.js';

describe('Story 017.0-DEV-OVERRIDES-HYGIENE: printOverridesHygieneSection', () => {
  afterEach(() => vi.restoreAllMocks());

  /** @story prompts/017.0-DEV-OVERRIDES-HYGIENE.md */
  function capture(findings) {
    const logs = [];
    vi.spyOn(console, 'log').mockImplementation((...a) => logs.push(a.join(' ')));
    printOverridesHygieneSection(findings);
    return logs;
  }

  /** @story prompts/017.0-DEV-OVERRIDES-HYGIENE.md */
  const braceFinding = {
    name: 'brace-expansion',
    pinned: '^4.0.1',
    latest: '5.0.6',
    ageDays: 515,
    reason: 'stale-and-vulnerable: 515 days behind, GHSA-f886-m6hf-6m8v',
    advisories: [{ id: 'GHSA-f886-m6hf-6m8v', severity: 'moderate', patchedRange: '>=5.0.5' }],
    safeUpgrade: '5.0.6',
  };

  it('[REQ-OVERRIDES-TABLE] prints the section header followed by the spec-fixed column header row', () => {
    const logs = capture([braceFinding]);
    expect(logs).toContain('Override hygiene:');
    // The column header contains "Pinned" — disambiguates from the section
    // header line that also starts with "Override".
    const header = logs.find((l) => l.includes('Pinned') && l.includes('Latest'));
    expect(header).toBeDefined();
    // Spec-fixed columns: Override | Pinned | Latest | Age | Reason | Safe Upgrade.
    for (const col of ['Override', 'Pinned', 'Latest', 'Age', 'Reason', 'Safe Upgrade']) {
      expect(header).toContain(col);
    }
  });

  it('[REQ-OVERRIDES-TABLE] renders one row per finding with the spec field values', () => {
    const logs = capture([braceFinding]);
    const row = logs.find((l) => l.startsWith('brace-expansion'));
    expect(row).toBeDefined();
    expect(row).toContain('^4.0.1');
    expect(row).toContain('5.0.6');
    expect(row).toContain('515');
    expect(row).toContain('stale-and-vulnerable');
    expect(row).toContain('GHSA-f886-m6hf-6m8v');
  });

  it('[REQ-OVERRIDES-TABLE] columns are space-aligned (header and rows share column starts)', () => {
    const logs = capture([
      braceFinding,
      {
        name: 'a-very-long-package-name',
        pinned: '1.2.0',
        latest: '1.3.0',
        ageDays: 849,
        reason: 'stale: 849 days behind latest',
        advisories: [],
        safeUpgrade: '1.3.0',
      },
    ]);
    const header = logs.find((l) => l.includes('Pinned') && l.includes('Latest'));
    const longRow = logs.find((l) => l.startsWith('a-very-long-package-name'));
    const shortRow = logs.find((l) => l.startsWith('brace-expansion'));
    const pinnedCol = header.indexOf('Pinned');
    expect(longRow.indexOf('1.2.0')).toBe(pinnedCol);
    expect(shortRow.indexOf('^4.0.1')).toBe(pinnedCol);
  });

  it('[REQ-OVERRIDES-TABLE] null fields render as "-" rather than literal "null"', () => {
    const logs = capture([
      {
        name: 'broken-pkg',
        pinned: null,
        latest: null,
        ageDays: null,
        reason: 'pin-to-malformed-entry',
        advisories: [],
        safeUpgrade: null,
      },
    ]);
    const row = logs.find((l) => l.startsWith('broken-pkg'));
    expect(row).toBeDefined();
    expect(row).not.toContain('null');
    expect(row).toContain('pin-to-malformed-entry');
    expect(row).toContain('-');
  });

  it('[REQ-OVERRIDES-TABLE] prints nothing when there are no findings', () => {
    expect(capture([])).toHaveLength(0);
    expect(capture(undefined)).toHaveLength(0);
  });
});

describe('Story 018.0-DEV-EXPOSURE-AWARE-SOAK: handleTableOutput viaExposureModifier rendering (RFC-002 T5)', () => {
  let logs;

  function setup() {
    logs = [];
    vi.spyOn(console, 'log').mockImplementation((line) => logs.push(String(line)));
  }

  afterEach(() => vi.restoreAllMocks());

  /** @story prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md */
  const baseInputs = {
    matureRows: [
      ['critical-pkg', '1.0.0', '1.0.5', '1.0.5', 2, 'prod'],
      ['benign-pkg', '2.0.0', '2.1.0', '2.1.0', 10, 'prod'],
    ],
    safeRows: [
      ['critical-pkg', '1.0.0', '1.0.5', '1.0.5', 2, 'prod'],
      ['benign-pkg', '2.0.0', '2.1.0', '2.1.0', 10, 'prod'],
    ],
    summary: { totalOutdated: 2, safeUpdates: 2, filteredByAge: 0, filteredBySecurity: 0 },
    prodMinAge: 7,
    devMinAge: 7,
    returnSummary: false,
  };

  it('[REQ-EXPOSURE-REPORT-MODIFIED] appends " *" to the latest column on rows whose name is in the annotation map', () => {
    setup();
    const viaExposureModifierByPackage = new Map([
      ['critical-pkg', { severity: 'critical', baseSoakDays: 7, effectiveSoakDays: 0, advisories: [] }],
    ]);
    handleTableOutput({ ...baseInputs, viaExposureModifierByPackage });
    const annotatedRow = logs.find((l) => l.startsWith('critical-pkg'));
    const benignRow = logs.find((l) => l.startsWith('benign-pkg'));
    expect(annotatedRow).toBeDefined();
    expect(annotatedRow.split('\t')[3]).toBe('1.0.5 *');
    expect(benignRow.split('\t')[3]).toBe('2.1.0');
  });

  it('[REQ-EXPOSURE-REASON-VOCABULARY] emits the critical footnote when a critical row is annotated', () => {
    setup();
    const viaExposureModifierByPackage = new Map([
      ['critical-pkg', { severity: 'critical', baseSoakDays: 7, effectiveSoakDays: 0, advisories: [] }],
    ]);
    handleTableOutput({ ...baseInputs, viaExposureModifierByPackage });
    expect(logs).toContain('* via exposure modifier: critical → 0-day floor');
  });

  it('[REQ-EXPOSURE-REASON-VOCABULARY] emits the high footnote with the effective soak days when a high row is annotated', () => {
    setup();
    const viaExposureModifierByPackage = new Map([
      ['critical-pkg', { severity: 'high', baseSoakDays: 7, effectiveSoakDays: 3, advisories: [] }],
    ]);
    handleTableOutput({ ...baseInputs, viaExposureModifierByPackage });
    expect(logs).toContain('* via exposure modifier: high → halved soak (3d)');
  });

  it('[REQ-EXPOSURE-REASON-VOCABULARY] dedupes footnotes when multiple rows share the same severity / effective-soak pair', () => {
    setup();
    const viaExposureModifierByPackage = new Map([
      ['critical-pkg', { severity: 'critical', baseSoakDays: 7, effectiveSoakDays: 0, advisories: [] }],
      ['benign-pkg', { severity: 'critical', baseSoakDays: 7, effectiveSoakDays: 0, advisories: [] }],
    ]);
    handleTableOutput({ ...baseInputs, viaExposureModifierByPackage });
    const footnotes = logs.filter((l) => l === '* via exposure modifier: critical → 0-day floor');
    expect(footnotes).toHaveLength(1);
  });

  it('[REQ-EXPOSURE-OFF-BY-DEFAULT-PRESERVED] omits star markers and footnotes when the annotation map is absent', () => {
    setup();
    handleTableOutput({ ...baseInputs });
    const annotatedRow = logs.find((l) => l.startsWith('critical-pkg'));
    expect(annotatedRow).toBeDefined();
    expect(annotatedRow.split('\t')[3]).toBe('1.0.5');
    expect(logs.some((l) => l.includes('via exposure modifier'))).toBe(false);
  });

  it('[REQ-EXPOSURE-OFF-BY-DEFAULT-PRESERVED] omits star markers and footnotes when the annotation map is empty', () => {
    setup();
    handleTableOutput({ ...baseInputs, viaExposureModifierByPackage: new Map() });
    const annotatedRow = logs.find((l) => l.startsWith('critical-pkg'));
    expect(annotatedRow.split('\t')[3]).toBe('1.0.5');
    expect(logs.some((l) => l.includes('via exposure modifier'))).toBe(false);
  });
});
