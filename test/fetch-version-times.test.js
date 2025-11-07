import { describe, it, expect, vi, afterEach } from 'vitest';

// Mock child_process at the module level
vi.mock('child_process', () => ({
  execFileSync: vi.fn(),
}));

import { fetchVersionTimes } from '../src/fetch-version-times.js';
import { execFileSync } from 'child_process';

describe('fetchVersionTimes', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('parses npm view output and excludes created and modified entries', () => {
    const mockOutput = JSON.stringify({
      created: '2020-01-01T00:00:00Z',
      modified: '2021-01-01T00:00:00Z',
      '1.0.0': '2022-01-01T00:00:00Z',
      '2.0.0': '2023-01-01T00:00:00Z',
    });
    // Mock the execFileSync function
    execFileSync.mockReturnValue(mockOutput);

    const result = fetchVersionTimes('mypackage');
    expect(execFileSync).toHaveBeenCalledWith(
      'npm',
      ['view', 'mypackage', 'time', '--json'],
      { encoding: 'utf8' }
    );
    expect(result).toEqual({
      '1.0.0': '2022-01-01T00:00:00Z',
      '2.0.0': '2023-01-01T00:00:00Z',
    });
  });
});
