/**
 * Tests for CLI E2E real fixture behavior and positive age detection
 * @story prompts/003.0-DEV-IDENTIFY-OUTDATED.md
 * @story prompts/012.0-DEV-EXIT-CODE-REFINEMENT.md
 * @req REQ-AGE-THRESHOLD - Ensure mature versions (age > threshold) appear in output
 * @req REQ-EXIT-1 - Exit code 1 when safe updates available
 */
import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { describe, test, expect } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.join(__dirname, 'fixtures');

// Create a temporary directory and copy the fixture project into it
const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dry-aged-deps-fixture-'));
const entries = await fs.readdir(fixturesDir);
for (const entry of entries) {
  await fs.cp(path.join(fixturesDir, entry), path.join(tempDir, entry), { recursive: true });
}

// Install production dependencies for fixture project in the temp dir
// eslint-disable-next-line security/detect-object-injection -- safe: this execa call runs npm install within a test-controlled temporary directory
await execa('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--omit=dev'], {
  cwd: tempDir,
});

// Execute CLI against the fixture copy
const cliPath = path.join(__dirname, '..', 'bin', 'dry-aged-deps.js');

// Set the mock flag on process.env directly to avoid object-injection patterns flagged by the linter
const originalMock = process.env.DRY_AGED_DEPS_MOCK;
process.env.DRY_AGED_DEPS_MOCK = '1';
const result = await execa('node', [cliPath], {
  cwd: tempDir,
  reject: false,
});
if (originalMock === undefined) {
  delete process.env.DRY_AGED_DEPS_MOCK;
} else {
  process.env.DRY_AGED_DEPS_MOCK = originalMock;
}

// Parse output into lines
const lines = result.stdout.split(/\r?\n/);
const headerIndex = lines.findIndex((line) => line.includes('Name') && line.includes('Age (days)'));
const dataLines = lines.slice(headerIndex + 1).filter((line) => line.trim().length > 0);

// Prefix for describe titles based on stories
const storyPrefix = 'prompts/003.0-DEV-IDENTIFY-OUTDATED.md & prompts/012.0-DEV-EXIT-CODE-REFINEMENT.md';

describe(`${storyPrefix}: dry-aged-deps CLI E2E with real fixture (mocked)`, () => {
  test('exit code is 1', () => {
    expect(result.exitCode).toBe(1);
  });

  test('outputs header row with Age (days)', () => {
    expect(lines[headerIndex]).toContain('Age (days)');
  });

  test('has at least one data row', () => {
    expect(dataLines.length).toBeGreaterThan(0);
  });

  // Parameterized test for each data row's age
  const ages = dataLines.map((line) => {
    const cols = line.split('	');
    return parseInt(cols[4], 10);
  });
  test.each(ages)('age %i is a positive integer', (age) => {
    expect(Number.isInteger(age)).toBe(true);
    expect(age).toBeGreaterThan(0);
  });
});