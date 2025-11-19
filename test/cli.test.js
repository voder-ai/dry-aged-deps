/**
 * @fileoverview CLI tests for dry-aged-deps
 * @see {@link ../prompts/014.0-DEV-INVALID-OPTION-ERROR.md} invalid option error handling
 * @see {@link ../prompts/010.0-DEV-CONFIG-FILE-SUPPORT.md} config file support
 * @requires --help flag must exit with code 0
 */

import { runCli } from './helpers/cli-helper';

describe('dry-aged-deps CLI', () => {
  it('exits with code 0 for --help', async () => {
    const result = await runCli(['--help']);
    expect(result.exitCode).toBe(0);
  });
});
