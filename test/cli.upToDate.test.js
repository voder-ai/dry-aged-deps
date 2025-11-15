/**
/** @story prompts/dry-aged-deps-user-story-map.md */

* @req UNKNOWN - TODO: specify requirement ID and description
/**
 * @story prompts/dry-aged-deps-user-story-map.md
 *//**
 * @story prompts/dry-aged-deps-user-story-map.md
 */ import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesSourceDir = path.join(__dirname, 'fixtures-up-to-date');

let tempDir;
let fixturesDir;

describe('dry-aged-deps CLI up-to-date output', () => {
  beforeAll(async () => {
    // Create a unique temporary directory for this test suite
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dry-aged-deps-test-uptodate-'));
    fixturesDir = path.join(tempDir, 'fixtures');

    // Copy fixture files to temp directory
    await fs.mkdir(fixturesDir, { recursive: true });
    await fs.copyFile(path.join(fixturesSourceDir, 'package.json'), path.join(fixturesDir, 'package.json'));

    // Install dependencies for up-to-date fixture project in temp directory
    await execa('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], {
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
