import { describe, it, expect, beforeAll } from 'vitest';
import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.join(__dirname, 'fixtures');

describe('dry-aged-deps CLI XML output format', () => {
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

  it('outputs valid XML with proper root and package elements', async () => {
    const cliPath = path.join(__dirname, '..', 'bin', 'dry-aged-deps.js');
    const result = await execa('node', [cliPath, '--format=xml'], {
      cwd: fixturesDir,
      env: process.env,
    });
    expect(result.exitCode).toBe(0);
    const xml = result.stdout;
    expect(xml.startsWith('<?xml')).toBe(true);
    expect(xml).toContain('<outdated-packages');
    expect(xml).toContain('<packages>');
    expect(xml).toMatch(/<package>\s*<name>.*<\/name>/);
  }, 30000);

  it('excludes log warnings for XML format', async () => {
    const cliPath = path.join(__dirname, '..', 'bin', 'dry-aged-deps.js');
    // Force a fetch error by using a package that errors
    const result = await execa('node', [cliPath, '--format=xml'], {
      cwd: fixturesDir,
      env: { ...process.env, INVALID_MODE: 'true' },
    });
    expect(result.stderr).toBe('');
  });
});
