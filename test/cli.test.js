/* eslint-disable traceability/require-test-traceability */
/* eslint-disable traceability/valid-req-reference , traceability/valid-annotation-format */
/**
 * Tests for dry-aged-deps CLI --help option.
 * @story prompts/010.0-DEV-CONFIG-FILE-SUPPORT.md
 * @req REQ-HELP-EXITCODE - Exits with code 0 when --help flag is used
 */

import { runCli } from './helpers/cli-helper';

describe('prompts/010.0-DEV-CONFIG-FILE-SUPPORT.md: dry-aged-deps CLI', () => {
  it('exits with code 0 for --help', async () => {
    const result = await runCli(['--help']);
    expect(result.exitCode).toBe(0);
  });
});
