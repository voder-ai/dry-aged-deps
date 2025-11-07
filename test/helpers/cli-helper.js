import { execa } from 'execa';

/**
 * Helper to run the CLI with given arguments and return the result
 * @param {string[]} args - CLI arguments
 * @returns {Promise<import('execa').ExecaReturnValue>}
 */
export async function runCli(args) {
  return await execa('node', ['./bin/dry-aged-deps.js', ...args], {
    env: process.env,
  });
}
