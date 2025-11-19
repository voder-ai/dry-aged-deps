/**
 * Tests for fetchVersionTimes core functionality.
 * @story prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md
 * @req REQ-NPM-VIEW - Use `npm view <package> time --json` to get publish dates
 */

import { fetchVersionTimes } from '../src/fetch-version-times.js';
import { createExecFileMock } from './helpers/execFileMock.js';

describe('prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md: fetchVersionTimes (Story 002.0)', () => {
  let execFileMock;

  beforeEach(() => {
    execFileMock = createExecFileMock();
  });

  afterEach(() => {
    execFileMock.mockReset();
  });

  it('(REQ-NPM-VIEW) should parse npm view output and exclude created and modified entries', async () => {
    const mockOutput = JSON.stringify({
      created: '2020-01-01T00:00:00Z',
      modified: '2021-01-01T00:00:00Z',
      '1.0.0': '2022-01-01T00:00:00Z',
      '2.0.0': '2023-01-01T00:00:00Z',
    });
    // Mock the execFile implementation
    execFileMock.mockImplementation((cmd, args, options, callback) => {
      callback(null, mockOutput);
    });

    const result = await fetchVersionTimes('mypackage', execFileMock);
    expect(execFileMock.calls).toHaveLength(1);
    const [cmd, args, options, callback] = execFileMock.calls[0];
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
