/**
 * @story prompts/dry-aged-deps-user-story-map.md
 */

import { fetchVersionTimes } from '../src/fetch-version-times.js';
import { execFile } from 'child_process';

describe('fetchVersionTimes', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('parses npm view output and excludes created and modified entries', async () => {
    const mockOutput = JSON.stringify({
      created: '2020-01-01T00:00:00Z',
      modified: '2021-01-01T00:00:00Z',
      '1.0.0': '2022-01-01T00:00:00Z',
      '2.0.0': '2023-01-01T00:00:00Z',
    });
    // Mock the execFile function
    execFile.mockImplementation((cmd, args, options, callback) => {
      callback(null, mockOutput, '');
    });

    const result = await fetchVersionTimes('mypackage');
    expect(execFile).toHaveBeenCalledWith(
      'npm',
      ['view', 'mypackage', 'time', '--json'],
      { encoding: 'utf8' },
      expect.any(Function)
    );
    expect(result).toEqual({
      '1.0.0': '2022-01-01T00:00:00Z',
      '2.0.0': '2023-01-01T00:00:00Z',
    });
  });
});
