/**
 */

/**
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { printOutdated } from '../src/print-outdated.js';

describe('printOutdated auto-update mode', () => {
  let tmpDir;
  let originalCwd;
  let consoleLogSpy;

  beforeEach(async () => {
    originalCwd = process.cwd();
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'print-outdated-test-'));
    process.chdir(tmpDir);
    // create initial package.json
    const pkg = {
      name: 'test-project',
      version: '1.0.0',
      dependencies: { foo: '1.0.0' },
      devDependencies: { bar: '2.0.0' },
    };
    await fs.writeFile('package.json', JSON.stringify(pkg, null, 2), 'utf8');
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    consoleLogSpy.mockRestore();
    process.chdir(originalCwd);
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('applies safe updates and writes package.json, creates backup, and outputs summary', async () => {
    // Arrange
    const data = {
      foo: { current: '1.0.0', wanted: '1.1.0', latest: '1.1.0' },
      bar: { current: '2.0.0', wanted: '2.1.0', latest: '2.1.0' },
    };
    // stub helpers to mark both as safe and aged
    const tenDays = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    const fetchVersionTimes = async () => ({
      '1.1.0': tenDays,
      '2.1.0': tenDays,
    });
    const calculateAgeInDays = () => 10;
    const checkVulnerabilities = async () => 0;

    // Act
    const summary = await printOutdated(data, {
      updateMode: true,
      skipConfirmation: true,
      fetchVersionTimes,
      calculateAgeInDays,
      checkVulnerabilities,
    });

    // Assert summary numbers
    expect(summary.safeUpdates).toBe(2);

    // backup exists
    const backupContent = await fs.readFile('package.json.backup', 'utf8');
    const originalPkg = JSON.parse(backupContent);
    expect(originalPkg.dependencies.foo).toBe('1.0.0');

    // updated package.json
    const updatedContent = await fs.readFile('package.json', 'utf8');
    const updatedPkg = JSON.parse(updatedContent);
    expect(updatedPkg.dependencies.foo).toBe('1.1.0');
    expect(updatedPkg.devDependencies.bar).toBe('2.1.0');

    // console logs summary messages containing updated count
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Updated package.json with 2 safe packages'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("Run 'npm install'"));
  });

  it('logs no safe updates when none pass filters', async () => {
    // Arrange with checkVulnerabilities returns non-zero, so safeRows empty
    const data = {
      foo: { current: '1.0.0', wanted: '1.1.0', latest: '1.1.0' },
    };
    const tenDays = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    const fetchVersionTimes = async () => ({ '1.1.0': tenDays });
    const calculateAgeInDays = () => 10;
    const checkVulnerabilities = async () => 5; // treat as vulnerable

    // Act
    const summary = await printOutdated(data, {
      updateMode: true,
      skipConfirmation: true,
      fetchVersionTimes,
      calculateAgeInDays,
      checkVulnerabilities,
    });

    // Assert
    expect(summary.safeUpdates).toBe(0);
    expect(consoleLogSpy).toHaveBeenCalledWith('No safe updates available.');
    // no backup file
    const backupExists = await fs
      .access('package.json.backup')
      .then(() => true)
      .catch(() => false);
    expect(backupExists).toBe(false);
  });
});
