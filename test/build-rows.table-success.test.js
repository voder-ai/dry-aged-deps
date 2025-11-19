/**
 * Tests for buildRows table format success path.
 * @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
 * @req REQ-NPM-COMMAND - Execute `npm outdated --json` using child_process
 * @req REQ-JSON-PARSE - Parse the JSON output from npm outdated
 * @req REQ-OUTPUT-DISPLAY - Display outdated package results
 */

import { describe, it, expect, vi } from 'vitest';
import { buildRows } from '../src/build-rows.js';

describe('prompts/001.0-DEV-RUN-NPM-OUTDATED.md: buildRows table format success path', () => {
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
