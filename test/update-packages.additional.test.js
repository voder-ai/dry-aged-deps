/**
 * @story prompts/dry-aged-deps-user-story-map.md
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';
import os from 'os';
import { promises as fsp } from 'fs';
import fs from 'fs';

describe('updatePackages additional branches', () => {
  let tmpDir;
  let originalCwd;
  let consoleLogSpy;
  let consoleErrorSpy;
  const summary = { totalOutdated: 1, safeUpdates: 1, filteredByAge: 0, filteredBySecurity: 0 };

  beforeEach(async () => {
    originalCwd = process.cwd();
    tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'upd-pkgs-test-'));
    process.chdir(tmpDir);
    const pkg = { name: 'test', version: '1.0.0', dependencies: { foo: '1.0.0' } };
    await fsp.writeFile('package.json', JSON.stringify(pkg, null, 2), 'utf8');
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

    const safeRows = [['foo', '1.0.0', '1.2.0', '1.2.0', 5, 'prod']];
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
        question: (_prompt, cb) => cb('yes'),
        close: () => {},
      }),
    }));
    const { updatePackages } = await import('../src/update-packages.js');

    const safeRows = [['foo', '1.0.0', '1.2.0', '1.2.0', 5, 'prod']];
    const result = await updatePackages(safeRows, false, summary);

    const backup = JSON.parse(await fsp.readFile('package.json.backup', 'utf8'));
    expect(backup.dependencies.foo).toBe('1.0.0');
    const updated = JSON.parse(await fsp.readFile('package.json', 'utf8'));
    expect(updated.dependencies.foo).toBe('1.2.0');
    expect(result).toBe(summary);
  });

  it('handles backup failure and logs error', async () => {
    vi.resetModules();
    const { updatePackages } = await import('../src/update-packages.js');
    vi.spyOn(fs, 'copyFileSync').mockImplementation(() => {
      throw new Error('copy failed');
    });

    const safeRows = [['foo', '1.0.0', '1.2.0', '1.2.0', 5, 'prod']];
    const result = await updatePackages(safeRows, true, summary);

    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to create backup: copy failed'));
    await expect(fsp.access('package.json.backup')).rejects.toThrow();
    const content = await fsp.readFile('package.json', 'utf8');
    const pkgData = JSON.parse(content);
    expect(pkgData.dependencies.foo).toBe('1.0.0');
    expect(result).toBe(summary);
  });

  it('handles update failure and logs error', async () => {
    vi.resetModules();
    const { updatePackages } = await import('../src/update-packages.js');
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
      throw new Error('write failed');
    });

    const safeRows = [['foo', '1.0.0', '1.2.0', '1.2.0', 5, 'prod']];
    const result = await updatePackages(safeRows, true, summary);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to update package.json: write failed')
    );
    const backup = JSON.parse(await fsp.readFile('package.json.backup', 'utf8'));
    expect(backup.dependencies.foo).toBe('1.0.0');
    const original = JSON.parse(await fsp.readFile('package.json', 'utf8'));
    expect(original.dependencies.foo).toBe('1.0.0');
    expect(result).toBe(summary);
  });

  it('updates devDependencies when depType is dev and skipConfirmation=true', async () => {
    vi.resetModules();
    const pkgDev = { name: 'test', version: '1.0.0', devDependencies: { bar: '1.0.0' } };
    await fsp.writeFile('package.json', JSON.stringify(pkgDev, null, 2), 'utf8');
    const { updatePackages } = await import('../src/update-packages.js');

    const safeRows = [['bar', '1.0.0', '2.0.0', '2.0.0', 5, 'dev']];
    const result = await updatePackages(safeRows, true, summary);

    const backup = JSON.parse(await fsp.readFile('package.json.backup', 'utf8'));
    expect(backup.devDependencies.bar).toBe('1.0.0');
    const updated = JSON.parse(await fsp.readFile('package.json', 'utf8'));
    expect(updated.devDependencies.bar).toBe('2.0.0');
    expect(result).toBe(summary);
  });

  /**
   * @story Handle missing devDependencies in package.json
   * @req Create devDependencies field when absent and apply update
   */
  it('handles missing devDependencies and skipConfirmation=true', async () => {
    vi.resetModules();
    const pkgNoDev = { name: 'test', version: '1.0.0' };
    await fsp.writeFile('package.json', JSON.stringify(pkgNoDev, null, 2), 'utf8');
    const { updatePackages } = await import('../src/update-packages.js');

    const safeRows = [['bar', '1.0.0', '2.0.0', '2.0.0', 5, 'dev']];
    const result = await updatePackages(safeRows, true, summary);

    const backup = JSON.parse(await fsp.readFile('package.json.backup', 'utf8'));
    expect(backup.devDependencies).toBeUndefined();
    const updated = JSON.parse(await fsp.readFile('package.json', 'utf8'));
    expect(updated.devDependencies.bar).toBe('2.0.0');
    expect(result).toBe(summary);
  });

  /**
   * @story Handle missing dependencies in package.json
   * @req Create dependencies field when absent and apply update
   */
  it('handles missing dependencies and skipConfirmation=true', async () => {
    vi.resetModules();
    const pkgNoDeps = { name: 'test', version: '1.0.0' };
    await fsp.writeFile('package.json', JSON.stringify(pkgNoDeps, null, 2), 'utf8');
    const { updatePackages } = await import('../src/update-packages.js');

    const safeRows = [['foo', '1.0.0', '1.2.0', '1.2.0', 5, 'prod']];
    const result = await updatePackages(safeRows, true, summary);

    const backup = JSON.parse(await fsp.readFile('package.json.backup', 'utf8'));
    expect(backup.dependencies).toBeUndefined();
    const updated = JSON.parse(await fsp.readFile('package.json', 'utf8'));
    expect(updated.dependencies.foo).toBe('1.2.0');
    expect(result).toBe(summary);
  });
});
