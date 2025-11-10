import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesSourceDir = path.join(__dirname, 'fixtures');

let tempDir;
let fixturesDir;

describe('dry-aged-deps CLI XML output format', () => {
  beforeAll(async () => {
    // Create a unique temporary directory for this test suite
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dry-aged-deps-test-xml-'));
    fixturesDir = path.join(tempDir, 'fixtures');

    // Copy fixture files to temp directory
    await fs.mkdir(fixturesDir, { recursive: true });
    await fs.copyFile(
      path.join(fixturesSourceDir, 'package.json'),
      path.join(fixturesDir, 'package.json')
    );

    // Install production dependencies in temp directory
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

  afterAll(async () => {
    // Clean up temporary directory
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  it('outputs valid XML with proper root and package elements', async () => {
    const cliPath = path.join(__dirname, '..', 'bin', 'dry-aged-deps.js');
    const result = await execa('node', [cliPath, '--format=xml'], {
      cwd: fixturesDir,
      env: { ...process.env, DRY_AGED_DEPS_MOCK: '1' },
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
    // Use mock data to avoid real network calls
    const result = await execa('node', [cliPath, '--format=xml'], {
      cwd: fixturesDir,
      env: { ...process.env, DRY_AGED_DEPS_MOCK: '1' },
    });
    expect(result.stderr).toBe('');
  });
});
