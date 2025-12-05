/**
 * Tests for dry-aged-deps CLI --help option.
 * @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-NPM-COMMAND
 */

import { runCli } from './helpers/cli-helper';

describe('Story 001.0-DEV-RUN-NPM-OUTDATED: dry-aged-deps CLI', () => {
  it('[REQ-NPM-COMMAND] exits with code 0 for --help', async () => {
    const result = await runCli(['--help']);
    expect(result.exitCode).toBe(0);
  });
});
