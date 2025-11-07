import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchVersionTimes } from '../src/fetch-version-times';
const cp = require('child_process');

describe('fetchVersionTimes error paths', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws an error for invalid package names', () => {
    expect(() => fetchVersionTimes('invalid$pkg')).toThrowError(/Invalid package name/);
  });

  it('throws a SyntaxError when npm view output is malformed JSON', () => {
    vi.spyOn(cp, 'execFileSync').mockReturnValue('not valid json');
    expect(() => fetchVersionTimes('validpkg')).toThrow(SyntaxError);
    expect(cp.execFileSync).toHaveBeenCalledWith(
      'npm',
      ['view', 'validpkg', 'time', '--json'],
      { encoding: 'utf8' }
    );
  });
});
