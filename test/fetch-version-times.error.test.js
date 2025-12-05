/* eslint-disable traceability/require-test-traceability */
/* eslint-disable traceability/valid-req-reference , traceability/valid-annotation-format , traceability/valid-annotation-format */
/****
 * Tests for error handling in fetchVersionTimes
 * @story prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md
 * @req REQ-NPM-VIEW - Use `npm view <package> time --json` to get publish dates
 * @req REQ-INVALID-PACKAGE - Reject invalid package names
 */

import { fetchVersionTimes } from '../src/fetch-version-times.js';
import { createExecFileMock } from './helpers/execFileMock.js';

describe('prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md: fetchVersionTimes error paths (Story 002.0)', () => {
  let execFileMock;

  beforeEach(() => {
    execFileMock = createExecFileMock();
  });

  afterEach(() => {
    execFileMock.mockReset();
  });

  it('(REQ-INVALID-PACKAGE) rejects for invalid package names', async () => {
    await expect(fetchVersionTimes('invalid$pkg', execFileMock)).rejects.toThrowError(/Invalid package name/);
  });

  it('(REQ-NPM-VIEW) rejects with SyntaxError when npm view output is malformed JSON', async () => {
    execFileMock.mockImplementation((cmd, args, options, callback) => {
      callback(null, 'not valid json');
    });

    await expect(fetchVersionTimes('validpkg', execFileMock)).rejects.toThrow(SyntaxError);
    expect(execFileMock.calls).toHaveLength(1);
    const [cmd, args, options, callback] = execFileMock.calls[0];
    expect(cmd).toBe('npm');
    expect(args).toEqual(['view', 'validpkg', 'time', '--json']);
    expect(options).toEqual({ encoding: 'utf8' });
    expect(typeof callback).toBe('function');
  });
});
