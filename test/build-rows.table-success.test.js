/**
 * Tests for Fetch Version Ages for Outdated Packages: default table format
 * @story prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md
 * @req REQ-FETCH-TIMES - Fetch version times and calculate age
 * @req REQ-AGE-CALC - calculate days since publication
 * @req REQ-OPTIMIZATION - fetch only newer versions
 */
import { describe, it, expect, vi } from 'vitest';
import { buildRows } from '../src/build-rows.js';

describe('buildRows table format success path', () => {
  it('calculates age when fetchVersionTimes returns latest timestamp and default format is table', async () => {
    const data = {
      pkgA: { current: '1.0.0', wanted: '1.1.0', latest: '1.1.0' },
    };
    const stubFetchVersionTimes = vi.fn(async (name) => ({ '1.1.0': '2025-01-01T12:00:00.000Z' }));
    const stubCalculateAgeInDays = vi.fn(() => 123);
    const stubGetDependencyType = vi.fn(() => 'prod');

    const rows = await buildRows(data, {
      fetchVersionTimes: stubFetchVersionTimes,
      calculateAgeInDays: stubCalculateAgeInDays,
      getDependencyType: stubGetDependencyType,
      // no format specified, default is 'table'
    });

    expect(stubFetchVersionTimes).toHaveBeenCalledWith('pkgA');
    expect(stubCalculateAgeInDays).toHaveBeenCalledWith('2025-01-01T12:00:00.000Z');
    expect(stubGetDependencyType).toHaveBeenCalledWith('pkgA');
    expect(rows).toEqual([['pkgA', '1.0.0', '1.1.0', '1.1.0', 123, 'prod']]);
  });
});