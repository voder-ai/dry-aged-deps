/** @story prompts/dry-aged-deps-user-story-map.md */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { promises as fsp } from 'fs';
import { printOutdated } from '../src/print-outdated.js';

describe('printOutdated auto-update backup error handling', () => {
  let tmpDir;
  let originalCwd;
  let consoleErrorSpy;

  beforeEach(async () => {
    originalCwd = process.cwd();
    tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'print-outdated-test-'));
    process.chdir(tmpDir);
    // create initial package.json
    const pkg = {
      name: 'test-backup-error',
      version: '1.0.0',
      dependencies: { foo: '1.0.0' },
    };
    await fsp.writeFile('package.json', JSON.stringify(pkg, null, 2), 'utf8');
    // simulate existing backup directory to cause backup error
    await fsp.mkdir('package.json.backup');

    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    process.chdir(originalCwd);
    await fsp.rm(tmpDir, { recursive: true, force: true });
  });

  it('logs error when backup creation fails and does not create backup or modify package.json', async () => {
    const data = {
      foo: { current: '1.0.0', wanted: '1.1.0', latest: '1.1.0' },
    };
    const tenDays = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    const fetchVersionTimes = async () => ({ '1.1.0': tenDays });
    const calculateAgeInDays = () => 10;
    const checkVulnerabilities = async () => 0;

    const summary = await printOutdated(data, {
      updateMode: true,
      skipConfirmation: true,
      fetchVersionTimes,
      calculateAgeInDays,
      checkVulnerabilities,
    });

    expect(summary.safeUpdates).toBe(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to create backup:'));

    const files = await fsp.readdir('.');
    expect(files).toEqual(['package.json', 'package.json.backup']);

    const content = await fsp.readFile('package.json', 'utf8');
    const pkgPost = JSON.parse(content);
    expect(pkgPost.dependencies.foo).toBe('1.0.0');
  });
});
