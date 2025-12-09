/**
 * Tests for dry-aged-deps CLI up-to-date output
 * @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-OUTPUT-DISPLAY
 */

import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let tempDir;
let fixturesDir;

describe('Story 001.0-DEV-RUN-NPM-OUTDATED: dry-aged-deps CLI up-to-date output', () => {
  beforeAll(async () => {
    // Create a unique temporary directory for this test suite
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dry-aged-deps-test-uptodate-'));
    fixturesDir = path.join(tempDir, 'fixtures');
    await fs.mkdir(fixturesDir, { recursive: true });

    // Get the latest version of express from npm
    const { stdout: latestVersion } = await execa('npm', ['view', 'express', 'version'], {
      env: process.env,
    });

    // Create package.json with the latest version
    await fs.writeFile(
      path.join(fixturesDir, 'package.json'),
      JSON.stringify({
        name: 'test-fixture-uptodate',
        version: '1.0.0',
        dependencies: {
          express: latestVersion.trim(),
        },
      })
    );

    // Install dependencies to ensure package-lock.json is created
    await execa('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], {
      cwd: fixturesDir,
      env: process.env,
    });
  }, 60000);

  afterAll(async () => {
    // Clean up temporary directory
    // @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-OUTPUT-DISPLAY
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  it('[REQ-OUTPUT-DISPLAY] prints message when all dependencies are up to date', async () => {
    const cliPath = path.join(__dirname, '..', 'bin', 'dry-aged-deps.js');

    const result = await execa('node', [cliPath], {
      cwd: fixturesDir,
      env: process.env,
    });

    expect(result.exitCode).toBe(0);
    // When all dependencies are truly up-to-date, expect the up-to-date message
    expect(result.stdout).toContain('All dependencies are up to date');
  }, 30000);
});
