/**
 * Tests for buildRows success path.
 * @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-NPM-COMMAND REQ-JSON-PARSE REQ-OUTPUT-DISPLAY
 */

import { describe, it, expect, vi } from 'vitest';
import { buildRows } from './build-rows.js';
import { DEPRECATED } from './fetch-version-times.js';

/**
 * Story: prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md
 * REQ-FETCH-TIMES - Verify that buildRows calls fetchVersionTimes and calculateAgeInDays correctly on successful fetch
 */
describe('Story 001.0-DEV-RUN-NPM-OUTDATED: buildRows success path', () => {
  it('[REQ-NPM-COMMAND] [REQ-JSON-PARSE] [REQ-OUTPUT-DISPLAY] calculates age when fetchVersionTimes returns latest timestamp', async () => {
    const data = {
      pkg1: { current: '1.0.0', wanted: '1.2.0', latest: '1.2.0' },
    };
    const stubFetchVersionTimes = vi.fn(async (name) => ({ '1.2.0': '2024-01-01T00:00:00.000Z' }));
    const stubCalculateAgeInDays = vi.fn(() => 42);
    const stubGetDependencyType = vi.fn(() => 'dev');

    const rows = await buildRows(data, {
      fetchVersionTimes: stubFetchVersionTimes,
      calculateAgeInDays: stubCalculateAgeInDays,
      getDependencyType: stubGetDependencyType,
      format: 'json',
    });

    // Should have called fetchVersionTimes and calculateAgeInDays
    expect(stubFetchVersionTimes).toHaveBeenCalledWith('pkg1');
    expect(stubCalculateAgeInDays).toHaveBeenCalledWith('2024-01-01T00:00:00.000Z');
    expect(stubGetDependencyType).toHaveBeenCalledWith('pkg1');

    // Verify returned row structure and age value
    expect(rows).toEqual([['pkg1', '1.0.0', '1.2.0', '1.2.0', 42, 'dev']]);
  });

  it('[REQ-NPM-VIEW] collects the latest version deprecation into the passed deprecatedByPackage map', async () => {
    const data = {
      goodpkg: { current: '1.0.0', wanted: '1.2.0', latest: '1.2.0' },
      deppkg: { current: '2.0.0', wanted: '3.0.0', latest: '3.0.0' },
    };
    const stubFetchVersionTimes = vi.fn(async (name) => {
      const times = { [name === 'goodpkg' ? '1.2.0' : '3.0.0']: '2024-01-01T00:00:00.000Z' };
      if (name === 'deppkg') times[DEPRECATED] = 'Use newpkg instead: https://example.com/newpkg';
      return times;
    });
    const deprecatedByPackage = new Map();

    await buildRows(data, {
      fetchVersionTimes: stubFetchVersionTimes,
      calculateAgeInDays: vi.fn(() => 42),
      getDependencyType: vi.fn(() => 'prod'),
      format: 'table',
      deprecatedByPackage,
    });

    // Only the deprecated package is recorded, keyed by name, with its latest version + verbatim message.
    expect(deprecatedByPackage.get('deppkg')).toEqual({
      version: '3.0.0',
      message: 'Use newpkg instead: https://example.com/newpkg',
    });
    expect(deprecatedByPackage.has('goodpkg')).toBe(false);
  });
});
