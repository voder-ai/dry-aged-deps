/**
 * Tests for applyFilters. Originally an integration test under `test/`;
 * relocated here per ADR-0020 co-location to satisfy P020 strict stem-match
 * for the RFC-002 T4 wire (exposureModifierByPackage pass-through to
 * filterByAge).
 *
 * @supports prompts/003.0-DEV-IDENTIFY-OUTDATED.md REQ-AGE-THRESHOLD
 * @supports prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md REQ-AUDIT-CHECK
 * @supports prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md REQ-EXPOSURE-PER-PACKAGE-APPLY REQ-EXPOSURE-OFF-BY-DEFAULT-PRESERVED
 */
import { describe, it, expect } from 'vitest';
import { applyFilters } from './apply-filters.js';

const noVulns = async () => ({});

describe('Story 018.0-DEV-EXPOSURE-AWARE-SOAK: applyFilters threads exposureModifierByPackage (RFC-002 T4)', () => {
  it('[REQ-EXPOSURE-PER-PACKAGE-APPLY] passes exposureModifierByPackage through to filterByAge so a Critical-band package with a 2-day-old fix joins safeRows', async () => {
    const rows = [
      ['critical-pkg', '1.0.0', '1.1.0', '1.1.0', 2, 'prod'], // 2 days old; default soak would filter
      ['untouched', '1.0.0', '1.1.0', '1.1.0', 2, 'prod'], // 2 days old; no modifier → filtered
    ];
    const exposureModifierByPackage = new Map([['critical-pkg', 0]]);
    const result = await applyFilters(rows, {
      prodMinAge: 7,
      devMinAge: 7,
      prodMinSeverity: 'none',
      devMinSeverity: 'none',
      checkVulnerabilities: noVulns,
      format: 'table',
      exposureModifierByPackage,
    });
    expect(result.safeRows.map((r) => r[0])).toEqual(['critical-pkg']);
    expect(result.summary.safeUpdates).toBe(1);
    expect(result.summary.filteredByAge).toBe(1);
  });

  it('[REQ-EXPOSURE-OFF-BY-DEFAULT-PRESERVED] omitted exposureModifierByPackage preserves default unconditional soak behaviour', async () => {
    const rows = [
      ['critical-pkg', '1.0.0', '1.1.0', '1.1.0', 2, 'prod'],
      ['mature', '1.0.0', '1.1.0', '1.1.0', 10, 'prod'],
    ];
    const result = await applyFilters(rows, {
      prodMinAge: 7,
      devMinAge: 7,
      prodMinSeverity: 'none',
      devMinSeverity: 'none',
      checkVulnerabilities: noVulns,
      format: 'table',
    });
    expect(result.safeRows.map((r) => r[0])).toEqual(['mature']);
    expect(result.summary.safeUpdates).toBe(1);
    expect(result.summary.filteredByAge).toBe(1);
  });
});
