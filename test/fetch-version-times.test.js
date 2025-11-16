/** @story prompts/dry-aged-deps-user-story-map.md */
import { fetchVersionTimes, execFile } from '../src/fetch-version-times.js';

describe('fetchVersionTimes', () => {
  afterEach(() => {
    vi.clearAllMocks();
    execFile.mockReset();
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
    expect(execFile.mock.calls).toHaveLength(1);
    const [cmd, args, options, callback] = execFile.mock.calls[0];
    expect(cmd).toBe('npm');
    expect(args).toEqual(['view', 'mypackage', 'time', '--json']);
    expect(options).toEqual({ encoding: 'utf8' });
    expect(typeof callback).toBe('function');

    expect(result).toEqual({
      '1.0.0': '2022-01-01T00:00:00Z',
      '2.0.0': '2023-01-01T00:00:00Z',
    });
  });
});
