/**
 * Tests for buildRows handling version-fetch errors.
 * @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW REQ-AGE-CALC
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildRows } from '../src/build-rows.js';

/**
 * Story: 002.0-DEV-FETCH-AVAILABLE-VERSIONS.md
 * Ensure buildRows handles fetchVersionTimes errors by setting age to "N/A".
 */
describe('Story 002.0-DEV-FETCH-AVAILABLE-VERSIONS: buildRows error handling', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('[REQ-NPM-VIEW] [REQ-AGE-CALC] sets age to "N/A" when fetchVersionTimes throws error', async () => {
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
