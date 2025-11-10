import { describe, it, expect, beforeAll } from 'vitest';
import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.join(__dirname, 'fixtures');

describe('dry-aged-deps CLI JSON output format', () => {
  beforeAll(async () => {
    // Prepare real fixture
    await fs.rm(path.join(fixturesDir, 'node_modules'), {
      recursive: true,
      force: true,
    });
    await fs.rm(path.join(fixturesDir, 'package-lock.json'), { force: true });
    // Install production dependencies
    await execa(
      'npm',
      [
        'install',
        '--prefer-offline',
        '--ignore-scripts',
        '--no-audit',
        '--no-fund',
        '--omit=dev',
      ],
      {
        cwd: fixturesDir,
        env: process.env,
      }
    );
  }, 60000);

  it('outputs valid JSON with timestamp, packages array, and summary object', async () => {
    const cliPath = path.join(__dirname, '..', 'bin', 'dry-aged-deps.js');
    const result = await execa('node', [cliPath, '--format=json'], {
      cwd: fixturesDir,
      env: process.env,
    });
    expect(result.exitCode).toBe(0);
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
    const cliPath = path.join(__dirname, '..', 'bin', 'dry-aged-deps.js');
    // Force a fetch error by using a package that errors
    const result = await execa('node', [cliPath, '--format=json'], {
      cwd: fixturesDir,
      env: { ...process.env, INVALID_MODE: 'true' },
    });
    expect(result.stderr).toBe('');
  });
});
