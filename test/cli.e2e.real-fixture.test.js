import { describe, it, expect, beforeAll } from 'vitest';
import { execa } from 'execa';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.join(__dirname, 'fixtures');

describe('dry-aged-deps CLI E2E with real fixture', () => {
  beforeAll(async () => {
    // Install production dependencies for fixture project
    await execa('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund', '--omit=dev', '--prefer-frozen-lockfile'], {
      cwd: fixturesDir,
      env: process.env,
    });
  }, 60000);

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
    const headerIndex = lines.findIndex(line => line.includes('Name') && line.includes('Age (days)'));
    expect(headerIndex).toBeGreaterThanOrEqual(0);

    // Data lines are after header
    const dataLines = lines.slice(headerIndex + 1).filter(line => line.trim().length > 0);
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
  }, 30000);
});
