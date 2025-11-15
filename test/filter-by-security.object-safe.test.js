/**
/** @story prompts/dry-aged-deps-user-story-map.md */

* @req UNKNOWN - TODO: specify requirement ID and description
/**
 * @story prompts/dry-aged-deps-user-story-map.md
 *//**
 * @story prompts/dry-aged-deps-user-story-map.md
 */ // Story: prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
// Tests for: object result safe case in original one-version logic

import { describe, it, expect } from 'vitest';
import { filterBySecurity } from '../src/filter-by-security.js';

// Row data for testing
const rows = [['pkgSafe', '1.0.0', '1.2.0', '1.2.0', 5, 'prod']];
// Set high production severity threshold so moderate and low are safe
const thresholds = { prodMinSeverity: 'high', devMinSeverity: 'none' };

describe('filterBySecurity object result safe case', () => {
  it('includes package when object result has no vulnerabilities above threshold', async () => {
    const details = [
      { id: 'VULN-1', title: 'Moderate vulnerability', severity: 'moderate', cvssScore: 5, url: 'http://example.com' },
      { id: 'VULN-2', title: 'Low vulnerability', severity: 'low', cvssScore: 2, url: 'http://example.com' },
    ];
    // Stub returns object result
    const stubCheckVuln = async (name, version) => ({ count: details.length, details });

    const { safeRows, vulnMap, filterReasonMap } = await filterBySecurity(rows, stubCheckVuln, thresholds, 'table');

    // Should include the row
    expect(safeRows).toEqual(rows);
    // vulnMap should reflect details and highest severity 'moderate'
    expect(vulnMap.get('pkgSafe')).toEqual({ count: 2, maxSeverity: 'moderate', details });
    // No filterReason set
    expect(filterReasonMap.has('pkgSafe')).toBe(false);
  });
});
