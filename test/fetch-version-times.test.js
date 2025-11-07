import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchVersionTimes } from '../src/fetch-version-times';

// Use real child_process module and spy on execFileSync
const cp = require('child_process');

describe('fetchVersionTimes', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('parses npm view output and excludes created and modified entries', () => {
    const mockOutput = JSON.stringify({
      created: '2020-01-01T00:00:00Z',
      modified: '2021-01-01T00:00:00Z',
      '1.0.0': '2022-01-01T00:00:00Z',
      '2.0.0': '2023-01-01T00:00:00Z',
    });
    // Spy on execFileSync to return mockOutput
    vi.spyOn(cp, 'execFileSync').mockReturnValue(mockOutput);

    const result = fetchVersionTimes('mypackage');
    expect(cp.execFileSync).toHaveBeenCalledWith(
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