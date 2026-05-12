/**
 * Reproduction test for P001: `dry-aged-deps --update` skips exact-pinned dependencies.
 *
 * Asserts the disambiguation recorded in ADR-0014: `applyUpdates()` writes the 4th
 * tuple element (`latest`, the post-filter / post-smart-search safe target) into
 * `package.json`, NOT the 3rd element (`wanted`). For exact-pinned packages
 * `wanted === current`, so writing `wanted` is a silent no-op; writing `latest` is the
 * actual safe bump the filters have already validated.
 *
 * Co-located beside src/update-packages.js per the wr-tdd hook's test-association
 * convention (impl ↔ STEM.test.<ext> in the same directory). The broader test suite
 * lives in test/.
 *
 * @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-SAFE-ONLY REQ-PACKAGE-JSON
 * @see docs/decisions/0014-update-target-is-latest-safe-not-wanted.proposed.md
 * @see docs/problems/001-update-skips-exact-pinned-deps.known-error.md
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';
import os from 'os';
import { promises as fsp } from 'fs';
import { updatePackages } from './update-packages.js';
import { printOutdated } from './print-outdated.js';

describe('Story 011.0-DEV-AUTO-UPDATE: P001 exact-pinned dependencies (ADR-0014)', () => {
  let tmpDir;
  let originalCwd;
  let consoleLogSpy;
  let consoleErrorSpy;
  const summary = { totalOutdated: 1, safeUpdates: 1, filteredByAge: 0, filteredBySecurity: 0 };

  beforeEach(async () => {
    originalCwd = process.cwd();
    tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'p001-exact-pin-test-'));
    process.chdir(tmpDir);
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

  it('[REQ-SAFE-ONLY] writes latest (element[3]) to package.json for exact-pinned dev dep', async () => {
    /** @story prompts/011.0-DEV-AUTO-UPDATE.md ADR-0014 */
    const pkg = { name: 'test', version: '1.0.0', devDependencies: { typescript: '5.9.3' } };
    await fsp.writeFile('package.json', JSON.stringify(pkg, null, 2), 'utf8');
    /** @type {Array<[string, string, string, string, number|string, string]>} */
    const safeRows = [['typescript', '5.9.3', '5.9.3', '5.10.0', 14, 'dev']];

    const result = await updatePackages(safeRows, true, summary);

    const updatedPkg = JSON.parse(await fsp.readFile('package.json', 'utf8'));
    expect(updatedPkg.devDependencies.typescript).toBe('5.10.0');
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('typescript: 5.9.3 → 5.10.0'));
    expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('5.9.3 → 5.9.3'));
    expect(result).toBe(summary);
  });

  it('[REQ-SAFE-ONLY] writes latest (element[3]) for exact-pinned prod dep crossing a major boundary', async () => {
    /** @story prompts/011.0-DEV-AUTO-UPDATE.md ADR-0014 */
    const pkg = { name: 'test', version: '1.0.0', dependencies: { foo: '1.2.3' } };
    await fsp.writeFile('package.json', JSON.stringify(pkg, null, 2), 'utf8');
    /** @type {Array<[string, string, string, string, number|string, string]>} */
    const safeRows = [['foo', '1.2.3', '1.2.3', '2.0.0', 30, 'prod']];

    const result = await updatePackages(safeRows, true, summary);

    const updatedPkg = JSON.parse(await fsp.readFile('package.json', 'utf8'));
    expect(updatedPkg.dependencies.foo).toBe('2.0.0');
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('foo: 1.2.3 → 2.0.0'));
    expect(result).toBe(summary);
  });

  it('[REQ-SAFE-ONLY] smart-search safe target (element[3] may be < npm-latest) is what gets written', async () => {
    /** @story prompts/011.0-DEV-AUTO-UPDATE.md ADR-0014 */
    // When smart-search runs (filter-by-security.js trySmartSearchFallback), it replaces
    // the 4th tuple element with the highest mature, vulnerability-free version it could
    // find — which may be LOWER than the npm-`latest` if `latest` carried a CVE.
    const pkg = { name: 'test', version: '1.0.0', dependencies: { bar: '1.0.0' } };
    await fsp.writeFile('package.json', JSON.stringify(pkg, null, 2), 'utf8');
    /** @type {Array<[string, string, string, string, number|string, string]>} */
    const safeRows = [['bar', '1.0.0', '1.0.0', '1.9.5', 21, 'prod']];

    const result = await updatePackages(safeRows, true, summary);

    const updatedPkg = JSON.parse(await fsp.readFile('package.json', 'utf8'));
    expect(updatedPkg.dependencies.bar).toBe('1.9.5');
    expect(result).toBe(summary);
  });

  it('[REQ-SAFE-ONLY] end-to-end via printOutdated: exact-pinned dep gets bumped to latest', async () => {
    /** @story prompts/011.0-DEV-AUTO-UPDATE.md ADR-0014 */
    const pkg = {
      name: 'test',
      version: '1.0.0',
      devDependencies: { globals: '17.4.0' },
    };
    await fsp.writeFile('package.json', JSON.stringify(pkg, null, 2), 'utf8');
    const data = {
      globals: { current: '17.4.0', wanted: '17.4.0', latest: '17.6.0' },
    };
    const tenDays = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    /** @story prompts/011.0-DEV-AUTO-UPDATE.md ADR-0014 */
    const fetchVersionTimes = async () => ({ '17.6.0': tenDays });
    /** @story prompts/011.0-DEV-AUTO-UPDATE.md ADR-0014 */
    const calculateAgeInDays = () => 10;
    /** @story prompts/011.0-DEV-AUTO-UPDATE.md ADR-0014 */
    const checkVulnerabilities = async () => 0;

    const result = await printOutdated(data, {
      updateMode: true,
      skipConfirmation: true,
      fetchVersionTimes,
      calculateAgeInDays,
      checkVulnerabilities,
    });

    const updatedPkg = JSON.parse(await fsp.readFile('package.json', 'utf8'));
    expect(updatedPkg.devDependencies.globals).toBe('17.6.0');
    expect(result.safeUpdates).toBe(1);
  });
});
