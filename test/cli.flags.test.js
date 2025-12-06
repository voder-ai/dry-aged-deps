/**
 * Tests for CLI severity flag parsing
 * @supports prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md REQ-CLI-FLAG
 * @supports prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md REQ-CLI-FLAG REQ-VALIDATION
 */

import { execa } from 'execa';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cliPath = path.join(__dirname, '..', 'bin', 'dry-aged-deps.js');

describe('Story 005.0-DEV-CONFIGURABLE-AGE-THRESHOLD: CLI --min-age flag', () => {
  it('[REQ-VALIDATION] rejects non-integer values', async () => {
    await expect(execa('node', [cliPath, '--min-age=abc'])).rejects.toMatchObject({ exitCode: 2 });
  });

  it('[REQ-VALIDATION] rejects out-of-range values (0)', async () => {
    await expect(execa('node', [cliPath, '--min-age=0'])).rejects.toMatchObject({ exitCode: 2 });
  });

  it('[REQ-VALIDATION] rejects out-of-range values (>365)', async () => {
    await expect(execa('node', [cliPath, '--min-age=366'])).rejects.toMatchObject({ exitCode: 2 });
  });

  it('[REQ-VALIDATION] rejects missing value for --min-age', async () => {
    await expect(execa('node', [cliPath, '--min-age'])).rejects.toMatchObject({
      exitCode: 2,
    });
  });

  it('[REQ-CLI-FLAG] defaults to 7 when not provided', async () => {
    const result = await execa('node', [cliPath, '--format=json'], {
      cwd: process.cwd(),
    });
    expect(result.exitCode).toBe(0);
    const obj = JSON.parse(result.stdout);
    expect(obj.summary.thresholds.prod.minAge).toBe(7);
    expect(obj.summary.thresholds.dev.minAge).toBe(7);
  });

  it('[REQ-CLI-FLAG] overrides default value when provided', async () => {
    const result = await execa('node', [cliPath, '--format=json', '--min-age=10'], { cwd: process.cwd() });
    expect(result.exitCode).toBe(0);
    const obj = JSON.parse(result.stdout);
    expect(obj.summary.thresholds.prod.minAge).toBe(10);
    expect(obj.summary.thresholds.dev.minAge).toBe(10);
  });
});

describe('Story 006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD: CLI --severity flag', () => {
  it('[REQ-VALIDATION] rejects invalid severity values', async () => {
    await expect(execa('node', [cliPath, '--severity=foo'])).rejects.toMatchObject({ exitCode: 2 });
  });

  it('[REQ-VALIDATION] rejects missing value for --severity', async () => {
    await expect(execa('node', [cliPath, '--severity'])).rejects.toMatchObject({
      exitCode: 2,
    });
  });

  it('[REQ-CLI-FLAG] defaults to "none" when not provided', async () => {
    const result = await execa('node', [cliPath, '--format=json']);
    expect(result.exitCode).toBe(0);
    // No direct output for severity, but CLI should not error
    const obj = JSON.parse(result.stdout);
    expect(obj.summary.thresholds.prod.minAge).toBe(7);
    expect(obj.summary.thresholds.prod.minSeverity).toBe('none');
  });

  const valid = ['none', 'low', 'moderate', 'high', 'critical'];

  it.each(valid)('[REQ-VALIDATION] parses valid severity %s', { timeout: 30000 }, async (level) => {
    const result = await execa('node', [cliPath, '--format=json', `--severity=${level}`]);
    expect(result.exitCode).toBe(0);
    const obj = JSON.parse(result.stdout);
    expect(obj.summary.thresholds.prod.minSeverity).toBe(level);
    expect(obj.summary.thresholds.dev.minSeverity).toBe(level);
  });
});
