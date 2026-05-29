/**
 * Tests for scripts/run-with-timeout.mjs — a wall-clock timeout wrapper for `npm test`.
 * Closes P015: hung test runner runs unbounded; wrapper converts hangs into bounded, loud failures.
 *
 * @supports docs/problems/known-error/015-test-script-has-no-wallclock-timeout-hung-runner-runs-unbounded.md REQ-P015-TIMEOUT REQ-P015-EXIT-PASSTHROUGH
 */

import { describe, it, expect } from 'vitest';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const WRAPPER = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'run-with-timeout.mjs');

/**
 * Run the wrapper and resolve with its exit code and captured streams.
 * @param {string[]} args - CLI args after the wrapper path.
 * @param {number} hardKillMs - test-side safety net so a broken wrapper cannot hang the test process.
 * @returns {Promise<{code: number, signal: string|null, stdout: string, stderr: string}>}
 */
function runWrapper(args, hardKillMs = 10000) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [WRAPPER, ...args], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    const safety = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`test-side safety SIGKILL after ${hardKillMs}ms (wrapper failed to exit)`));
    }, hardKillMs);
    child.on('exit', (code, signal) => {
      clearTimeout(safety);
      resolve({ code: code ?? -1, signal, stdout, stderr });
    });
    child.on('error', (err) => {
      clearTimeout(safety);
      reject(err);
    });
  });
}

describe('P015 run-with-timeout: wall-clock timeout wrapper', () => {
  it('[REQ-P015-EXIT-PASSTHROUGH] propagates the child exit code when the child finishes within the timeout', async () => {
    // Child sleeps 0 then exits 7; wrapper should propagate exit 7.
    const result = await runWrapper(['5', '--', process.execPath, '-e', 'process.exit(7)']);
    expect(result.code).toBe(7);
  });

  it('[REQ-P015-EXIT-PASSTHROUGH] propagates exit 0 on a successful child', async () => {
    const result = await runWrapper(['5', '--', process.execPath, '-e', 'console.log("hi"); process.exit(0)']);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('hi');
  });

  it('[REQ-P015-TIMEOUT] exits 124 (timeout convention) when the child exceeds the wall-clock budget', async () => {
    // Child sleeps 30s; timeout budget is 1s; wrapper should kill the child and exit 124.
    const result = await runWrapper(['1', '--', process.execPath, '-e', 'setTimeout(() => {}, 30000)'], 8000);
    expect(result.code).toBe(124);
    expect(result.stderr).toMatch(/timeout|timed out/i);
  }, 10000);

  it('[REQ-P015-TIMEOUT] rejects invocations missing the `--` separator with a non-zero exit', async () => {
    const result = await runWrapper(['5', 'node', '-e', 'process.exit(0)']);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toMatch(/usage|--/i);
  });

  it('[REQ-P015-TIMEOUT] rejects invocations with a non-numeric timeout', async () => {
    const result = await runWrapper(['abc', '--', 'node', '-e', 'process.exit(0)']);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toMatch(/usage|timeout|number/i);
  });
});
