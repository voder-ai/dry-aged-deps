/** @story prompts/dry-aged-deps-user-story-map.md */
/**
 * @story prompts/dry-aged-deps-user-story-map.md
 *//**
 * @story prompts/dry-aged-deps-user-story-map.md
 */ // Story: prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
// Tests for smart-search fallback logic in filterBySecurity

import { describe, it, expect } from 'vitest';
import { filterBySecurity } from '../src/filter-by-security.js';

// Stub fetchVersionTimes returns a mapping of version -> publish time
const stubFetchVersionTimes = async (pkg) => ({
  '1.3.0': '2025-11-10T00:00:00.000Z',
  '1.2.0': '2025-11-05T00:00:00.000Z',
  '1.1.0': '2025-10-01T00:00:00.000Z',
});

// Stub calculateAgeInDays always returns fixed age
const stubCalculateAgeInDays = () => 42;

describe('filterBySecurity smart-search fallback', () => {
  it('falls back to next-newest safe version when latest mature version is vulnerable', async () => {
    const rows = [['pkg1', '1.0.0', '1.3.0', '1.3.0', 30, 'prod']];
    // Simulate vulnerability for 1.3.0, safe for 1.2.0
    const checkVuln = async (name, version) => {
      if (version === '1.3.0') return 1; // vulnerable
      return 0; // safe for others
    };

    const { safeRows, vulnMap, filterReasonMap } = await filterBySecurity(
      rows,
      checkVuln,
      { prodMinSeverity: 'none', devMinSeverity: 'none' },
      'table',
      { fetchVersionTimes: stubFetchVersionTimes, calculateAgeInDays: stubCalculateAgeInDays }
    );

    // Recommended version should be 1.2.0 with stub age
    expect(safeRows).toEqual([['pkg1', '1.0.0', '1.3.0', '1.2.0', 42, 'prod']]);
    expect(filterReasonMap.has('pkg1')).toBe(false);
    // vulnMap should reflect the safe version check
    expect(vulnMap.get('pkg1')).toEqual({ count: 0, maxSeverity: 'none', details: [] });
  });

  it('indicates no safe version when all mature versions are vulnerable', async () => {
    const rows = [['pkg2', '2.0.0', '2.3.0', '2.3.0', 30, 'dev']];
    // All versions vulnerable
    const checkVuln = async () => 2;

    const { safeRows, vulnMap, filterReasonMap } = await filterBySecurity(
      rows,
      checkVuln,
      { prodMinSeverity: 'none', devMinSeverity: 'none' },
      'json',
      { fetchVersionTimes: stubFetchVersionTimes, calculateAgeInDays: stubCalculateAgeInDays }
    );

    expect(safeRows).toEqual([]);
    expect(filterReasonMap.get('pkg2')).toBe('security');
    expect(vulnMap.get('pkg2')).toEqual({ count: 0, maxSeverity: 'none', details: [] });
  });
});
