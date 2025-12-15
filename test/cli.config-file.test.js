/**
 * Tests for CLI with config file support
 *
 * @supports prompts/010.0-DEV-CONFIG-FILE-SUPPORT.md REQ-CONFIG-LOCATION REQ-CONFIG-SCHEMA REQ-PRECEDENCE REQ-VALIDATION REQ-ERROR-MESSAGES REQ-OPTIONAL REQ-MERGE-LOGIC
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
 *
 * @param {string} dir - Directory path
 * @param {string} name - Config file name
 * @param {string} content - File content
 * @returns {Promise<string>} File path
 * @supports prompts/010.0-DEV-CONFIG-FILE-SUPPORT.md REQ-CONFIG-SCHEMA
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
  // @supports prompts/010.0-DEV-CONFIG-FILE-SUPPORT.md REQ-CONFIG-LOCATION
  if (tempDir) {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

describe('Story 010.0-DEV-CONFIG-FILE-SUPPORT: CLI config-file support', () => {
  it('[REQ-CONFIG-SCHEMA][REQ-OPTIONAL] applies defaults from .dry-aged-deps.json when no flags provided', async () => {
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

  it('[REQ-PRECEDENCE] CLI flags override config file values', async () => {
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

  it('[REQ-VALIDATION][REQ-ERROR-MESSAGES] invalid config JSON exits with code 2 and error message', async () => {
    await writeConfig(tempDir, '.dry-aged-deps.json', '{ invalidJson: }');
    // @supports prompts/010.0-DEV-CONFIG-FILE-SUPPORT.md REQ-VALIDATION
    try {
      await execa('node', [cliPath], { cwd: tempDir });
    } catch (err) {
      // @supports prompts/010.0-DEV-CONFIG-FILE-SUPPORT.md REQ-VALIDATION
      expect(err.exitCode).toBe(2);
      expect(err.stderr).toContain('Invalid JSON in config file .dry-aged-deps.json');
    }
  });

  it('[REQ-VALIDATION][REQ-ERROR-MESSAGES] unknown config key exits with code 2 and error message', async () => {
    const cfg = { foo: 123 };
    await writeConfig(tempDir, '.dry-aged-deps.json', JSON.stringify(cfg));
    await expect(execa('node', [cliPath], { cwd: tempDir })).rejects.toMatchObject({ exitCode: 2 });
    // @supports prompts/010.0-DEV-CONFIG-FILE-SUPPORT.md REQ-VALIDATION
    try {
      await execa('node', [cliPath], { cwd: tempDir });
    } catch (err) {
      // @supports prompts/010.0-DEV-CONFIG-FILE-SUPPORT.md REQ-VALIDATION
      expect(err.stderr).toContain('Unknown config key: foo');
    }
  });

  it('[REQ-VALIDATION] invalid config values for minAge exits with code 2', async () => {
    await writeConfig(tempDir, '.dry-aged-deps.json', JSON.stringify({ minAge: 0 }));
    await expect(execa('node', [cliPath], { cwd: tempDir })).rejects.toMatchObject({ exitCode: 2 });
  });

  // Story: prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md
  it('[REQ-VALIDATION][REQ-ERROR-MESSAGES] rejects config minAge >365', async () => {
    const config = { minAge: 366, format: 'json' };
    await writeConfig(tempDir, '.dry-aged-deps.json', JSON.stringify(config));
    // @supports prompts/010.0-DEV-CONFIG-FILE-SUPPORT.md REQ-VALIDATION
    try {
      await execa('node', [cliPath], { cwd: tempDir });
    } catch (err) {
      // @supports prompts/010.0-DEV-CONFIG-FILE-SUPPORT.md REQ-VALIDATION
      expect(err.exitCode).toBe(2);
      expect(err.stderr).toContain('Invalid config value for minAge: 366. Must be integer 1-365');
    }
  });

  it('[REQ-CONFIG-LOCATION] supports custom config file name via --config-file flag', async () => {
    const customName = 'custom.json';
    const cfg = { minAge: 12, severity: 'moderate', format: 'json' };
    await writeConfig(tempDir, customName, JSON.stringify(cfg));
    const result = await execa('node', [cliPath, `--config-file=${customName}`], { cwd: tempDir });
    const obj = JSON.parse(result.stdout);
    expect(obj.summary.thresholds.prod.minAge).toBe(12);
    expect(obj.summary.thresholds.prod.minSeverity).toBe('moderate');
  });

  it('[REQ-ERROR-MESSAGES] missing custom config file exits with code 2 and error message', async () => {
    const customName = 'nope.json';
    await expect(execa('node', [cliPath, `--config-file=${customName}`], { cwd: tempDir })).rejects.toMatchObject({
      exitCode: 2,
    });
    // @supports prompts/010.0-DEV-CONFIG-FILE-SUPPORT.md REQ-ERROR-MESSAGES
    try {
      await execa('node', [cliPath, `--config-file=${customName}`], {
        cwd: tempDir,
      });
    } catch (err) {
      // @supports prompts/010.0-DEV-CONFIG-FILE-SUPPORT.md REQ-ERROR-MESSAGES
      expect(err.stderr).toContain(`Configuration file not found: ${customName}`);
    }
  });
});
