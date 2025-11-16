/**
 * @story ??? - TODO: specify story file
 * @req UNKNOWN - TODO: specify requirement ID and description
 */

import { describe, it, expect, vi } from 'vitest';
import { filterBySecurity } from '../src/filter-by-security.js';

const rows = [['pkgA', '1.0.0', '1.2.0', '1.2.0', 15, 'prod']];
const thresholds = { prodMinSeverity: 'moderate', devMinSeverity: 'low' };

// Story: prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
// Acceptance Criteria: Filter out versions with vulnerabilities based on severity thresholds

describe('filterBySecurity object-based vulnerability results', () => {
  it('filters out package when object result has vulnerabilities above threshold and records correct info', async () => {
    const vulnDetails = [
      { id: 'VULN-1', title: 'High vulnerability', severity: 'high', cvssScore: 9, url: 'http://example.com' },
      { id: 'VULN-2', title: 'Low vulnerability', severity: 'low', cvssScore: 2, url: 'http://example.com' },
    ];
    const stubCheckVuln = async (name, version) => {
      expect(name).toBe('pkgA');
      expect(version).toBe('1.2.0');
      return { count: 2, details: vulnDetails };
    };

    const { safeRows, vulnMap, filterReasonMap } = await filterBySecurity(rows, stubCheckVuln, thresholds, 'table');
    // Package should be filtered out
    expect(safeRows).toHaveLength(0);
    // vulnMap should reflect count and highest severity
    const info = vulnMap.get('pkgA');
    expect(info).toBeDefined();
    expect(info.count).toBe(2);
    expect(info.maxSeverity).toBe('high');
    expect(Array.isArray(info.details)).toBe(true);
    expect(info.details).toEqual(vulnDetails);
    // filterReasonMap should indicate 'security'
    expect(filterReasonMap.get('pkgA')).toBe('security');
  });

  it('treats errors as safe without logging in json format', async () => {
    const stubCheckVuln = async () => {
      throw new Error('audit failure');
    };
    const spyError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { safeRows, vulnMap, filterReasonMap } = await filterBySecurity(rows, stubCheckVuln, thresholds, 'json');
    // Should include package despite error
    expect(safeRows).toEqual(rows);
    // vulnMap entry should exist with no vulnerabilities
    const info = vulnMap.get('pkgA');
    expect(info.count).toBe(0);
    expect(info.maxSeverity).toBe('none');
    // No error logged for JSON format
    expect(spyError).not.toHaveBeenCalled();

    spyError.mockRestore();
  });
});
