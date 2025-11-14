/**
 * @story prompts/dry-aged-deps-user-story-map.md
 *//**
 * @story prompts/dry-aged-deps-user-story-map.md
 */ import { describe, it, expect } from 'vitest';
import { execa } from 'execa';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cliPath = path.join(__dirname, '..', 'bin', 'dry-aged-deps.js');

describe('CLI --min-age flag', () => {
  it('rejects non-integer values', async () => {
    await expect(execa('node', [cliPath, '--min-age=abc'])).rejects.toMatchObject({ exitCode: 2 });
  });

  it('rejects out-of-range values (0)', async () => {
    await expect(execa('node', [cliPath, '--min-age=0'])).rejects.toMatchObject({ exitCode: 2 });
  });

  it('rejects out-of-range values (>365)', async () => {
    await expect(execa('node', [cliPath, '--min-age=366'])).rejects.toMatchObject({ exitCode: 2 });
  });

  it('rejects missing value for --min-age', async () => {
    await expect(execa('node', [cliPath, '--min-age'])).rejects.toMatchObject({
      exitCode: 2,
    });
  });

  it('defaults to 7 when not provided', async () => {
    const result = await execa('node', [cliPath, '--format=json'], {
      cwd: process.cwd(),
    });
    expect(result.exitCode).toBe(0);
    const obj = JSON.parse(result.stdout);
    expect(obj.summary.thresholds.prod.minAge).toBe(7);
    expect(obj.summary.thresholds.dev.minAge).toBe(7);
  });

  it('overrides default value when provided', async () => {
    const result = await execa('node', [cliPath, '--format=json', '--min-age=10'], { cwd: process.cwd() });
    expect(result.exitCode).toBe(0);
    const obj = JSON.parse(result.stdout);
    expect(obj.summary.thresholds.prod.minAge).toBe(10);
    expect(obj.summary.thresholds.dev.minAge).toBe(10);
  });
});

describe('CLI --severity flag', () => {
  it('rejects invalid severity values', async () => {
    await expect(execa('node', [cliPath, '--severity=foo'])).rejects.toMatchObject({ exitCode: 2 });
  });

  it('rejects missing value for --severity', async () => {
    await expect(execa('node', [cliPath, '--severity'])).rejects.toMatchObject({
      exitCode: 2,
    });
  });

  it('defaults to "none" when not provided', async () => {
    const result = await execa('node', [cliPath, '--format=json']);
    expect(result.exitCode).toBe(0);
    // No direct output for severity, but CLI should not error
    const obj = JSON.parse(result.stdout);
    expect(obj.summary.thresholds.prod.minAge).toBe(7);
    expect(obj.summary.thresholds.prod.minSeverity).toBe('none');
  });

  it('accepts valid severity values', { timeout: 30000 }, async () => {
    const valid = ['none', 'low', 'moderate', 'high', 'critical'];
    for (const level of valid) {
      const result = await execa('node', [cliPath, '--format=json', `--severity=${level}`]);
      expect(result.exitCode).toBe(0);
      const obj = JSON.parse(result.stdout);
      expect(obj.summary.thresholds.prod.minSeverity).toBe(level);
      expect(obj.summary.thresholds.dev.minSeverity).toBe(level);
    }
  });
});
