/**
/** @story prompts/dry-aged-deps-user-story-map.md */

* @req UNKNOWN - TODO: specify requirement ID and description
/**
 * @story prompts/dry-aged-deps-user-story-map.md
 *//**
 * @story prompts/dry-aged-deps-user-story-map.md
 */ // Tests for: prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md

import { describe, it, expect, vi } from 'vitest';
import { filterBySecurity } from '../src/filter-by-security.js';

// Story: prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
// Acceptance Criteria: On error in table format, logs warning and treats package as safe

describe('filterBySecurity error handling in table format', () => {
  it('logs warning to console.error when checkVulnerabilities throws in table format', async () => {
    const rows = [['pkgError', '1.0.0', '1.1.0', '1.1.0', 5, 'prod']];
    // stub that throws an error
    const stubCheckVuln = async () => {
      throw new Error('audit failure');
    };
    // spy on console.error
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const thresholds = { prodMinSeverity: 'none', devMinSeverity: 'none' };

    const { safeRows, vulnMap, filterReasonMap } = await filterBySecurity(rows, stubCheckVuln, thresholds, 'table');

    // Should include the package as safe
    expect(safeRows).toEqual(rows);
    // Should record a vulnMap entry with zero vulnerabilities
    const info = vulnMap.get('pkgError');
    expect(info).toBeDefined();
    expect(info.count).toBe(0);
    expect(info.maxSeverity).toBe('none');
    // Should not set a filter reason
    expect(filterReasonMap.has('pkgError')).toBe(false);
    // Should log a warning message containing package name and error
    expect(errorSpy).toHaveBeenCalled();
    const logged = errorSpy.mock.calls[0][0];
    expect(logged).toContain('Warning: failed to check vulnerabilities for pkgError@1.1.0');

    errorSpy.mockRestore();
  });
});
