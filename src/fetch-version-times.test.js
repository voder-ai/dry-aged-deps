/**
 * Tests for fetchVersionTimes core functionality.
 * @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
 */

import { fetchVersionTimes, DEPRECATED } from './fetch-version-times.js';
import { createExecFileMock } from '../test/helpers/execFileMock.js';

describe('Story 002.0-DEV-FETCH-AVAILABLE-VERSIONS: fetchVersionTimes', () => {
  let execFileMock;

  beforeEach(() => {
    execFileMock = createExecFileMock();
  });

  afterEach(() => {
    execFileMock.mockReset();
  });

  it('[REQ-NPM-VIEW] should parse npm view output and exclude created and modified entries', async () => {
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
    expect(args).toEqual(['view', 'mypackage', 'time', 'deprecated', '--json']);
    expect(options).toEqual({ encoding: 'utf8' });
    expect(typeof callback).toBe('function');

    expect(result).toEqual({
      '1.0.0': '2022-01-01T00:00:00Z',
      '2.0.0': '2023-01-01T00:00:00Z',
    });
  });

  it('[REQ-NPM-VIEW] should expose the deprecation message via the DEPRECATED symbol from the same single npm view call', async () => {
    // npm wraps the projection under field names when both fields have values.
    const mockOutput = JSON.stringify({
      time: {
        created: '2020-01-01T00:00:00Z',
        modified: '2021-01-01T00:00:00Z',
        '1.0.0': '2022-01-01T00:00:00Z',
        '2.0.0': '2023-01-01T00:00:00Z',
      },
      deprecated: 'This package is deprecated. Please use newpkg instead: https://example.com/newpkg',
    });
    execFileMock.mockImplementation((cmd, args, options, callback) => {
      callback(null, mockOutput);
    });

    const result = await fetchVersionTimes('deprecatedpkg', execFileMock);
    // ONE call carries both fields (no extra round-trip) — ADR-0023 confirmation.
    expect(execFileMock.calls).toHaveLength(1);
    expect(execFileMock.calls[0][1]).toEqual(['view', 'deprecatedpkg', 'time', 'deprecated', '--json']);
    // The version→time map is unwrapped from the nested `time` field.
    expect(result['1.0.0']).toBe('2022-01-01T00:00:00Z');
    expect(result['2.0.0']).toBe('2023-01-01T00:00:00Z');
    // The deprecation message rides on the symbol channel (invisible to string-key iteration).
    expect(result[DEPRECATED]).toBe(
      'This package is deprecated. Please use newpkg instead: https://example.com/newpkg'
    );
    // Symbol channel stays invisible to version-indexing consumers.
    expect(Object.keys(result)).toEqual(['1.0.0', '2.0.0']);
  });

  it('[REQ-NPM-VIEW] should expose no deprecation for a non-deprecated package (flat npm view shape)', async () => {
    // When `deprecated` is absent npm collapses the projection to the flat time map.
    const mockOutput = JSON.stringify({
      created: '2020-01-01T00:00:00Z',
      modified: '2021-01-01T00:00:00Z',
      '1.0.0': '2022-01-01T00:00:00Z',
    });
    execFileMock.mockImplementation((cmd, args, options, callback) => {
      callback(null, mockOutput);
    });

    const result = await fetchVersionTimes('healthypkg', execFileMock);
    expect(result).toEqual({ '1.0.0': '2022-01-01T00:00:00Z' });
    expect(result[DEPRECATED]).toBeUndefined();
  });

  it('[REQ-NPM-VIEW] should not expose a scalar message when npm returns a version-keyed deprecated object', async () => {
    // Defensive: if npm ever returns a per-version deprecated map (multiple
    // deprecated versions), there is no single latest scalar to surface here.
    const mockOutput = JSON.stringify({
      time: {
        created: '2020-01-01T00:00:00Z',
        '1.0.0': '2022-01-01T00:00:00Z',
        '2.0.0': '2023-01-01T00:00:00Z',
      },
      deprecated: { '1.0.0': 'old and busted', '2.0.0': 'still busted' },
    });
    execFileMock.mockImplementation((cmd, args, options, callback) => {
      callback(null, mockOutput);
    });

    const result = await fetchVersionTimes('multidep', execFileMock);
    expect(result).toEqual({ '1.0.0': '2022-01-01T00:00:00Z', '2.0.0': '2023-01-01T00:00:00Z' });
    expect(result[DEPRECATED]).toBeUndefined();
  });
});
