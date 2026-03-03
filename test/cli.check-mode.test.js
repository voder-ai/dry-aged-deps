/**
 * Tests for CLI Check Mode (--check)
 * @supports prompts/013.0-DEV-CHECK-MODE.md REQ-CHECK-FLAG REQ-EXIT-1-ON-UPDATES REQ-EXIT-0-NO-UPDATES REQ-EXIT-2-ON-ERROR REQ-FORMAT-SUPPORT
 */

import { describe, it, expect } from 'vitest';
import { execa } from 'execa';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cliPath = path.join(__dirname, '..', 'bin', 'dry-aged-deps.js');

describe('Story 013.0-DEV-CHECK-MODE: dry-aged-deps CLI check mode', () => {
  it('[REQ-EXIT-0-NO-UPDATES] exit code 0 when no updates available in JSON mode', { timeout: 15000 }, async () => {
    // Create a temp dir with a bare package.json (no dependencies) so npm outdated returns empty
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dry-aged-check-'));
    await fs.writeFile(path.join(tempDir, 'package.json'), JSON.stringify({ name: 'test-empty', version: '1.0.0' }));
    try {
      const result = await execa('node', [cliPath, '--check', '--format=json'], {
        cwd: tempDir,
        env: { ...process.env },
        reject: false,
      });
      expect(result.exitCode).toBe(0);
      // JSON output should have summary.safeUpdates = 0
      const output = JSON.parse(result.stdout);
      expect(output.summary.safeUpdates).toBe(0);
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  it('[REQ-EXIT-1-ON-UPDATES] exit code 1 when safe updates available in table (default) mode', async () => {
    const result = await execa('node', [cliPath, '--check'], {
      env: { ...process.env, DRY_AGED_DEPS_MOCK: '1' },
      reject: false,
    });
    expect(result.exitCode).toBe(1);
    // Clear output: should list outdated packages
    expect(result.stdout).toContain('Outdated packages:');
    expect(result.stdout).toContain('fakepkg');
  });

  it('[REQ-FORMAT-SUPPORT] exit code 1 when safe updates available in JSON mode', async () => {
    const result = await execa('node', [cliPath, '--check', '--format=json'], {
      env: { ...process.env, DRY_AGED_DEPS_MOCK: '1' },
      reject: false,
    });
    expect(result.exitCode).toBe(1);
    const output = JSON.parse(result.stdout);
    expect(output.summary.safeUpdates).toBe(1);
  });

  it('[REQ-FORMAT-SUPPORT] exit code 1 when safe updates available in XML mode', async () => {
    const result = await execa('node', [cliPath, '--check', '--format=xml'], {
      env: { ...process.env, DRY_AGED_DEPS_MOCK: '1' },
      reject: false,
    });
    expect(result.exitCode).toBe(1);
    // XML output should contain <item> for fakepkg
    expect(result.stdout).toMatch(/<package>[\s\S]*fakepkg[\s\S]*<\/package>/);
  });

  it('[REQ-EXIT-2-ON-ERROR] exit code 2 on invalid format error', async () => {
    const result = await execa('node', [cliPath, '--check', '--format=bad'], {
      env: { ...process.env },
      reject: false,
    });
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain('Invalid format: bad');
  });

  it('[REQ-EXIT-2-ON-ERROR] rejects out-of-range --min-age values (>365) in check mode', async () => {
    const result = await execa('node', [cliPath, '--check', '--min-age=10000'], {
      env: { ...process.env, DRY_AGED_DEPS_MOCK: '1' },
      reject: false,
    });
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain('Invalid min-age: 10000. Must be an integer between 1 and 365.');
  });
});
