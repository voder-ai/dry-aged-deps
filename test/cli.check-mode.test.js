// Story: prompts/013.0-DEV-CHECK-MODE.md
// Tests for: REQ-CHECK-FLAG, REQ-EXIT-1-ON-UPDATES, REQ-EXIT-0-NO-UPDATES, REQ-EXIT-2-ON-ERROR, REQ-FORMAT-SUPPORT
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
});