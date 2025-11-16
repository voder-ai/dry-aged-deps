/**
 * @story prompts/dry-aged-deps-user-story-map.md
 * @req UNKNOWN - Placeholder traceability annotation
 */

import { fetchVersionTimes, execFile } from '../src/fetch-version-times.js';

describe('fetchVersionTimes error paths', () => {
  afterEach(() => {
    vi.clearAllMocks();
    execFile.mockReset();
  });

  it('rejects for invalid package names', async () => {
    await expect(fetchVersionTimes('invalid$pkg')).rejects.toThrowError(/Invalid package name/);
  });

  it('rejects with SyntaxError when npm view output is malformed JSON', async () => {
    execFile.mockImplementation((cmd, args, options, callback) => {
      callback(null, 'not valid json', '');
    });

    await expect(fetchVersionTimes('validpkg')).rejects.toThrow(SyntaxError);
    expect(execFile.mock.calls).toHaveLength(1);
    const [cmd, args, options, callback] = execFile.mock.calls[0];
    expect(cmd).toBe('npm');
    expect(args).toEqual(['view', 'validpkg', 'time', '--json']);
    expect(options).toEqual({ encoding: 'utf8' });
    expect(typeof callback).toBe('function');
  });
});
