import { printOutdated } from '../src/print-outdated.js';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';

describe('printOutdated unit tests - table output edge cases', () => {
  let logSpy;
  let errorSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('no data ({}), default table mode prints up-to-date message and returns undefined', async () => {
    const summary = await printOutdated({}, { format: 'table' });
    expect(summary).toBeUndefined();
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith('All dependencies are up to date.');
  });

  test('single entry below age threshold prints mature-filter message', async () => {
    const data = {
      pkgA: { current: '1.0.0', wanted: '1.1.0', latest: '1.1.0' },
    };
    // Stub fetchVersionTimes and calculateAgeInDays to return age below threshold
    const fetchStub = vi.fn().mockResolvedValue({ '1.1.0': '2020-01-01T00:00:00.000Z' });
    const ageStub = vi.fn().mockReturnValue(5);
    const summary = await printOutdated(data, {
      format: 'table',
      fetchVersionTimes: fetchStub,
      calculateAgeInDays: ageStub,
      checkVulnerabilities: vi.fn().mockResolvedValue(0),
      prodMinAge: 7,
      devMinAge: 7,
    });
    expect(summary).toBeUndefined();
    expect(logSpy).toHaveBeenCalled();
    // Should include mature version message
    expect(logSpy).toHaveBeenLastCalledWith(
      expect.stringContaining('No outdated packages with mature versions found')
    );
  });

  test('single entry above age threshold but vulnerable prints safe-filter message', async () => {
    const data = {
      pkgB: { current: '2.0.0', wanted: '2.1.0', latest: '2.1.0' },
    };
    const fetchStub = vi.fn().mockResolvedValue({ '2.1.0': '2020-01-01T00:00:00.000Z' });
    const ageStub = vi.fn().mockReturnValue(10);
    const vulnStub = vi.fn().mockResolvedValue(3);
    const summary = await printOutdated(data, {
      format: 'table',
      fetchVersionTimes: fetchStub,
      calculateAgeInDays: ageStub,
      checkVulnerabilities: vulnStub,
      prodMinAge: 7,
      devMinAge: 7,
    });
    expect(summary).toBeUndefined();
    expect(logSpy).toHaveBeenCalled();
    expect(logSpy).toHaveBeenLastCalledWith(
      expect.stringContaining('No outdated packages with safe, mature versions')
    );
  });

  test('single entry above age threshold and vulnerability check error prints row', async () => {
    const data = {
      pkgC: { current: '3.0.0', wanted: '3.1.0', latest: '3.1.0' },
    };
    const fetchStub = vi.fn().mockResolvedValue({ '3.1.0': '2020-01-01T00:00:00.000Z' });
    const ageStub = vi.fn().mockReturnValue(15);
    const vulnError = new Error('network failure');
    const vulnStub = vi.fn().mockRejectedValue(vulnError);
    await printOutdated(data, {
      format: 'table',
      fetchVersionTimes: fetchStub,
      calculateAgeInDays: ageStub,
      checkVulnerabilities: vulnStub,
      prodMinAge: 7,
      devMinAge: 7,
    });
    // For error branch, one warning and then table with header and row
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Warning: failed to check vulnerabilities for pkgC@3.1.0')
    );
    expect(logSpy).toHaveBeenCalledWith('Outdated packages:');
    expect(logSpy).toHaveBeenCalledWith(
      ['Name', 'Current', 'Wanted', 'Latest', 'Age (days)', 'Type'].join('	')
    );
    // Row: name, current, wanted, latest, age, type
    expect(logSpy).toHaveBeenCalledWith('pkgC	3.0.0	3.1.0	3.1.0	15	dev');
  });
});

describe('printOutdated unit tests - json output empty', () => {
  let logSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  test('empty data with json format prints valid JSON summary', async () => {
    const result = await printOutdated({}, { format: 'json' });
    expect(result).toEqual({
      totalOutdated: 0,
      safeUpdates: 0,
      filteredByAge: 0,
      filteredBySecurity: 0,
    });
    expect(logSpy).toHaveBeenCalledTimes(1);
    const output = logSpy.mock.calls[0][0];
    const parsed = JSON.parse(output);
    expect(parsed).toHaveProperty('timestamp');
    expect(parsed).toHaveProperty('packages');
    expect(Array.isArray(parsed.packages)).toBe(true);
    expect(parsed.packages).toHaveLength(0);
    expect(parsed.summary).toEqual({
      totalOutdated: 0,
      safeUpdates: 0,
      filteredByAge: 0,
      filteredBySecurity: 0,
      thresholds: { prod: { minAge: 7, minSeverity: 'none' }, dev: { minAge: 7, minSeverity: 'none' } },
    });
  });
});
