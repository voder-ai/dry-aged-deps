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

describe('dry-aged-deps CLI E2E with real fixture', () => {
  beforeAll(async () => {
    // Create a unique temporary directory for this test suite
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dry-aged-deps-test-e2e-'));
    fixturesDir = path.join(tempDir, 'fixtures');

    // Copy fixture files to temp directory
    await fs.mkdir(fixturesDir, { recursive: true });
    await fs.copyFile(
      path.join(fixturesSourceDir, 'package.json'),
      path.join(fixturesDir, 'package.json')
    );

    // Install production dependencies for fixture project in temp directory
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

  it('prints at least one positive age value in the output', async () => {
    const cliPath = path.join(__dirname, '..', 'bin', 'dry-aged-deps.js');
    const result = await execa('node', [cliPath], {
      cwd: fixturesDir,
      env: process.env,
    });

    expect(result.exitCode).toBe(0);
    // Ensure header is present
    expect(result.stdout).toContain('Age (days)');

    // Parse output lines and check age column
    const lines = result.stdout.split(/\r?\n/);
    // Find index of header line
    const headerIndex = lines.findIndex(
      (line) => line.includes('Name') && line.includes('Age (days)')
    );
    expect(headerIndex).toBeGreaterThanOrEqual(0);

    // Data lines are after header
    const dataLines = lines
      .slice(headerIndex + 1)
      .filter((line) => line.trim().length > 0);
    // There should be at least one data line
    expect(dataLines.length).toBeGreaterThan(0);

    // Check if at least one age cell is a positive integer
    let foundPositive = false;
    for (const line of dataLines) {
      const cols = line.split('	');
      const ageCell = cols[4];
      const age = parseInt(ageCell, 10);
      if (!isNaN(age) && age > 0) {
        foundPositive = true;
        break;
      }
    }
    expect(foundPositive).toBe(true);
  }, 60000);
});
