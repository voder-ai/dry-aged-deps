/** @story prompts/dry-aged-deps-user-story-map.md */
import { describe, it, expect, vi } from 'vitest';
import { buildRows } from '../src/build-rows.js';

// Tests for error logging behavior in different formats
describe('buildRows error logging', () => {
  it('logs warning when fetchVersionTimes throws and format is table', async () => {
    const data = { pkg1: { current: '1.0.0', wanted: '1.1.0', latest: '1.1.0' } };
    const stubFetch = async () => {
      throw new Error('fetch fail');
    };
    const stubCalc = vi.fn(() => {});
    const stubGetDep = () => 'prod';
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const rows = await buildRows(data, {
      fetchVersionTimes: stubFetch,
      calculateAgeInDays: stubCalc,
      getDependencyType: stubGetDep,
      format: 'table',
    });

    expect(rows).toEqual([['pkg1', '1.0.0', '1.1.0', '1.1.0', 'N/A', 'prod']]);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Warning: failed to fetch version times for pkg1: fetch fail')
    );

    errorSpy.mockRestore();
  });

  it('does not log warning when format is json or xml', async () => {
    const data = { pkg1: { current: '1.0.0', wanted: '1.1.0', latest: '1.1.0' } };
    const stubFetch = async () => {
      throw new Error('fetch error');
    };
    const stubCalc = vi.fn(() => 42);
    const stubGetDep = () => 'dev';
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // JSON format
    const rowsJson = await buildRows(data, {
      fetchVersionTimes: stubFetch,
      calculateAgeInDays: stubCalc,
      getDependencyType: stubGetDep,
      format: 'json',
    });
    expect(rowsJson).toEqual([['pkg1', '1.0.0', '1.1.0', '1.1.0', 'N/A', 'dev']]);
    expect(errorSpy).not.toHaveBeenCalled();

    // XML format
    const rowsXml = await buildRows(data, {
      fetchVersionTimes: stubFetch,
      calculateAgeInDays: stubCalc,
      getDependencyType: stubGetDep,
      format: 'xml',
    });
    expect(rowsXml).toEqual([['pkg1', '1.0.0', '1.1.0', '1.1.0', 'N/A', 'dev']]);
    expect(errorSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});

// Tests for missing latestTime entry
describe('buildRows missing latestTime handling', () => {
  it('leaves age as "N/A" when versionTimes has no matching latest version', async () => {
    const data = { pkg2: { current: '2.0.0', wanted: '2.1.0', latest: '2.1.0' } };
    const stubFetch = async () => ({ '2.0.5': '2024-01-01T00:00:00.000Z' });
    const stubCalc = vi.fn(() => {
      throw new Error('should not be called');
    });
    const stubGetDep = () => 'prod';

    const rows = await buildRows(data, {
      fetchVersionTimes: stubFetch,
      calculateAgeInDays: stubCalc,
      getDependencyType: stubGetDep,
    });

    expect(rows).toEqual([['pkg2', '2.0.0', '2.1.0', '2.1.0', 'N/A', 'prod']]);
    expect(stubCalc).not.toHaveBeenCalled();
  });
});
