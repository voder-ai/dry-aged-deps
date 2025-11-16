/**
 * @story ??? - TODO: specify story file
 * @req UNKNOWN - TODO: specify requirement ID and description
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import { printOutdated } from '../src/print-outdated.js';
import { vi, describe, test, beforeAll, afterAll, expect } from 'vitest';

const pkgName = 'prodfoo';
const data = {
  [pkgName]: { current: '1.0.0', wanted: '1.2.0', latest: '1.2.0' },
};
const fetchStub = vi.fn().mockResolvedValue({ '1.2.0': '2020-01-01T00:00:00.000Z' });
const ageStub = vi.fn().mockReturnValue(10);
const vulnStub = vi.fn().mockResolvedValue(0);
let tempDir;
let originalCwd;

describe('printOutdated unit tests - prod dependency type in table output', () => {
  beforeAll(() => {
    originalCwd = process.cwd();
    // Create a temporary directory and write package.json with prod dependency
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-prod-'));
    fs.writeFileSync(
      path.join(tempDir, 'package.json'),
      JSON.stringify({ dependencies: { [pkgName]: '^1.0.0' }, devDependencies: {} }, null, 2)
    );
    process.chdir(tempDir);
  });

  afterAll(() => {
    process.chdir(originalCwd);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('prints prod type for dependencies listed in package.json', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await printOutdated(data, {
      format: 'table',
      fetchVersionTimes: fetchStub,
      calculateAgeInDays: ageStub,
      checkVulnerabilities: vulnStub,
      prodMinAge: 7,
      devMinAge: 7,
    });

    expect(errorSpy).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith('Outdated packages:');
    expect(logSpy).toHaveBeenCalledWith(['Name', 'Current', 'Wanted', 'Latest', 'Age (days)', 'Type'].join('	'));
    // The last row should show 'prod' as the type
    expect(logSpy).toHaveBeenCalledWith(`${pkgName}	1.0.0	1.2.0	1.2.0	10	prod`);

    logSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
