/**
 * Canonical test file for src/print-outdated-utils.js (P020 stem-match registration).
 * Table-section tests for printOverridesHygieneSection (RFC-001 T5).
 *
 * Mirrors the printUnfixableSection precedent: appended section, space-aligned
 * columns, skip-when-empty. Column shape per REQ-OVERRIDES-TABLE.
 *
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-TABLE REQ-OVERRIDES-REASON-TAXONOMY
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { printOverridesHygieneSection } from './print-outdated-utils.js';

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
