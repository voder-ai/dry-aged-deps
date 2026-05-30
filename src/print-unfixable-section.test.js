/**
 * Tests for the table rendering of the unfixable section: grouping by package
 * and column alignment.
 * @supports prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md REQ-UNFIXABLE-TABLE
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { printUnfixableSection } from './print-outdated-utils.js';

describe('Story 016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES: printUnfixableSection', () => {
  afterEach(() => vi.restoreAllMocks());

  /** @story prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md */
  function capture(unfixable) {
    const logs = [];
    vi.spyOn(console, 'log').mockImplementation((...a) => logs.push(a.join(' ')));
    printUnfixableSection(unfixable);
    return logs;
  }

  it("[REQ-UNFIXABLE-TABLE] groups a package's advisories into a single row", () => {
    const logs = capture([
      {
        name: 'brace-expansion',
        severity: 'moderate',
        advisory: 'GHSA-f886-m6hf-6m8v',
        reason: 'vulnerable transitive dependency',
      },
      {
        name: 'brace-expansion',
        severity: 'moderate',
        advisory: 'GHSA-jxxr-4gwj-5jf2',
        reason: 'vulnerable transitive dependency',
      },
    ]);
    const dataRows = logs.filter((l) => l.includes('brace-expansion'));
    expect(dataRows).toHaveLength(1);
    expect(dataRows[0]).toContain('GHSA-f886-m6hf-6m8v, GHSA-jxxr-4gwj-5jf2');
  });

  it('[REQ-UNFIXABLE-TABLE] columns are space-aligned (header and rows share column starts)', () => {
    const logs = capture([
      { name: 'a-very-long-package-name', severity: 'low', advisory: 'GHSA-x', reason: 'no patched version' },
      { name: 'short', severity: 'critical', advisory: 'GHSA-y', reason: 'no patched version' },
    ]);
    const header = logs.find((l) => l.startsWith('Name'));
    const longRow = logs.find((l) => l.startsWith('a-very-long-package-name'));
    const shortRow = logs.find((l) => l.startsWith('short'));
    // The Severity column must start at the same offset in every line.
    const sevCol = header.indexOf('Severity');
    expect(longRow.indexOf('low')).toBe(sevCol);
    expect(shortRow.indexOf('critical')).toBe(sevCol);
  });

  it('[REQ-UNFIXABLE-TABLE] uses the highest severity when grouping a package', () => {
    const logs = capture([
      { name: 'pkg', severity: 'low', advisory: 'A', reason: 'r' },
      { name: 'pkg', severity: 'high', advisory: 'B', reason: 'r' },
    ]);
    const row = logs.find((l) => l.startsWith('pkg'));
    expect(row).toContain('high');
    expect(row).not.toContain('low');
  });

  it('[REQ-UNFIXABLE-TABLE] prints nothing when there are no unfixable rows', () => {
    expect(capture([])).toHaveLength(0);
  });
});
