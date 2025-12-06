/* eslint-disable traceability/require-test-traceability, traceability/require-story-annotation, traceability/require-req-annotation */
/**
 * Helper to run the CLI with given arguments and return the result
 */
import { execa } from 'execa';
export async function runCli(args) {
  return await execa('node', ['./bin/dry-aged-deps.js', ...args], {
    env: process.env,
  });
}
