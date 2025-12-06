/**
 * Tests for no mature version age in buildRows
 * @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW REQ-AGE-CALC
 */

import { describe, it, expect, vi } from 'vitest';
import { buildRows } from '../src/build-rows.js';

describe('Story 002.0-DEV-FETCH-AVAILABLE-VERSIONS: buildRows no mature versions', () => {
  it('[REQ-NPM-VIEW] [REQ-AGE-CALC] sets age to "N/A" when fetchVersionTimes returns empty object', async () => {
    const data = {
      pkg1: { current: '1.0.0', wanted: '1.5.0', latest: '1.5.0' },
    };
    const stubFetchVersionTimes = vi.fn(async () => ({}));
    const stubCalculateAgeInDays = vi.fn(() => {
      throw new Error('calculateAgeInDays should not be called');
    });
    const stubGetDependencyType = vi.fn(() => 'prod');

    const rows = await buildRows(data, {
      fetchVersionTimes: stubFetchVersionTimes,
      calculateAgeInDays: stubCalculateAgeInDays,
      getDependencyType: stubGetDependencyType,
    });

    expect(rows).toEqual([['pkg1', '1.0.0', '1.5.0', '1.5.0', 'N/A', 'prod']]);
    expect(stubFetchVersionTimes).toHaveBeenCalledWith('pkg1');
    expect(stubCalculateAgeInDays).not.toHaveBeenCalled();
    expect(stubGetDependencyType).toHaveBeenCalledWith('pkg1');
  });
});
