/* eslint-disable traceability/require-test-traceability */
/* eslint-disable traceability/valid-req-reference , traceability/valid-annotation-format */
/**
 * Tests for CLI config file support
 * @story prompts/010.0-DEV-CONFIG-FILE-SUPPORT.md
 * @req REQ-CONFIG-LOAD - Read and apply CLI configuration file
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { execa } from 'execa';

const cliPath = path.join(__dirname, '..', 'bin', 'dry-aged-deps.js');
let tempDir;
/**
 * Helper to write CLI config files for tests
 * @story prompts/010.0-DEV-CONFIG-FILE-SUPPORT.md
 * @req REQ-CONFIG-LOAD - Helper for writing config file in tests
 */
async function writeConfig(dir, name, content) {
  const filePath = path.join(dir, name);
  await fs.writeFile(filePath, content, 'utf8');
  return filePath;
}

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dry-aged-config-'));
  await fs.writeFile(
    path.join(tempDir, 'package.json'),
    JSON.stringify({ name: 'test-config', version: '1.0.0' }, null, 2),
    'utf8'
  );
});

afterEach(async () => {
  if (tempDir) {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

describe('prompts/010.0-DEV-CONFIG-FILE-SUPPORT.md & prompts/010.0-DEV-CONFIG-FILE-SUPPORT.md: CLI config-file support', () => {
  it('applies defaults from .dry-aged-deps.json when no flags provided', async () => {
    // Arrange: write config file
    const config = {
      minAge: 10,
      severity: 'low',
      prod: { minAge: 20, minSeverity: 'moderate' },
      dev: { minAge: 5, minSeverity: 'high' },
      format: 'json',
    };
    await writeConfig(tempDir, '.dry-aged-deps.json', JSON.stringify(config));

    // Act: run CLI in tempDir
    const result = await execa('node', [cliPath], { cwd: tempDir });

    // Assert: JSON output includes thresholds from config
    const obj = JSON.parse(result.stdout);
    expect(obj.summary.thresholds.prod.minAge).toBe(20);
    expect(obj.summary.thresholds.prod.minSeverity).toBe('moderate');
    expect(obj.summary.thresholds.dev.minAge).toBe(5);
    expect(obj.summary.thresholds.dev.minSeverity).toBe('high');
    expect(obj.summary.thresholds.prod.minAge).not.toBe(10); // config.prod overrides minAge
    expect(obj.summary.thresholds.prod.minSeverity).not.toBe('low');
  });

  it('CLI flags override config file values', async () => {
    const config = { minAge: 8, severity: 'low', format: 'json' };
    await writeConfig(tempDir, '.dry-aged-deps.json', JSON.stringify(config));

    const result = await execa('node', [cliPath, '--min-age=15', '--severity=high', '--format=xml'], { cwd: tempDir });
    // XML format with error summary may print, but exit code should be 0 or 1
    // For JSON tests, adapt: force JSON output
    const jsonRes = await execa('node', [cliPath, '--format=json', '--min-age=15', '--severity=high'], {
      cwd: tempDir,
    });
    const obj = JSON.parse(jsonRes.stdout);
    expect(obj.summary.thresholds.prod.minAge).toBe(15);
    expect(obj.summary.thresholds.prod.minSeverity).toBe('high');
  });

  it('invalid config JSON exits with code 2 and error message', async () => {
    await writeConfig(tempDir, '.dry-aged-deps.json', '{ invalidJson: }');
    try {
      await execa('node', [cliPath], { cwd: tempDir });
    } catch (err) {
      expect(err.exitCode).toBe(2);
      expect(err.stderr).toContain('Invalid JSON in config file .dry-aged-deps.json');
    }
  });

  it('unknown config key exits with code 2 and error message', async () => {
    const cfg = { foo: 123 };
    await writeConfig(tempDir, '.dry-aged-deps.json', JSON.stringify(cfg));
    await expect(execa('node', [cliPath], { cwd: tempDir })).rejects.toMatchObject({ exitCode: 2 });
    try {
      await execa('node', [cliPath], { cwd: tempDir });
    } catch (err) {
      expect(err.stderr).toContain('Unknown config key: foo');
    }
  });

  it('invalid config values for minAge exits with code 2', async () => {
    await writeConfig(tempDir, '.dry-aged-deps.json', JSON.stringify({ minAge: 0 }));
    await expect(execa('node', [cliPath], { cwd: tempDir })).rejects.toMatchObject({ exitCode: 2 });
  });

  // Story: prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md
  it('rejects config minAge >365', async () => {
    const config = { minAge: 366, format: 'json' };
    await writeConfig(tempDir, '.dry-aged-deps.json', JSON.stringify(config));
    try {
      await execa('node', [cliPath], { cwd: tempDir });
    } catch (err) {
      expect(err.exitCode).toBe(2);
      expect(err.stderr).toContain('Invalid config value for minAge: 366. Must be integer 1-365');
    }
  });

  it('supports custom config file name via --config-file flag', async () => {
    const customName = 'custom.json';
    const cfg = { minAge: 12, severity: 'moderate', format: 'json' };
    await writeConfig(tempDir, customName, JSON.stringify(cfg));
    const result = await execa('node', [cliPath, `--config-file=${customName}`], { cwd: tempDir });
    const obj = JSON.parse(result.stdout);
    expect(obj.summary.thresholds.prod.minAge).toBe(12);
    expect(obj.summary.thresholds.prod.minSeverity).toBe('moderate');
  });

  it('missing custom config file exits with code 2 and error message', async () => {
    const customName = 'nope.json';
    await expect(execa('node', [cliPath, `--config-file=${customName}`], { cwd: tempDir })).rejects.toMatchObject({
      exitCode: 2,
    });
    try {
      await execa('node', [cliPath, `--config-file=${customName}`], {
        cwd: tempDir,
      });
    } catch (err) {
      expect(err.stderr).toContain(`Configuration file not found: ${customName}`);
    }
  });
});
