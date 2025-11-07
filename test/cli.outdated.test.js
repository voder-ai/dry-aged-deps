import { describe, it, expect } from 'vitest';
import { execa } from 'execa';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('dry-aged-deps CLI outdated output', () => {
  it('runs without error on test project with outdated dependencies', async () => {
    const fixturesDir = path.join(__dirname, 'fixtures');
    const cliPath = path.join(__dirname, '..', 'bin', 'dry-aged-deps.js');
    
    const result = await execa('node', [cliPath], {
      cwd: fixturesDir,
      env: process.env
    });
    
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Outdated packages:');
    expect(result.stdout).toContain('Name\tCurrent\tWanted\tLatest\tAge (days)');
    
    // The output should contain at least one of our test packages
    const hasLodash = result.stdout.includes('lodash');
    const hasExpress = result.stdout.includes('express');
    const hasJest = result.stdout.includes('jest');
    
    expect(hasLodash || hasExpress || hasJest).toBe(true);
  }, 30000); // Increased timeout for npm commands
});
