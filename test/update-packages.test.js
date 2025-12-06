/****
 * Tests for updatePackages function
 * @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-UPDATE-FLAG REQ-YES-FLAG REQ-BACKUP REQ-PACKAGE-JSON
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';
import os from 'os';
import { promises as fsp } from 'fs';
import fs from 'fs';
import { updatePackages } from '../src/update-packages.js';

describe('Story 011.0-DEV-AUTO-UPDATE: updatePackages direct tests', () => {
  let tmpDir;
  let originalCwd;
  let consoleLogSpy;
  let consoleErrorSpy;
  const summary = { totalOutdated: 1, safeUpdates: 1, filteredByAge: 0, filteredBySecurity: 0 };

  beforeEach(async () => {
    originalCwd = process.cwd();
    tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'upd-pkgs-test-'));
    process.chdir(tmpDir);
    // Create initial package.json
    const pkg = { name: 'test', version: '1.0.0', dependencies: { foo: '1.0.0' } };
    await fsp.writeFile('package.json', JSON.stringify(pkg, null, 2), 'utf8');
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    process.chdir(originalCwd);
    await fsp.rm(tmpDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('[REQ-SAFE-ONLY] logs no safe updates and returns summary when safeRows is empty', async () => {
    const result = await updatePackages([], true, summary);
    expect(consoleLogSpy).toHaveBeenCalledWith('No safe updates available.');
    expect(result).toBe(summary);
  });

  it('[REQ-YES-FLAG] [REQ-BACKUP] [REQ-PACKAGE-JSON] skips confirmation when skipConfirmation=true, creates backup, applies updates, and logs messages', async () => {
    const safeRows = [['foo', '1.0.0', '1.2.0', '1.2.0', 5, 'prod']];
    const result = await updatePackages(safeRows, true, summary);

    // Confirm log of packages to be updated
    expect(consoleLogSpy).toHaveBeenCalledWith('The following packages will be updated:');
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('  foo: 1.0.0 → 1.2.0'));

    // Backup file created
    const backupContent = await fsp.readFile('package.json.backup', 'utf8');
    const originalPkg = JSON.parse(backupContent);
    expect(originalPkg.dependencies.foo).toBe('1.0.0');

    // Package.json updated
    const updatedContent = await fsp.readFile('package.json', 'utf8');
    const updatedPkg = JSON.parse(updatedContent);
    expect(updatedPkg.dependencies.foo).toBe('1.2.0');

    // Log backup and update actions
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Created backup of package.json at'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Updated package.json with 1 safe packages'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("Run 'npm install' to install the updates"));

    expect(result).toBe(summary);
  });
});
