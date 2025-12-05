/* eslint-disable traceability/require-test-traceability */
/* eslint-disable traceability/valid-annotation-format */
/**
 * Tests for no mature version age in buildRows
 * @story prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md
 * @req REQ-NPM-VIEW - Use npm view to fetch publish times
 * @req REQ-AGE-CALC - Calculate days since publication
 * @req REQ-OPTIMIZATION - Only fetch versions newer than current
 */

import { describe, it, expect, vi } from 'vitest';
import { buildRows } from '../src/build-rows.js';

describe('prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md: buildRows no mature versions', () => {
  it('sets age to "N/A" when fetchVersionTimes returns empty object', async () => {
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
