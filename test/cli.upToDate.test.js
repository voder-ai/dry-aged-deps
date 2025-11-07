import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execa } from 'execa';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.join(__dirname, 'fixtures-up-to-date');

describe('dry-aged-deps CLI up-to-date output', () => {
  beforeAll(async () => {
    // Install dependencies for up-to-date fixture project
    await execa('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund', '--prefer-frozen-lockfile'], {
      cwd: fixturesDir,
      env: process.env,
    });
  });

  afterAll(() => {
    // Clean up installed dependencies and lockfile
    fs.rmSync(path.join(fixturesDir, 'node_modules'), { recursive: true, force: true });
    fs.rmSync(path.join(fixturesDir, 'package-lock.json'), { force: true });
  });

  it('prints message when all dependencies are up to date', async () => {
    const cliPath = path.join(__dirname, '..', 'bin', 'dry-aged-deps.js');

    const result = await execa('node', [cliPath], {
      cwd: fixturesDir,
      env: process.env,
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('All dependencies are up to date.');
  }, 30000);
});
