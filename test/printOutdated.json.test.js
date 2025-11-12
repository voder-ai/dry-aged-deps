// Story: docs/decisions/0002-json-xml-output-support.md
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
    const options = {
      format: 'json',
      prodMinAge: 7,
      devMinAge: 8,
      prodMinSeverity: 'low',
      devMinSeverity: 'high',
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
    expect(obj.packages).toEqual([
      { name: 'pkg1', current: '1.0.0', wanted: '1.1.0', latest: '1.1.0', age: null },
      { name: 'pkg2', current: '2.0.0', wanted: '2.2.0', latest: '2.2.0', age: null },
    ]);

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