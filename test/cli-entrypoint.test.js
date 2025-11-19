/**
 * Tests for CLI invalid option error handling
 * @story prompts/014.0-DEV-INVALID-OPTION-ERROR.md
 * @req REQ-INVALID-VALUE-ERROR - Error on invalid format values
 * @req REQ-ERROR-EXIT-CODE - Exit with code 2 for usage/option errors
 * @req REQ-HELP-SUGGESTION - Suggest using --help in error message
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { execa } from 'execa';

describe('prompts/014.0-DEV-INVALID-OPTION-ERROR.md: CLI entrypoint', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const cliPath = path.resolve(__dirname, '../bin/dry-aged-deps.js');
  const pkgPath = path.resolve(__dirname, '../package.json');

  test('--help flag prints usage and exits 0', async () => {
    const { stdout, exitCode } = await execa('node', [cliPath, '--help']);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('Usage: dry-aged-deps');
  });

  test('--version flag prints version and exits 0', async () => {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    const { stdout, exitCode } = await execa('node', [cliPath, '--version']);
    expect(exitCode).toBe(0);
    expect(stdout.trim()).toBe(pkg.version);
  });

  test('invalid format flag exits with code 2 and prints error', async () => {
    const result = await execa('node', [cliPath, '--format=invalid'], {
      reject: false,
    });
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain('Invalid format: invalid');
  });
});
