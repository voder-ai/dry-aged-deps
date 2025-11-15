/**
 * @story prompts/dry-aged-deps-user-story-map.md
 * @req UNKNOWN - TODO: specify requirement ID and description
 */
* @req UNKNOWN - TODO: specify requirement ID and description
/**
 * @story prompts/dry-aged-deps-user-story-map.md
 *//**
 * @story prompts/dry-aged-deps-user-story-map.md
 */ import { describe, it, expect, vi, afterEach } from 'vitest';

// Mock child_process.execFile
vi.mock('child_process', () => ({
  execFile: vi.fn(),
}));

import { fetchVersionTimes } from '../src/fetch-version-times.js';
import { execFile } from 'child_process';

describe('fetchVersionTimes retry logic', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('retries on transient errors and resolves on retry', async () => {
    let callCount = 0;
    execFile.mockImplementation((cmd, args, options, callback) => {
      callCount++;
      if (callCount === 1) {
        // First call fails
        callback(new Error('Transient error'), null, '');
      } else {
        // Second call succeeds with valid JSON
        const output = JSON.stringify({
          created: '2020-01-01T00:00:00Z',
          modified: '2021-01-01T00:00:00Z',
          '1.0.0': '2023-01-01T00:00:00Z',
        });
        callback(null, output, '');
      }
    });

    const result = await fetchVersionTimes('validpkg');
    expect(callCount).toBe(2);
    expect(result).toEqual({ '1.0.0': '2023-01-01T00:00:00Z' });
  });

  it('rejects after exceeding max retries', async () => {
    // Always fail
    execFile.mockImplementation((cmd, args, options, callback) => {
      callback(new Error('Persistent error'), null, '');
    });

    await expect(fetchVersionTimes('anotherpkg')).rejects.toThrow('Persistent error');
    // maxRetries = 2 + initial try = total of 3 calls
    expect(execFile).toHaveBeenCalledTimes(3);
  });
});
