/**
 * Tests for CLI invalid option error handling
 * @supports prompts/014.0-DEV-INVALID-OPTION-ERROR.md REQ-INVALID-VALUE-ERROR REQ-ERROR-EXIT-CODE REQ-HELP-SUGGESTION
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { execa } from 'execa';

describe('Story 014.0-DEV-INVALID-OPTION-ERROR: CLI entrypoint', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const cliPath = path.resolve(__dirname, '../bin/dry-aged-deps.js');
  const pkgPath = path.resolve(__dirname, '../package.json');

  test('[REQ-HELP-SUGGESTION] --help flag prints usage and exits 0', async () => {
    const { stdout, exitCode } = await execa('node', [cliPath, '--help']);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('Usage: dry-aged-deps');
  });

  test('[REQ-HELP-SUGGESTION] --version flag prints version and exits 0', async () => {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    const { stdout, exitCode } = await execa('node', [cliPath, '--version']);
    expect(exitCode).toBe(0);
    expect(stdout.trim()).toBe(pkg.version);
  });

  test('[REQ-INVALID-VALUE-ERROR] invalid format flag exits with code 2 and prints error', async () => {
    const result = await execa('node', [cliPath, '--format=invalid'], {
      reject: false,
    });
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain('Invalid format: invalid');
  });
});
