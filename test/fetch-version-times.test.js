import { describe, it, expect, vi, afterEach } from 'vitest';

// Mock child_process execSync before importing the module
vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

// Import the module under test
import * as fetchModule from '../src/fetch-version-times';
const { fetchVersionTimes } = fetchModule;

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
    // Get the mocked execSync
    const { execSync } = require('child_process');
    execSync.mockReturnValue(mockOutput);

    const result = fetchVersionTimes('mypackage');
    expect(execSync).toHaveBeenCalledWith('npm view mypackage time --json', { encoding: 'utf8' });
    expect(result).toEqual({
      '1.0.0': '2022-01-01T00:00:00Z',
      '2.0.0': '2023-01-01T00:00:00Z',
    });
  });
});