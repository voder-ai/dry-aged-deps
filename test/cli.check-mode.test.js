/**
 * @story ??? - TODO: specify story file
 * @req UNKNOWN - TODO: specify requirement ID and description
 */

import { describe, it, expect } from 'vitest';
import { execa } from 'execa';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cliPath = path.join(__dirname, '..', 'bin', 'dry-aged-deps.js');

describe('dry-aged-deps CLI check mode', () => {
  it('exit code 0 when no updates available in JSON mode', async () => {
    // Story: REQ-EXIT-0-NO-UPDATES
    const result = await execa('node', [cliPath, '--check', '--format=json'], {
      env: { ...process.env },
      reject: false,
    });
    expect(result.exitCode).toBe(0);
    // JSON output should have summary.safeUpdates = 0
    const output = JSON.parse(result.stdout);
    expect(output.summary.safeUpdates).toBe(0);
  });

  it('exit code 1 when safe updates available in table (default) mode', async () => {
    // Story: REQ-EXIT-1-ON-UPDATES
    const result = await execa('node', [cliPath, '--check'], {
      env: { ...process.env, DRY_AGED_DEPS_MOCK: '1' },
      reject: false,
    });
    expect(result.exitCode).toBe(1);
    // Clear output: should list outdated packages
    expect(result.stdout).toContain('Outdated packages:');
    expect(result.stdout).toContain('fakepkg');
  });

  it('exit code 1 when safe updates available in JSON mode', async () => {
    // Story: REQ-FORMAT-SUPPORT
    const result = await execa('node', [cliPath, '--check', '--format=json'], {
      env: { ...process.env, DRY_AGED_DEPS_MOCK: '1' },
      reject: false,
    });
    expect(result.exitCode).toBe(1);
    const output = JSON.parse(result.stdout);
    expect(output.summary.safeUpdates).toBe(1);
  });

  it('exit code 1 when safe updates available in XML mode', async () => {
    // Story: REQ-FORMAT-SUPPORT
    const result = await execa('node', [cliPath, '--check', '--format=xml'], {
      env: { ...process.env, DRY_AGED_DEPS_MOCK: '1' },
      reject: false,
    });
    expect(result.exitCode).toBe(1);
    // XML output should contain <item> for fakepkg
    expect(result.stdout).toMatch(/<package>[\s\S]*fakepkg[\s\S]*<\/package>/);
  });

  it('exit code 2 on invalid format error', async () => {
    // Story: REQ-EXIT-2-ON-ERROR
    const result = await execa('node', [cliPath, '--check', '--format=bad'], {
      env: { ...process.env },
      reject: false,
    });
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain('Invalid format: bad');
  });

  it('rejects out-of-range --min-age values (>365) in check mode', async () => {
    // Story: prompts/012.0-DEV-EXIT-CODE-REFINEMENT.md
    const result = await execa('node', [cliPath, '--check', '--min-age=10000'], {
      env: { ...process.env, DRY_AGED_DEPS_MOCK: '1' },
      reject: false,
    });
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain('Invalid min-age: 10000. Must be an integer between 1 and 365.');
  });
});
