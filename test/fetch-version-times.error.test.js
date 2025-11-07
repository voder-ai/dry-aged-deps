import { describe, it, expect, vi, afterEach } from 'vitest';

// Mock child_process at the module level
vi.mock('child_process', () => ({
  execFileSync: vi.fn(),
}));

import { fetchVersionTimes } from '../src/fetch-version-times.js';
import { execFileSync } from 'child_process';

describe('fetchVersionTimes error paths', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('throws an error for invalid package names', () => {
    expect(() => fetchVersionTimes('invalid$pkg')).toThrowError(
      /Invalid package name/
    );
  });

  it('throws a SyntaxError when npm view output is malformed JSON', () => {
    execFileSync.mockReturnValue('not valid json');
    expect(() => fetchVersionTimes('validpkg')).toThrow(SyntaxError);
    expect(execFileSync).toHaveBeenCalledWith(
      'npm',
      ['view', 'validpkg', 'time', '--json'],
      { encoding: 'utf8' }
    );
  });
});
