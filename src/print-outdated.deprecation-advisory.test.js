/**
 * Advisory-only invariant for deprecation surfacing (ADR-0023 Confirmation #2):
 * a deprecated dependency must be surfaced but NEVER acted on — `--update`
 * produces exactly the same result whether or not the package is deprecated.
 * @supports prompts/020.0-DEV-SURFACE-DEPRECATED-DEPENDENCIES.md REQ-DEPRECATION-ADVISORY-ONLY
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { printOutdated } from './print-outdated.js';
import { DEPRECATED } from './fetch-version-times.js';

describe('Story 020.0-DEV-SURFACE-DEPRECATED-DEPENDENCIES: deprecation is advisory-only in the --update apply path', () => {
  let tmpDir;
  let originalCwd;
  let consoleLogSpy;

  beforeEach(async () => {
    originalCwd = process.cwd();
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'print-outdated-deprecation-test-'));
    process.chdir(tmpDir);
    const pkg = { name: 'test-project', version: '1.0.0', dependencies: { foo: '1.0.0' } };
    await fs.writeFile('package.json', JSON.stringify(pkg, null, 2), 'utf8');
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    consoleLogSpy.mockRestore();
    process.chdir(originalCwd);
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('[REQ-DEPRECATION-ADVISORY-ONLY] applies a deprecated package’s safe update exactly as a non-deprecated one — deprecation never blocks or alters --update', async () => {
    const data = { foo: { current: '1.0.0', wanted: '1.1.0', latest: '1.1.0' } };
    const tenDays = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    // foo's latest version is deprecated (rides the DEPRECATED symbol).
    const fetchVersionTimes = async () => {
      const times = { '1.1.0': tenDays };
      times[DEPRECATED] = 'This package is deprecated. Please use bar instead: https://example.com/bar';
      return times;
    };

    const summary = await printOutdated(data, {
      updateMode: true,
      skipConfirmation: true,
      fetchVersionTimes,
      calculateAgeInDays: () => 10,
      checkVulnerabilities: async () => 0,
    });

    // The deprecated package's safe update is applied — deprecation is advisory,
    // it does not remove foo from the safe set or change the applied version.
    expect(summary.safeUpdates).toBe(1);
    const updatedPkg = JSON.parse(await fs.readFile('package.json', 'utf8'));
    expect(updatedPkg.dependencies.foo).toBe('1.1.0');
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Updated package.json with 1 safe packages'));
  });
});
