/**
 * @story prompts/dry-aged-deps-user-story-map.md
 *//**
 * @story prompts/dry-aged-deps-user-story-map.md
 */ import { describe, it, expect, vi, afterEach } from 'vitest';

// Mock child_process at the module level
vi.mock('child_process', () => ({
  execFile: vi.fn(),
}));

import { fetchVersionTimes } from '../src/fetch-version-times.js';
import { execFile } from 'child_process';

describe('fetchVersionTimes error paths', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('rejects for invalid package names', async () => {
    await expect(fetchVersionTimes('invalid$pkg')).rejects.toThrowError(/Invalid package name/);
  });

  it('rejects with SyntaxError when npm view output is malformed JSON', async () => {
    execFile.mockImplementation((cmd, args, options, callback) => {
      callback(null, 'not valid json', '');
    });

    await expect(fetchVersionTimes('validpkg')).rejects.toThrow(SyntaxError);
    expect(execFile).toHaveBeenCalledWith(
      'npm',
      ['view', 'validpkg', 'time', '--json'],
      { encoding: 'utf8' },
      expect.any(Function)
    );
  });
});
