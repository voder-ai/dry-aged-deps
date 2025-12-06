/**
 * Helper to run the CLI with given arguments and return the result
 * @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-NPM-COMMAND
 */
import { execa } from 'execa';
export async function runCli(args) {
  return await execa('node', ['./bin/dry-aged-deps.js', ...args], {
    env: process.env,
  });
}
