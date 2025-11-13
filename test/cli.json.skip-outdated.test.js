// Story: prompts/008.0-DEV-JSON-OUTPUT.md
// Tests for: Early JSON branch bypasses npm outdated when package.json exists

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { execa } from 'execa';

const cliPath = path.join(__dirname, '..', 'bin', 'dry-aged-deps.js');
let tempDir;

beforeEach(async () => {
  // Create a temporary directory with a package.json
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dry-aged-json-'));
  const pkg = { name: 'test', version: '1.0.0' };
  await fs.writeFile(path.join(tempDir, 'package.json'), JSON.stringify(pkg), 'utf8');
});

afterEach(async () => {
  if (tempDir) {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

describe('CLI JSON skip outdated behavior', () => {
  it('outputs valid empty JSON report without running npm outdated', async () => {
    const result = await execa('node', [cliPath, '--format=json'], { cwd: tempDir });
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe('');

    // Parse JSON output
    const obj = JSON.parse(result.stdout);
    expect(obj).toHaveProperty('timestamp');
    expect(Array.isArray(obj.packages)).toBe(true);
    expect(obj.packages).toHaveLength(0);
    expect(obj).toHaveProperty('summary');
    expect(obj.summary).toMatchObject({
      totalOutdated: 0,
      safeUpdates: 0,
      filteredByAge: 0,
      filteredBySecurity: 0,
    });

    // Default thresholds should be applied
    expect(obj.summary.thresholds).toEqual({
      prod: { minAge: 7, minSeverity: 'none' },
      dev: { minAge: 7, minSeverity: 'none' },
    });
  });
});
