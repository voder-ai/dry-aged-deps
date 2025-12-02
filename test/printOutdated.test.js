/* eslint-disable traceability/valid-req-reference , traceability/valid-annotation-format */
/**
 * Unit tests for printOutdated output and filtering.
 * @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
 * @story prompts/003.0-DEV-IDENTIFY-OUTDATED.md
 * @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
 * @req REQ-PRINT-UPTODATE - Prints up-to-date message when no packages are outdated
 * @req REQ-PRINT-DATA - Prints header and data rows with calculated age and type
 * @req REQ-HANDLE-FETCHFAIL - Handles fetchVersionTimes errors with warning and N/A age
 * @req REQ-FILTER-AGE - Filters out packages younger than minAge (default 7)
 * @req REQ-FILTER-VULN - Filters out packages with vulnerabilities
 */

import { printOutdated } from '../src/print-outdated.js';
import * as fetchModule from '../src/fetch-version-times.js';
import * as ageModule from '../src/age-calculator.js';
import * as vulnModule from '../src/check-vulnerabilities.js';

describe('prompts/001.0-DEV-RUN-NPM-OUTDATED.md & prompts/003.0-DEV-IDENTIFY-OUTDATED.md & prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md: printOutdated', () => {
  let logSpy, errorSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Mock checkVulnerabilities to return 0 (no vulnerabilities) by default
    vi.spyOn(vulnModule, 'checkVulnerabilities').mockResolvedValue(0);
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
    // Mock no vulnerabilities
    vi.spyOn(vulnModule, 'checkVulnerabilities').mockResolvedValue(0);

    const data = {
      mypkg: { current: '1.0.0', wanted: '1.5.0', latest: '2.0.0' },
    };
    await printOutdated(data, {
      fetchVersionTimes: fetchModule.fetchVersionTimes,
      calculateAgeInDays: ageModule.calculateAgeInDays,
      checkVulnerabilities: vulnModule.checkVulnerabilities,
    });

    expect(logSpy.mock.calls[0][0]).toBe('Outdated packages:');
    expect(logSpy.mock.calls[1][0]).toBe(['Name', 'Current', 'Wanted', 'Latest', 'Age (days)', 'Type'].join('	'));
    expect(logSpy.mock.calls[2][0]).toBe(['mypkg', '1.0.0', '1.5.0', '2.0.0', 10, 'dev'].join('	'));
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('prints N/A when fetchVersionTimes throws', async () => {
    // Stub fetchVersionTimes to throw
    vi.spyOn(fetchModule, 'fetchVersionTimes').mockImplementation(() => {
      throw new Error('failed');
    });
    // Stub calculateAgeInDays to ensure it's not called when fetch fails
    vi.spyOn(ageModule, 'calculateAgeInDays');
    // Mock no vulnerabilities (won't be called since package is filtered)
    vi.spyOn(vulnModule, 'checkVulnerabilities').mockResolvedValue(0);

    const data = {
      otherpkg: { current: '0.1.0', wanted: '0.2.0', latest: '0.3.0' },
    };
    await printOutdated(data, {
      fetchVersionTimes: fetchModule.fetchVersionTimes,
      calculateAgeInDays: ageModule.calculateAgeInDays,
      checkVulnerabilities: vulnModule.checkVulnerabilities,
    });

    // Package with N/A age should be filtered out (not mature)
    expect(logSpy.mock.calls[0][0]).toBe('Outdated packages:');
    expect(logSpy.mock.calls[1][0]).toBe(['Name', 'Current', 'Wanted', 'Latest', 'Age (days)', 'Type'].join('	'));
    expect(logSpy.mock.calls[2][0]).toContain('No outdated packages with mature versions found');
    expect(ageModule.calculateAgeInDays).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(`Warning: failed to fetch version times for otherpkg: failed`);
  });

  it('filters out packages with age < 7 days', async () => {
    vi.spyOn(fetchModule, 'fetchVersionTimes').mockReturnValue({
      '2.0.0': '2023-01-01T00:00:00Z',
    });
    vi.spyOn(ageModule, 'calculateAgeInDays').mockReturnValue(3); // Too fresh
    vi.spyOn(vulnModule, 'checkVulnerabilities').mockResolvedValue(0);

    const data = {
      freshpkg: { current: '1.0.0', wanted: '1.5.0', latest: '2.0.0' },
    };
    await printOutdated(data, {
      fetchVersionTimes: fetchModule.fetchVersionTimes,
      calculateAgeInDays: ageModule.calculateAgeInDays,
      checkVulnerabilities: vulnModule.checkVulnerabilities,
    });

    expect(logSpy.mock.calls[0][0]).toBe('Outdated packages:');
    expect(logSpy.mock.calls[1][0]).toBe(['Name', 'Current', 'Wanted', 'Latest', 'Age (days)', 'Type'].join('	'));
    expect(logSpy.mock.calls[2][0]).toContain('No outdated packages with mature versions found');
  });

  it('shows only packages with age >= 7 days', async () => {
    vi.spyOn(fetchModule, 'fetchVersionTimes').mockImplementation(async (pkgName) => {
      if (pkgName === 'mature-pkg') {
        return { '2.0.0': '2023-01-01T00:00:00Z' };
      }
      return { '3.0.0': '2023-01-01T00:00:00Z' };
    });
    vi.spyOn(ageModule, 'calculateAgeInDays').mockImplementation(() => {
      // Return different ages based on call order
      const callCount = ageModule.calculateAgeInDays.mock.calls.length;
      return callCount === 1 ? 10 : 3; // First call: mature, second call: fresh
    });
    vi.spyOn(vulnModule, 'checkVulnerabilities').mockResolvedValue(0);

    const data = {
      'mature-pkg': { current: '1.0.0', wanted: '1.5.0', latest: '2.0.0' },
      'fresh-pkg': { current: '2.0.0', wanted: '2.5.0', latest: '3.0.0' },
    };
    await printOutdated(data, {
      fetchVersionTimes: fetchModule.fetchVersionTimes,
      calculateAgeInDays: ageModule.calculateAgeInDays,
      checkVulnerabilities: vulnModule.checkVulnerabilities,
    });

    expect(logSpy.mock.calls[0][0]).toBe('Outdated packages:');
    expect(logSpy.mock.calls[1][0]).toBe(['Name', 'Current', 'Wanted', 'Latest', 'Age (days)', 'Type'].join('	'));
    // Only the mature package should be shown
    expect(logSpy.mock.calls[2][0]).toBe(['mature-pkg', '1.0.0', '1.5.0', '2.0.0', 10, 'dev'].join('	'));
    expect(logSpy.mock.calls[3]).toBeUndefined(); // fresh-pkg should be filtered out
  });

  it('filters out packages with vulnerabilities', async () => {
    vi.spyOn(fetchModule, 'fetchVersionTimes').mockResolvedValue({
      '2.0.0': '2023-01-01T00:00:00Z',
    });
    vi.spyOn(ageModule, 'calculateAgeInDays').mockReturnValue(10); // Mature
    vi.spyOn(vulnModule, 'checkVulnerabilities').mockResolvedValue(3); // Has vulnerabilities

    const data = {
      'vuln-pkg': { current: '1.0.0', wanted: '1.5.0', latest: '2.0.0' },
    };
    await printOutdated(data, {
      fetchVersionTimes: fetchModule.fetchVersionTimes,
      calculateAgeInDays: ageModule.calculateAgeInDays,
      checkVulnerabilities: vulnModule.checkVulnerabilities,
    });

    expect(logSpy.mock.calls[0][0]).toBe('Outdated packages:');
    expect(logSpy.mock.calls[1][0]).toBe(['Name', 'Current', 'Wanted', 'Latest', 'Age (days)', 'Type'].join('	'));
    expect(logSpy.mock.calls[2][0]).toContain('No outdated packages with safe, mature versions');
  });

  it('shows packages without vulnerabilities', async () => {
    vi.spyOn(fetchModule, 'fetchVersionTimes').mockResolvedValue({
      '2.0.0': '2023-01-01T00:00:00Z',
    });
    vi.spyOn(ageModule, 'calculateAgeInDays').mockReturnValue(10); // Mature
    vi.spyOn(vulnModule, 'checkVulnerabilities').mockResolvedValue(0); // No vulnerabilities

    const data = {
      'safe-pkg': { current: '1.0.0', wanted: '1.5.0', latest: '2.0.0' },
    };
    await printOutdated(data, {
      fetchVersionTimes: fetchModule.fetchVersionTimes,
      calculateAgeInDays: ageModule.calculateAgeInDays,
      checkVulnerabilities: vulnModule.checkVulnerabilities,
    });

    expect(logSpy.mock.calls[0][0]).toBe('Outdated packages:');
    expect(logSpy.mock.calls[1][0]).toBe(['Name', 'Current', 'Wanted', 'Latest', 'Age (days)', 'Type'].join('	'));
    expect(logSpy.mock.calls[2][0]).toBe(['safe-pkg', '1.0.0', '1.5.0', '2.0.0', 10, 'dev'].join('	'));
  });
});
