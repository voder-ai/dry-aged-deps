import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { printOutdated } from '../src/print-outdated.js';
import * as fetchModule from '../src/fetch-version-times.js';
import * as ageModule from '../src/age-calculator.js';

describe('printOutdated', () => {
  let logSpy, errorSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('prints up to date message when no packages are outdated', async () => {
    await printOutdated({});
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith('All dependencies are up to date.');
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('prints header and data row with calculated age', async () => {
    // Stub fetchVersionTimes to return a mapping with latest version time
    vi.spyOn(fetchModule, 'fetchVersionTimes').mockReturnValue({
      '2.0.0': '2023-01-01T00:00:00Z',
    });
    // Stub calculateAgeInDays to return a fixed value
    vi.spyOn(ageModule, 'calculateAgeInDays').mockReturnValue(10);

    const data = {
      mypkg: { current: '1.0.0', wanted: '1.5.0', latest: '2.0.0' },
    };
    await printOutdated(data, {
      fetchVersionTimes: fetchModule.fetchVersionTimes,
      calculateAgeInDays: ageModule.calculateAgeInDays,
    });

    expect(logSpy.mock.calls[0][0]).toBe('Outdated packages:');
    expect(logSpy.mock.calls[1][0]).toBe(
      ['Name', 'Current', 'Wanted', 'Latest', 'Age (days)'].join('	')
    );
    expect(logSpy.mock.calls[2][0]).toBe(
      ['mypkg', '1.0.0', '1.5.0', '2.0.0', 10].join('	')
    );
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('prints N/A when fetchVersionTimes throws', async () => {
    // Stub fetchVersionTimes to throw
    vi.spyOn(fetchModule, 'fetchVersionTimes').mockImplementation(() => {
      throw new Error('failed');
    });
    // Stub calculateAgeInDays to ensure it's not called when fetch fails
    vi.spyOn(ageModule, 'calculateAgeInDays');

    const data = {
      otherpkg: { current: '0.1.0', wanted: '0.2.0', latest: '0.3.0' },
    };
    await printOutdated(data, {
      fetchVersionTimes: fetchModule.fetchVersionTimes,
      calculateAgeInDays: ageModule.calculateAgeInDays,
    });

    // Package with N/A age should be filtered out (not mature)
    expect(logSpy.mock.calls[0][0]).toBe('Outdated packages:');
    expect(logSpy.mock.calls[1][0]).toBe(
      ['Name', 'Current', 'Wanted', 'Latest', 'Age (days)'].join('	')
    );
    expect(logSpy.mock.calls[2][0]).toBe(
      'No outdated packages with mature versions (>= 7 days old) found.'
    );
    expect(ageModule.calculateAgeInDays).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      `Warning: failed to fetch version times for otherpkg: failed`
    );
  });

  it('filters out packages with age < 7 days', async () => {
    vi.spyOn(fetchModule, 'fetchVersionTimes').mockReturnValue({
      '2.0.0': '2023-01-01T00:00:00Z',
    });
    vi.spyOn(ageModule, 'calculateAgeInDays').mockReturnValue(3); // Too fresh

    const data = {
      freshpkg: { current: '1.0.0', wanted: '1.5.0', latest: '2.0.0' },
    };
    await printOutdated(data, {
      fetchVersionTimes: fetchModule.fetchVersionTimes,
      calculateAgeInDays: ageModule.calculateAgeInDays,
    });

    expect(logSpy.mock.calls[0][0]).toBe('Outdated packages:');
    expect(logSpy.mock.calls[1][0]).toBe(
      ['Name', 'Current', 'Wanted', 'Latest', 'Age (days)'].join('	')
    );
    expect(logSpy.mock.calls[2][0]).toBe(
      'No outdated packages with mature versions (>= 7 days old) found.'
    );
  });

  it('shows only packages with age >= 7 days', async () => {
    vi.spyOn(fetchModule, 'fetchVersionTimes').mockImplementation(
      async (pkgName) => {
        if (pkgName === 'mature-pkg') {
          return { '2.0.0': '2023-01-01T00:00:00Z' };
        }
        return { '3.0.0': '2023-01-01T00:00:00Z' };
      }
    );
    vi.spyOn(ageModule, 'calculateAgeInDays').mockImplementation(() => {
      // Return different ages based on call order
      const callCount = ageModule.calculateAgeInDays.mock.calls.length;
      return callCount === 1 ? 10 : 3; // First call: mature, second call: fresh
    });

    const data = {
      'mature-pkg': { current: '1.0.0', wanted: '1.5.0', latest: '2.0.0' },
      'fresh-pkg': { current: '2.0.0', wanted: '2.5.0', latest: '3.0.0' },
    };
    await printOutdated(data, {
      fetchVersionTimes: fetchModule.fetchVersionTimes,
      calculateAgeInDays: ageModule.calculateAgeInDays,
    });

    expect(logSpy.mock.calls[0][0]).toBe('Outdated packages:');
    expect(logSpy.mock.calls[1][0]).toBe(
      ['Name', 'Current', 'Wanted', 'Latest', 'Age (days)'].join('	')
    );
    // Only the mature package should be shown
    expect(logSpy.mock.calls[2][0]).toBe(
      ['mature-pkg', '1.0.0', '1.5.0', '2.0.0', 10].join('	')
    );
    expect(logSpy.mock.calls[3]).toBeUndefined(); // fresh-pkg should be filtered out
  });
});
