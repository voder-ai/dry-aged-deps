/** @story prompts/dry-aged-deps-user-story-map.md */
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
// Use project root as fixtures directory since mock mode bypasses npm operations
const fixturesDir = process.cwd();
const cliPath = path.join(__dirname, '..', 'bin', 'dry-aged-deps.js');

describe('dry-aged-deps CLI JSON output format', () => {
  it('outputs valid JSON with timestamp, packages array, and summary object', async () => {
    const result = await execa('node', [cliPath, '--format=json'], {
      cwd: fixturesDir,
      env: { ...process.env, DRY_AGED_DEPS_MOCK: '1' },
      reject: false,
    });
    expect(result.exitCode).toBe(1);
    const json = result.stdout;
    expect(() => JSON.parse(json)).not.toThrow();
    const obj = JSON.parse(json);
    expect(obj).toHaveProperty('timestamp');
    expect(obj).toHaveProperty('packages');
    expect(Array.isArray(obj.packages)).toBe(true);
    expect(obj).toHaveProperty('summary');
    expect(typeof obj.summary.totalOutdated).toBe('number');
  });

  it('excludes log warnings for JSON format', async () => {
    const result = await execa('node', [cliPath, '--format=json'], {
      cwd: fixturesDir,
      env: { ...process.env, DRY_AGED_DEPS_MOCK: '1' },
      reject: false,
    });
    expect(result.stderr).toBe('');
  });

  it('filters packages younger than min-age of 1', async () => {
    const result = await execa('node', [cliPath, '--format=json', '--min-age=1'], {
      cwd: fixturesDir,
      env: { ...process.env, DRY_AGED_DEPS_MOCK: '1', DRY_AGED_DEPS_MOCK_AGE_NOW: '1' },
    });
    expect(result.exitCode).toBe(0);
    const obj = JSON.parse(result.stdout);
    expect(obj.packages).toHaveLength(0);
    expect(obj.summary.filteredByAge).toBeGreaterThan(0);
  });

  it('filters packages with vulnerabilities', async () => {
    const result = await execa('node', [cliPath, '--format=json'], {
      cwd: fixturesDir,
      env: { ...process.env, DRY_AGED_DEPS_MOCK: '1', DRY_AGED_DEPS_MOCK_VULN: '1' },
    });
    expect(result.exitCode).toBe(0);
    const obj = JSON.parse(result.stdout);
    expect(obj.packages).toHaveLength(0);
    expect(obj.summary.filteredBySecurity).toBeGreaterThan(0);
  });
});
