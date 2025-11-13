// Tests for: prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md

import { describe, it, expect } from 'vitest';
import { buildRows } from '../src/build-rows.js';

/**
 * Story: 002.0-DEV-FETCH-AVAILABLE-VERSIONS.md
 * Ensure buildRows handles fetchVersionTimes errors by setting age to "N/A".
 */
describe('buildRows error handling', () => {
  it('sets age to "N/A" when fetchVersionTimes throws error', async () => {
    const data = {
      pkg1: { current: '1.0.0', wanted: '1.1.0', latest: '1.1.0' },
    };
    const stubFetchVersionTimes = async (name) => {
      throw new Error('fetch failure');
    };
    const stubCalculateAgeInDays = () => {
      throw new Error('calculateAgeInDays should not be called on error');
    };
    const stubGetDependencyType = () => 'prod';

    const rows = await buildRows(data, {
      fetchVersionTimes: stubFetchVersionTimes,
      calculateAgeInDays: stubCalculateAgeInDays,
      getDependencyType: stubGetDependencyType,
    });

    expect(rows).toEqual([['pkg1', '1.0.0', '1.1.0', '1.1.0', 'N/A', 'prod']]);
  });
});
