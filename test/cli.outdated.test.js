/**
 * Tests for CLI outdated output behavior
 * @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-NPM-COMMAND REQ-OUTPUT-DISPLAY
 */

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

describe('Story 001.0-DEV-RUN-NPM-OUTDATED: dry-aged-deps CLI outdated output', () => {
  beforeAll(async () => {
    // Create a unique temporary directory for this test suite
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dry-aged-deps-test-outdated-'));
    fixturesDir = path.join(tempDir, 'fixtures');

    // Copy fixture files to temp directory
    await fs.mkdir(fixturesDir, { recursive: true });
    await fs.copyFile(path.join(fixturesSourceDir, 'package.json'), path.join(fixturesDir, 'package.json'));

    // Install production dependencies for fixture project in temp directory (dry-run)
    await execa('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--omit=dev', '--dry-run'], {
      cwd: fixturesDir,
      env: process.env,
    });
  }, 60000);

  afterAll(async () => {
    // Clean up temporary directory
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  it('[REQ-OUTPUT-DISPLAY] runs without error on test project with outdated dependencies', async () => {
    const cliPath = path.join(__dirname, '..', 'bin', 'dry-aged-deps.js');

    const result = await execa('node', [cliPath], {
      cwd: fixturesDir,
      env: process.env,
      reject: false,
    });

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain('Outdated packages:');
    expect(result.stdout).toContain('Name	Current	Wanted	Latest	Age (days)');

    // The output should contain at least one of our test packages
    const hasLodash = result.stdout.includes('lodash');
    const hasExpress = result.stdout.includes('express');
    const hasJest = result.stdout.includes('jest');

    expect(hasLodash || hasExpress || hasJest).toBe(true);
  }, 30000);
});
