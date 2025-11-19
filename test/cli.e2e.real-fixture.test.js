/**
 * Tests for CLI E2E real fixture behavior and positive age detection
 * @story prompts/003.0-DEV-IDENTIFY-OUTDATED.md
 * @story prompts/012.0-DEV-EXIT-CODE-REFINEMENT.md
 * @req REQ-AGE-THRESHOLD - Ensure mature versions (age > threshold) appear in output
 * @req REQ-EXIT-1 - Exit code 1 when safe updates available
 */
/* eslint-disable security/detect-object-injection */
import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import { describe, it, test, beforeAll, afterAll, expect } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesSourceDir = path.join(__dirname, 'fixtures');

let tempDir;
let fixturesDir;
let result;
let lines;
let headerIndex;
let dataLines;

describe('prompts/003.0-DEV-IDENTIFY-OUTDATED.md, prompts/012.0-DEV-EXIT-CODE-REFINEMENT.md: dry-aged-deps CLI E2E with real fixture (mocked)', () => {
  beforeAll(async () => {
    // Setup temporary fixtures directory
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dry-aged-deps-test-e2e-'));
    fixturesDir = path.join(tempDir, 'fixtures');
    await fs.mkdir(fixturesDir, { recursive: true });
    // Copy package.json fixture
    await fs.copyFile(path.join(fixturesSourceDir, 'package.json'), path.join(fixturesDir, 'package.json'));
    // Validate fixture via npm dry-run install
    await execa('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--omit=dev', '--dry-run'], {
      cwd: fixturesDir,
      env: process.env,
    });
    // Execute CLI
    const cliPath = path.join(__dirname, '..', 'bin', 'dry-aged-deps.js');
    result = await execa('node', [cliPath], {
      cwd: fixturesDir,
      env: { ...process.env, DRY_AGED_DEPS_MOCK: '1' },
      reject: false,
    });
    // Parse output lines
    lines = result.stdout.split(/\r?\n/);
    headerIndex = lines.findIndex((line) => line.includes('Name') && line.includes('Age (days)'));
    dataLines = lines.slice(headerIndex + 1).filter((line) => line.trim().length > 0);
  }, 60000);

  afterAll(async () => {
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  it('has exit code 1', () => {
    expect(result.exitCode).toBe(1);
  });

  it('outputs header row with Age (days)', () => {
    expect(lines[headerIndex]).toContain('Age (days)');
  });

  it('has at least one data row', () => {
    expect(dataLines.length).toBeGreaterThan(0);
  });

  it('every data row has a positive integer age', () => {
    const ages = dataLines.map((line) => {
      const cols = line.split('	');
      return parseInt(cols[4], 10);
    });
    expect(ages.every((age) => Number.isInteger(age) && age > 0)).toBe(true);
  });
});