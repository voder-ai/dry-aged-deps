/* eslint-disable traceability/valid-annotation-format */
/**
 * Tests for buildRows success path.
 * @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
 * @req REQ-NPM-COMMAND - Execute `npm outdated --json` using child_process
 * @req REQ-JSON-PARSE - Parse the JSON output from npm outdated
 * @req REQ-OUTPUT-DISPLAY - Display outdated package results
 */

import { describe, it, expect, vi } from 'vitest';
import { buildRows } from '../src/build-rows.js';

/**
 * Story: prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md
 * REQ-FETCH-TIMES - Verify that buildRows calls fetchVersionTimes and calculateAgeInDays correctly on successful fetch
 */
describe('prompts/001.0-DEV-RUN-NPM-OUTDATED.md: buildRows success path', () => {
  it('calculates age when fetchVersionTimes returns latest timestamp', async () => {
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
});
