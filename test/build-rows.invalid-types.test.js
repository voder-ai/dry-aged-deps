/* eslint-disable traceability/require-test-traceability */
/* eslint-disable traceability/valid-annotation-format */
/****
 * Tests for buildRows handling non-object versionTimes.
 * @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
 * @req REQ-OUTPUT-DISPLAY - Display outdated package results including handling of missing or invalid data
 */

import { describe, it, expect, vi } from 'vitest';
import { buildRows } from '../src/build-rows.js';

/**
 * Ensure that if fetchVersionTimes returns a non-object (e.g., string), buildRows treats age as "N/A" and does not log errors or call calculateAgeInDays.
 */
describe('prompts/001.0-DEV-RUN-NPM-OUTDATED.md: buildRows non-object versionTimes', () => {
  it('handles non-object versionTimes gracefully without errors', async () => {
    const data = {
      pkg1: { current: '1.0.0', wanted: '1.1.0', latest: '1.1.0' },
    };
    const stubFetchVersionTimes = vi.fn(async () => 'invalid');
    const stubCalculateAgeInDays = vi.fn(() => {
      throw new Error('calculateAgeInDays should not be called on non-object');
    });
    const stubGetDependencyType = vi.fn(() => 'prod');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const rows = await buildRows(data, {
      fetchVersionTimes: stubFetchVersionTimes,
      calculateAgeInDays: stubCalculateAgeInDays,
      getDependencyType: stubGetDependencyType,
      format: 'table',
    });

    // Should return age "N/A"
    expect(rows).toEqual([['pkg1', '1.0.0', '1.1.0', '1.1.0', 'N/A', 'prod']]);
    // calculateAgeInDays should not be called
    expect(stubCalculateAgeInDays).not.toHaveBeenCalled();
    // No error logged
    expect(errorSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});
