import { execa } from 'execa';

/**
 * Helper to run the CLI with given arguments and return the result
 * @story prompts/010.0-DEV-CONFIG-FILE-SUPPORT.md
 * @req REQ-CLI-HELP - Utility for testing CLI help and version commands
 */
export async function runCli(args) {
  return await execa('node', ['./bin/dry-aged-deps.js', ...args], {
    env: process.env,
  });
}
