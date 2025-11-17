/**
 * Tests for retry logic in fetchVersionTimes.
 * @story prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md
 * @req REQ-NPM-VIEW - Use `npm view <package> time --json` to get publish dates
 */

import { fetchVersionTimes } from '../src/fetch-version-times.js';
import { createExecFileMock } from './helpers/execFileMock.js';

describe('fetchVersionTimes retry logic (Story 002.0)', () => {
  let execFileMock;

  beforeEach(() => {
    execFileMock = createExecFileMock();
  });

  afterEach(() => {
    execFileMock.mockReset();
  });

  it('(REQ-NPM-VIEW) retries on transient errors and resolves on retry', async () => {
    let callCount = 0;
    execFileMock.mockImplementation((cmd, args, options, callback) => {
      callCount++;
      if (callCount === 1) {
        // First call fails
        callback(new Error('Transient error'));
      } else {
        // Second call succeeds with valid JSON
        const output = JSON.stringify({
          created: '2020-01-01T00:00:00Z',
          modified: '2021-01-01T00:00:00Z',
          '1.0.0': '2023-01-01T00:00:00Z',
        });
        callback(null, output);
      }
    });

    const result = await fetchVersionTimes('validpkg', execFileMock);
    expect(callCount).toBe(2);
    expect(result).toEqual({ '1.0.0': '2023-01-01T00:00:00Z' });
  });

  it('(REQ-NPM-VIEW) rejects after exceeding max retries', async () => {
    // Always fail
    execFileMock.mockImplementation((cmd, args, options, callback) => {
      callback(new Error('Persistent error'));
    });

    await expect(fetchVersionTimes('anotherpkg', execFileMock)).rejects.toThrow('Persistent error');
    // maxRetries = 2 + initial try = total of 3 calls
    expect(execFileMock.calls).toHaveLength(3);
  });
});
