/* eslint-disable traceability/valid-req-reference , traceability/valid-annotation-format , traceability/valid-annotation-format */
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
import { describe, test, expect, beforeAll, afterAll } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.join(__dirname, 'fixtures');
const cliPath = path.join(__dirname, '..', 'bin', 'dry-aged-deps.js');

let tempDir;
let result;
let lines = [];
let headerIndex = -1;
let dataLines = [];
let ages = [];
let originalMock;

const storyPrefix = 'prompts/003.0-DEV-IDENTIFY-OUTDATED.md & prompts/012.0-DEV-EXIT-CODE-REFINEMENT.md';

beforeAll(async () => {
  // Create a temporary directory and copy the fixture project into it
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dry-aged-deps-fixture-'));

  // Safety assertion: ensure tempDir is inside os.tmpdir()
  const resolvedTmp = path.resolve(os.tmpdir());
  const resolvedTempDir = path.resolve(tempDir);
  if (!resolvedTempDir.startsWith(resolvedTmp)) {
    // Fail early if the tempDir is not within the system temp directory
    throw new Error(`Safety check failed: tempDir (${resolvedTempDir}) is not inside os.tmpdir() (${resolvedTmp})`);
  }

  const entries = await fs.readdir(fixturesDir);
  for (const entry of entries) {
    await fs.cp(path.join(fixturesDir, entry), path.join(tempDir, entry), { recursive: true });
  }

  // Install production dependencies for fixture project in the temp dir
  await execa('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--omit=dev'], {
    cwd: tempDir,
  });

  // Set the mock flag on process.env directly to avoid object-injection patterns flagged by the linter
  originalMock = process.env.DRY_AGED_DEPS_MOCK;
  process.env.DRY_AGED_DEPS_MOCK = '1';

  // Execute CLI against the fixture copy
  result = await execa('node', [cliPath], {
    cwd: tempDir,
    reject: false,
  });

  // Parse output into lines
  lines = result.stdout.split(/\r?\n/);
  headerIndex = lines.findIndex((line) => line.includes('Name') && line.includes('Age (days)'));
  dataLines = headerIndex >= 0 ? lines.slice(headerIndex + 1).filter((line) => line.trim().length > 0) : [];

  // Compute ages from data lines
  ages = dataLines.map((line) => {
    const cols = line.split('	');
    return parseInt(cols[4], 10);
  });
});

afterAll(async () => {
  // Restore environment variable
  if (originalMock === undefined) {
    delete process.env.DRY_AGED_DEPS_MOCK;
  } else {
    process.env.DRY_AGED_DEPS_MOCK = originalMock;
  }

  // Clean up temporary directory
  if (tempDir) {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  }
});

describe(`${storyPrefix}: dry-aged-deps CLI E2E with real fixture (mocked)`, () => {
  test('exit code is 1', () => {
    expect(result.exitCode).toBe(1);
  });

  test('outputs header row with Age (days)', () => {
    expect(lines.at(headerIndex) ?? '').toContain('Age (days)');
  });

  test('has at least one data row', () => {
    expect(dataLines.length).toBeGreaterThan(0);
  });

  test('all ages are positive integers', () => {
    expect(ages.length).toBeGreaterThan(0);
    for (const age of ages) {
      expect(Number.isInteger(age)).toBe(true);
      expect(age).toBeGreaterThan(0);
    }
  });
});
