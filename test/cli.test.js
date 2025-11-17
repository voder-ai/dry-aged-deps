/**
 */

/**
 */

import { runCli } from './helpers/cli-helper';

describe('dry-aged-deps CLI', () => {
  it('exits with code 0 for --help', async () => {
    const result = await runCli(['--help']);
    expect(result.exitCode).toBe(0);
  });
});
