/**
 * @story ??? - TODO: specify story file
 * @req UNKNOWN - TODO: specify requirement ID and description
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';
import os from 'os';
import { promises as fsp } from 'fs';
import fs from 'fs';

describe('updatePackages abort, confirm, and backup-error flows', () => {
  let tmpDir;
  let originalCwd;
  let safeRows;
  const summary = { totalOutdated: 1, safeUpdates: 1, filteredByAge: 0, filteredBySecurity: 0 };
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(async () => {
    originalCwd = process.cwd();
    tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'upd-abort-test-'));
    process.chdir(tmpDir);
    // Write initial package.json
    const pkg = { name: 'test', version: '1.0.0', dependencies: { foo: '1.0.0' } };
    await fsp.writeFile('package.json', JSON.stringify(pkg, null, 2), 'utf8');
    safeRows = [['foo', '1.0.0', '1.2.0', '1.2.0', 5, 'prod']];
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    process.chdir(originalCwd);
    vi.restoreAllMocks();
    await fsp.rm(tmpDir, { recursive: true, force: true });
  });

  it('aborts update when user answers no', async () => {
    vi.resetModules();
    vi.doMock('readline', () => ({
      createInterface: () => ({
        question: (_prompt, cb) => cb('n'),
        close: () => {},
      }),
    }));
    const { updatePackages } = await import('../src/update-packages.js');
    const result = await updatePackages(safeRows, false, summary);
    expect(consoleLogSpy).toHaveBeenCalledWith('The following packages will be updated:');
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('foo: 1.0.0 → 1.2.0'));
    expect(consoleLogSpy).toHaveBeenCalledWith('Aborted.');
    await expect(fsp.access('package.json.backup')).rejects.toThrow();
    const content = await fsp.readFile('package.json', 'utf8');
    const pkgData = JSON.parse(content);
    expect(pkgData.dependencies.foo).toBe('1.0.0');
    expect(result).toBe(summary);
  });

  it('proceeds update when user answers yes', async () => {
    vi.resetModules();
    vi.doMock('readline', () => ({
      createInterface: () => ({
        question: (_prompt, cb) => cb('y'),
        close: () => {},
      }),
    }));
    const { updatePackages } = await import('../src/update-packages.js');
    const result = await updatePackages(safeRows, false, summary);
    const backup = JSON.parse(await fsp.readFile('package.json.backup', 'utf8'));
    expect(backup.dependencies.foo).toBe('1.0.0');
    const updated = JSON.parse(await fsp.readFile('package.json', 'utf8'));
    expect(updated.dependencies.foo).toBe('1.2.0');
    expect(result).toBe(summary);
  });

  it('handles backup failure and logs error', async () => {
    vi.resetModules();
    vi.spyOn(fs, 'copyFileSync').mockImplementation(() => {
      throw new Error('backup fail');
    });
    const { updatePackages } = await import('../src/update-packages.js');
    // Skip confirmation prompt
    const result = await updatePackages(safeRows, true, summary);
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to create backup: backup fail'));
    await expect(fsp.access('package.json.backup')).rejects.toThrow();
    const original = JSON.parse(await fsp.readFile('package.json', 'utf8'));
    expect(original.dependencies.foo).toBe('1.0.0');
    expect(result).toBe(summary);
  });
});
