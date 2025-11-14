/** @story prompts/dry-aged-deps-user-story-map.md */
/**
 * @story prompts/dry-aged-deps-user-story-map.md
 *//**
 * @story prompts/dry-aged-deps-user-story-map.md
 */ // Story: prompts/008.0-DEV-JSON-OUTPUT.md
// Tests for: printOutdated JSON output branch, ensuring correct rows, summary, and thresholds are logged

import { printOutdated } from '../src/print-outdated.js';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';

describe('printOutdated unit tests - json output', () => {
  let logSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('data with two entries logs valid JSON and returns correct summary', async () => {
    const data = {
      pkg1: { current: '1.0.0', wanted: '1.1.0', latest: '1.1.0' },
      pkg2: { current: '2.0.0', wanted: '2.2.0', latest: '2.2.0' },
    };

    const fetchStub = vi.fn().mockImplementation((pkg) => {
      if (pkg === 'pkg1') return Promise.resolve({ '1.1.0': '2020-01-01T00:00:00.000Z' });
      if (pkg === 'pkg2') return Promise.resolve({ '2.2.0': '2020-02-01T00:00:00.000Z' });
      return Promise.resolve({});
    });
    const ageStub = vi.fn().mockReturnValue(10);
    const vulnStub = vi.fn().mockResolvedValue(0);

    const options = {
      format: 'json',
      prodMinAge: 7,
      devMinAge: 8,
      prodMinSeverity: 'low',
      devMinSeverity: 'high',
      fetchVersionTimes: fetchStub,
      calculateAgeInDays: ageStub,
      checkVulnerabilities: vulnStub,
    };

    const summary = await printOutdated(data, options);

    // Verify returned summary
    expect(summary).toEqual({
      totalOutdated: 2,
      safeUpdates: 2,
      filteredByAge: 0,
      filteredBySecurity: 0,
    });

    // Verify console.log called once with JSON output
    expect(logSpy).toHaveBeenCalledTimes(1);
    const output = logSpy.mock.calls[0][0];

    // Parse JSON and verify structure
    const obj = JSON.parse(output);
    expect(obj).toHaveProperty('timestamp');
    expect(Array.isArray(obj.packages)).toBe(true);
    expect(obj.packages).toHaveLength(2);

    // Verify each package entry includes all required fields
    expect(obj.packages).toHaveLength(2);
    expect(obj.packages[0]).toMatchObject({
      name: 'pkg1',
      current: '1.0.0',
      wanted: '1.1.0',
      latest: '1.1.0',
      recommended: '1.1.0',
      vulnerabilities: { count: 0, maxSeverity: 'none', details: [] },
      filtered: false,
      filterReason: '',
      type: 'dev',
    });
    expect(typeof obj.packages[0].age).toBe('number');
    expect(obj.packages[1]).toMatchObject({
      name: 'pkg2',
      current: '2.0.0',
      wanted: '2.2.0',
      latest: '2.2.0',
      recommended: '2.2.0',
      vulnerabilities: { count: 0, maxSeverity: 'none', details: [] },
      filtered: false,
      filterReason: '',
      type: 'dev',
    });
    expect(typeof obj.packages[1].age).toBe('number');

    // Verify summary and thresholds in JSON
    expect(obj.summary).toHaveProperty('totalOutdated', 2);
    expect(obj.summary).toHaveProperty('safeUpdates', 2);
    expect(obj.summary).toHaveProperty('filteredByAge', 0);
    expect(obj.summary).toHaveProperty('filteredBySecurity', 0);
    expect(obj.summary.thresholds).toEqual({
      prod: { minAge: 7, minSeverity: 'low' },
      dev: { minAge: 8, minSeverity: 'high' },
    });
  });
});
