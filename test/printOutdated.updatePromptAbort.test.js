/**
 * Tests for auto-update prompt abort
 * @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-CONFIRMATION
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/** @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-CONFIRMATION */
vi.mock('readline', () => ({
  createInterface: () => ({
    question: (_question, cb) => cb('n'),
    close: () => {},
  }),
}));

import path from 'path';
import os from 'os';
import { promises as fsp } from 'fs';
import { printOutdated } from '../src/print-outdated.js';

describe('Story 011.0-DEV-AUTO-UPDATE: printOutdated auto-update prompt abort', () => {
  let tmpDir;
  let originalCwd;
  let consoleLogSpy;

  beforeEach(async () => {
    originalCwd = process.cwd();
    tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'print-outdated-test-'));
    process.chdir(tmpDir);
    // create initial package.json
    const pkg = {
      name: 'test-prompt-abort',
      version: '1.0.0',
      dependencies: { foo: '1.0.0' },
    };
    await fsp.writeFile('package.json', JSON.stringify(pkg, null, 2), 'utf8');
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    consoleLogSpy.mockRestore();
    process.chdir(originalCwd);
    await fsp.rm(tmpDir, { recursive: true, force: true });
  });

  it('[REQ-CONFIRMATION] aborts when user answers no and does not apply updates', async () => {
    const data = {
      foo: { current: '1.0.0', wanted: '1.2.0', latest: '1.2.0' },
    };
    const tenDays = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    const fetchVersionTimes = async () => ({ '1.2.0': tenDays });
    const calculateAgeInDays = () => 10;
    const checkVulnerabilities = async () => 0;

    const summary = await printOutdated(data, {
      updateMode: true,
      skipConfirmation: false,
      fetchVersionTimes,
      calculateAgeInDays,
      checkVulnerabilities,
    });

    expect(summary.safeUpdates).toBe(1);
    // Should log aborted message
    expect(consoleLogSpy).toHaveBeenCalledWith('Aborted.');
    // No backup file exists
    const files = await fsp.readdir('.');
    expect(files).toEqual(['package.json']);
    // package.json remains unchanged
    const content = await fsp.readFile('package.json', 'utf8');
    const pkgPost = JSON.parse(content);
    expect(pkgPost.dependencies.foo).toBe('1.0.0');
  });
});
