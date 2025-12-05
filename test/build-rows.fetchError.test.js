/* eslint-disable traceability/require-test-traceability */
/* eslint-disable traceability/valid-annotation-format */
/**
 * Tests for buildRows handling version-fetch errors.
 * @story prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md
 * @req REQ-NPM-VIEW - Use npm view to fetch publish dates for newer versions
 * @req REQ-AGE-CALC - Calculate days since publication
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildRows } from '../src/build-rows.js';

/**
 * Story: 002.0-DEV-FETCH-AVAILABLE-VERSIONS.md
 * Ensure buildRows handles fetchVersionTimes errors by setting age to "N/A".
 */
describe('prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md: buildRows error handling', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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
