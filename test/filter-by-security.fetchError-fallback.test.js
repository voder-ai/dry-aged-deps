/** @story prompts/dry-aged-deps-user-story-map.md */

import { describe, it, expect, vi } from 'vitest';
import { filterBySecurity } from '../src/filter-by-security.js';

// Stub checkVulnerabilities, should not be called when fetchVersionTimes errors
const stubCheckVuln = vi.fn();
const thresholds = { prodMinSeverity: 'none', devMinSeverity: 'none' };
const stubCalc = vi.fn(() => 7);

/**
 * Test fallback error handling when fetchVersionTimes throws and format is table
 */
describe('filterBySecurity fallback fetchVersionTimes error handling', () => {
  it('logs warning and uses original logic for table format', async () => {
    const rows = [['pkgX', '1.0.0', '1.2.0', '1.2.0', 5, 'prod']];
    // fetchVersionTimes throws error
    const stubFetch = async () => {
      throw new Error('fetch-time error');
    };
    // checkVuln returns safe
    const stubCheck = async (name, version) => 0;
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { safeRows, filterReasonMap, vulnMap } = await filterBySecurity(rows, stubCheck, thresholds, 'table', {
      fetchVersionTimes: stubFetch,
      calculateAgeInDays: stubCalc,
    });

    // Should log warning once
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Warning: failed to fetch version times for pkgX: fetch-time error')
    );
    // Should include original row as safe
    expect(safeRows).toEqual(rows);
    // vulnMap should reflect original logic result (count 0)
    expect(vulnMap.get('pkgX').count).toBe(0);
    // No filter reason
    expect(filterReasonMap.has('pkgX')).toBe(false);

    errorSpy.mockRestore();
  });

  it('does not log warning when fetchVersionTimes throws and format is json or xml', async () => {
    const rows = [['pkgY', '2.0.0', '2.2.0', '2.2.0', 9, 'dev']];
    const stubFetch = async () => {
      throw new Error('fail');
    };
    const stubCheck = async () => 0;
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // JSON format
    const resultJson = await filterBySecurity(rows, stubCheck, thresholds, 'json', {
      fetchVersionTimes: stubFetch,
      calculateAgeInDays: stubCalc,
    });
    expect(errorSpy).not.toHaveBeenCalled();
    expect(resultJson.safeRows).toEqual(rows);

    // XML format
    const resultXml = await filterBySecurity(rows, stubCheck, thresholds, 'xml', {
      fetchVersionTimes: stubFetch,
      calculateAgeInDays: stubCalc,
    });
    expect(errorSpy).not.toHaveBeenCalled();
    expect(resultXml.safeRows).toEqual(rows);

    errorSpy.mockRestore();
  });
});
