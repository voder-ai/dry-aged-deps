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
import { fileURLToPath } from 'url';
import { describe, test, expect } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.join(__dirname, 'fixtures');

// Install production dependencies for fixture project
await execa('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--omit=dev'], {
  cwd: fixturesDir,
});

// Execute CLI against the fixture
const cliPath = path.join(__dirname, '..', 'bin', 'dry-aged-deps.js');
const result = await execa('node', [cliPath], {
  cwd: fixturesDir,
  env: { ...process.env, DRY_AGED_DEPS_MOCK: '1' },
  reject: false,
});

// Parse output into lines
const lines = result.stdout.split(/\r?\n/);
const headerIndex = lines.findIndex(
  (line) => line.includes('Name') && line.includes('Age (days)')
);
const dataLines = lines.slice(headerIndex + 1).filter((line) => line.trim().length > 0);

// Prefix for describe titles based on stories
const storyPrefix =
  'prompts/003.0-DEV-IDENTIFY-OUTDATED.md & prompts/012.0-DEV-EXIT-CODE-REFINEMENT.md';

describe(
  `prompts/003.0-DEV-IDENTIFY-OUTDATED.md & prompts/012.0-DEV-EXIT-CODE-REFINEMENT.md: ${storyPrefix}: dry-aged-deps CLI E2E with real fixture (mocked)`,
  () => {
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
  }
);
