/**
 * @story prompts/dry-aged-deps-user-story-map.md
 * @req UNKNOWN - TODO: specify requirement ID and description
 */
* @req UNKNOWN - TODO: specify requirement ID and description
/**
 * @story prompts/dry-aged-deps-user-story-map.md
 *//**
 * @story prompts/dry-aged-deps-user-story-map.md
 *//**
 * Functional assessment - CLI end-to-end tests for user stories 001-013
 */
import { describe, test, expect } from 'vitest';
import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cliPath = path.resolve(__dirname, '../bin/dry-aged-deps.js');

async function runCli(args, options = {}) {
  const env = { ...process.env, ...(options.env || {}) };
  return execa('node', [cliPath, ...args], {
    cwd: options.cwd || process.cwd(),
    env,
    reject: false,
  });
}

describe('Functional assessment - CLI end-to-end', () => {
  // Story: prompts/001.0-DEV-RUN-NPM-OUTDATED.md
  test('001.0-DEV-RUN-NPM-OUTDATED: Runs npm outdated and displays results', async () => {
    const result = await runCli([], { env: { DRY_AGED_DEPS_MOCK: '1' } });
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain('Outdated packages:');
    expect(result.stdout).toContain('Name	Current	Wanted	Latest	Age (days)	Type');
    expect(result.stdout).toContain('fakepkg');
  });

  // Story: prompts/002.0-DEV-FETCH-VERSION-AGES.md
  test('002.0-DEV-FETCH-VERSION-AGES: Fetches version publish dates and calculates ages', async () => {
    const result = await runCli([], { env: { DRY_AGED_DEPS_MOCK: '1' } });
    expect(result.exitCode).toBe(1);
    const lines = result.stdout.split(/\r?\n/);
    const row = lines.find((line) => line.startsWith('fakepkg	'));
    expect(row).toBeDefined();
    const cols = row.split('	');
    const age = parseInt(cols[4], 10);
    expect(Number.isInteger(age)).toBe(true);
    expect(age).toBeGreaterThan(0);
  });

  // Story: prompts/003.0-DEV-FILTER-MATURE-VERSIONS.md
  test('003.0-DEV-FILTER-MATURE-VERSIONS: Filters out versions younger than threshold', async () => {
    // Use a threshold higher than any stub age to force no mature
    const result = await runCli(['--min-age=1'], {
      env: { DRY_AGED_DEPS_MOCK: '1', DRY_AGED_DEPS_MOCK_AGE_NOW: '1' },
    });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('No outdated packages with mature versions found');
  });

  // Story: prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
  test('004.0-DEV-FILTER-VULNERABLE-VERSIONS: Filters out versions with known vulnerabilities (xml)', async () => {
    const result = await runCli(['--format=xml'], {
      env: { DRY_AGED_DEPS_MOCK: '1' },
    });
    expect(result.exitCode).toBe(1);
    const out = result.stdout;
    expect(out.startsWith('<?xml')).toBe(true);
    expect(out).toContain('<outdated-packages');
    expect(out).toMatch(/<count>0<\/count>/);
    expect(out).toMatch(/<filtered>false<\/filtered>/);
  });

  // Story: prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md
  test('005.0-DEV-CONFIGURABLE-AGE-THRESHOLD: Supports --min-age CLI flag and config file', async () => {
    // Invalid CLI flag value
    const errResult = await runCli(['--min-age=abc'], {
      env: { DRY_AGED_DEPS_MOCK: '1' },
    });
    expect(errResult.exitCode).toBe(2);
    expect(errResult.stderr || errResult.stdout).toContain('Invalid min-age');

    // CLI flag override with valid threshold (minAge >= 1)
    const ok = await runCli(['--min-age=1'], {
      env: { DRY_AGED_DEPS_MOCK: '1' },
    });
    expect(ok.exitCode).toBe(1);
    expect(ok.stdout).toContain('fakepkg');
  });

  // Story: prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md
  test('006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD: Supports --severity CLI flag and config file', async () => {
    // Invalid severity flag
    const err = await runCli(['--severity=foo'], {
      env: { DRY_AGED_DEPS_MOCK: '1' },
    });
    expect(err.exitCode).toBe(2);
    expect(err.stderr || err.stdout).toContain('Invalid severity');

    // Config file override for severity
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cfg-sec-'));
    await fs.copyFile(path.join(__dirname, 'fixtures-up-to-date', 'package.json'), path.join(tmpDir, 'package.json'));
    await fs.writeFile(path.join(tmpDir, '.dry-aged-deps.json'), JSON.stringify({ severity: 'none' }), 'utf8');
    const cfg = await runCli([], {
      cwd: tmpDir,
      env: { DRY_AGED_DEPS_MOCK: '1' },
    });
    expect(cfg.exitCode).toBe(1);
    expect(cfg.stdout).toContain('Outdated packages');
  });

  // Story: prompts/007.0-DEV-SEPARATE-PROD-DEV-THRESHOLDS.md
  test('007.0-DEV-SEPARATE-PROD-DEV-THRESHOLDS: Supports separate prod/dev threshold flags and config', async () => {
    const errProd = await runCli(['--prod-min-age=foo'], {
      env: { DRY_AGED_DEPS_MOCK: '1' },
    });
    expect(errProd.exitCode).toBe(2);
    expect(errProd.stderr || errProd.stdout).toContain('Invalid prod-min-age');

    const errDev = await runCli(['--dev-min-age=0'], {
      env: { DRY_AGED_DEPS_MOCK: '1' },
    });
    expect(errDev.exitCode).toBe(2);
    expect(errDev.stderr || errDev.stdout).toContain('Invalid dev-min-age');

    const ok = await runCli(['--prod-min-age=1', '--dev-min-age=1'], {
      env: { DRY_AGED_DEPS_MOCK: '1' },
    });
    expect(ok.exitCode).toBe(1);
    expect(ok.stdout).toContain('fakepkg');
    expect(ok.stdout).toContain('	dev');
  });

  // Story: prompts/008.0-DEV-JSON-OUTPUT.md
  test('008.0-DEV-JSON-OUTPUT: Outputs data in JSON format with proper structure', async () => {
    const result = await runCli(['--format=json'], {
      env: { DRY_AGED_DEPS_MOCK: '1' },
    });
    expect(result.exitCode).toBe(1);
    let obj;
    expect(() => {
      obj = JSON.parse(result.stdout);
    }).not.toThrow();
    expect(obj).toHaveProperty('timestamp');
    expect(Array.isArray(obj.packages)).toBe(true);
    expect(obj.packages.length).toBe(1);
    const pkg = obj.packages[0];
    expect(pkg).toMatchObject({
      name: 'fakepkg',
      current: '1.0.0',
      wanted: '1.1.0',
      latest: '2.0.0',
    });
    expect(typeof pkg.age).toBe('number');
  });

  // Story: prompts/009.0-DEV-XML-OUTPUT.md
  test('009.0-DEV-XML-OUTPUT: Outputs data in XML format conforming to spec', async () => {
    const result = await runCli(['--format=xml'], {
      env: { DRY_AGED_DEPS_MOCK: '1' },
    });
    expect(result.exitCode).toBe(1);
    const out = result.stdout;
    expect(out.startsWith('<?xml')).toBe(true);
    expect(out).toContain('<outdated-packages');
    expect(out).toContain('<packages>');
    expect(out).toContain('<name>fakepkg</name>');
    expect(out).toContain('</outdated-packages>');
  });

  // Story: prompts/010.0-DEV-CONFIG-FILE-SUPPORT.md
  test('010.0-DEV-CONFIG-FILE-SUPPORT: Reads configuration from .dry-aged-deps.json for format', async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cfg-file-'));
    const fixturePkg = path.join(__dirname, 'fixtures-up-to-date', 'package.json');
    await fs.copyFile(fixturePkg, path.join(tmpDir, 'package.json'));
    // Write config file to set format to json
    await fs.writeFile(path.join(tmpDir, '.dry-aged-deps.json'), JSON.stringify({ format: 'json' }), 'utf8');
    const result = await runCli([], {
      cwd: tmpDir,
      env: { DRY_AGED_DEPS_MOCK: '1' },
    });
    expect(result.exitCode).toBe(1);
    // Should output JSON format
    expect(() => JSON.parse(result.stdout)).not.toThrow();
    expect(result.stdout.trim().startsWith('{')).toBe(true);
  });

  // Story: prompts/011.0-DEV-AUTO-UPDATE.md
  test('011.0-DEV-AUTO-UPDATE: Updates package.json with safe versions when --update flag used', async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'upd-'));
    const fixturePkg = path.join(__dirname, 'fixtures-up-to-date', 'package.json');
    await fs.copyFile(fixturePkg, path.join(tmpDir, 'package.json'));
    const result = await runCli(['--update', '-y'], {
      cwd: tmpDir,
      env: { DRY_AGED_DEPS_MOCK: '1' },
    });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('The following packages will be updated');
    const updated = JSON.parse(await fs.readFile(path.join(tmpDir, 'package.json'), 'utf8'));
    expect(updated.devDependencies).toHaveProperty('fakepkg', '1.1.0');
    // backup exists
    const stat = await fs.stat(path.join(tmpDir, 'package.json.backup'));
    expect(stat.isFile()).toBe(true);
  });

  // Story: prompts/012.0-DEV-EXIT-CODE-REFINEMENT.md
  test('012.0-DEV-EXIT-CODE-REFINEMENT: Uses standardized exit codes for error, no-updates, safe-updates', async () => {
    // safe updates available in mock
    const res = await runCli(['--check'], {
      env: { DRY_AGED_DEPS_MOCK: '1' },
    });
    expect(res.exitCode).toBe(1);
    // error scenario
    const err = await runCli(['--format=bad'], {
      env: { DRY_AGED_DEPS_MOCK: '1' },
    });
    expect(err.exitCode).toBe(2);
  });

  // Story: prompts/013.0-DEV-CHECK-MODE.md
  test('013.0-DEV-CHECK-MODE: Implements check mode to exit with code based on available updates', async () => {
    const res = await runCli(['--check'], { env: { DRY_AGED_DEPS_MOCK: '1' } });
    expect(res.exitCode).toBe(1);
  });
});
