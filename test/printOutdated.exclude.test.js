/**
 * Tests for package exclusion filtering behavior.
 * @supports prompts/015.0-DEV-EXCLUDE-PACKAGES.md REQ-EXCLUDE-FILTER REQ-EXCLUDE-OUTPUT
 */

import { printOutdated } from '../src/print-outdated.js';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';

describe('Story 015.0-DEV-EXCLUDE-PACKAGES: package exclusion filtering', () => {
  let logSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** @supports prompts/015.0-DEV-EXCLUDE-PACKAGES.md REQ-EXCLUDE-FILTER */
  const fetchStub = vi.fn().mockImplementation((pkg) => {
    const versions = {
      eslint: { '10.0.0': '2020-01-01T00:00:00.000Z' },
      prettier: { '3.1.0': '2020-01-01T00:00:00.000Z' },
      typescript: { '5.1.0': '2020-01-01T00:00:00.000Z' },
      '@eslint/js': { '10.0.0': '2020-01-01T00:00:00.000Z' },
    };
    return Promise.resolve(versions[pkg] || {});
  });
  const ageStub = vi.fn().mockReturnValue(10);
  const vulnStub = vi.fn().mockResolvedValue(0);

  const baseOptions = {
    prodMinAge: 7,
    devMinAge: 7,
    prodMinSeverity: 'none',
    devMinSeverity: 'none',
    fetchVersionTimes: fetchStub,
    calculateAgeInDays: ageStub,
    checkVulnerabilities: vulnStub,
  };

  // @supports prompts/015.0-DEV-EXCLUDE-PACKAGES.md REQ-EXCLUDE-FILTER
  test('[REQ-EXCLUDE-FILTER] excluded packages are removed from table output', async () => {
    const data = {
      eslint: { current: '9.0.0', wanted: '9.0.0', latest: '10.0.0' },
      prettier: { current: '3.0.0', wanted: '3.1.0', latest: '3.1.0' },
    };

    await printOutdated(data, {
      ...baseOptions,
      exclude: { eslint: 'Blocked by plugin incompatibility' },
    });

    // eslint should not appear in output, prettier should
    const allOutput = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(allOutput).not.toContain('eslint');
    expect(allOutput).toContain('prettier');
  });

  // @supports prompts/015.0-DEV-EXCLUDE-PACKAGES.md REQ-EXCLUDE-FILTER
  test('[REQ-EXCLUDE-FILTER] excluded packages do not affect exit code summary', async () => {
    const data = {
      eslint: { current: '9.0.0', wanted: '9.0.0', latest: '10.0.0' },
    };

    const summary = await printOutdated(data, {
      ...baseOptions,
      returnSummary: true,
      exclude: { eslint: 'Blocked by plugin incompatibility' },
    });

    // With the only package excluded, there should be 0 safe updates
    expect(summary.safeUpdates).toBe(0);
    expect(summary.totalOutdated).toBe(0);
  });

  // @supports prompts/015.0-DEV-EXCLUDE-PACKAGES.md REQ-EXCLUDE-FILTER
  test('[REQ-EXCLUDE-FILTER] non-excluded packages still appear normally', async () => {
    const data = {
      eslint: { current: '9.0.0', wanted: '9.0.0', latest: '10.0.0' },
      prettier: { current: '3.0.0', wanted: '3.1.0', latest: '3.1.0' },
      typescript: { current: '5.0.0', wanted: '5.1.0', latest: '5.1.0' },
    };

    const summary = await printOutdated(data, {
      ...baseOptions,
      returnSummary: true,
      exclude: { eslint: 'Blocked' },
    });

    // 2 non-excluded packages should be counted
    expect(summary.totalOutdated).toBe(2);
    expect(summary.safeUpdates).toBe(2);
  });

  // @supports prompts/015.0-DEV-EXCLUDE-PACKAGES.md REQ-EXCLUDE-FILTER
  test('[REQ-EXCLUDE-FILTER] empty exclude object has no effect', async () => {
    const data = {
      prettier: { current: '3.0.0', wanted: '3.1.0', latest: '3.1.0' },
    };

    const summary = await printOutdated(data, {
      ...baseOptions,
      returnSummary: true,
      exclude: {},
    });

    expect(summary.totalOutdated).toBe(1);
    expect(summary.safeUpdates).toBe(1);
  });

  // @supports prompts/015.0-DEV-EXCLUDE-PACKAGES.md REQ-EXCLUDE-OUTPUT
  test('[REQ-EXCLUDE-OUTPUT] JSON output includes excluded section with reasons', async () => {
    const data = {
      eslint: { current: '9.0.0', wanted: '9.0.0', latest: '10.0.0' },
      prettier: { current: '3.0.0', wanted: '3.1.0', latest: '3.1.0' },
    };

    await printOutdated(data, {
      ...baseOptions,
      format: 'json',
      exclude: { eslint: 'Blocked by plugin incompatibility' },
    });

    const output = logSpy.mock.calls[0][0];
    const obj = JSON.parse(output);

    // excluded section should be present
    expect(obj.excluded).toEqual([{ name: 'eslint', reason: 'Blocked by plugin incompatibility' }]);
    // eslint should not be in packages
    expect(obj.packages.map((p) => p.name)).not.toContain('eslint');
    expect(obj.packages.map((p) => p.name)).toContain('prettier');
  });

  // @supports prompts/015.0-DEV-EXCLUDE-PACKAGES.md REQ-EXCLUDE-OUTPUT
  test('[REQ-EXCLUDE-OUTPUT] XML output includes excluded section', async () => {
    const data = {
      eslint: { current: '9.0.0', wanted: '9.0.0', latest: '10.0.0' },
      prettier: { current: '3.0.0', wanted: '3.1.0', latest: '3.1.0' },
    };

    await printOutdated(data, {
      ...baseOptions,
      format: 'xml',
      exclude: { eslint: 'Blocked by plugin incompatibility' },
    });

    const output = logSpy.mock.calls[0][0];
    expect(output).toContain('<excluded>');
    expect(output).toContain('<name>eslint</name>');
    expect(output).toContain('<reason>Blocked by plugin incompatibility</reason>');
    expect(output).toContain('</excluded>');
  });

  // @supports prompts/015.0-DEV-EXCLUDE-PACKAGES.md REQ-EXCLUDE-OUTPUT
  test('[REQ-EXCLUDE-OUTPUT] table output shows exclusion note', async () => {
    const data = {
      eslint: { current: '9.0.0', wanted: '9.0.0', latest: '10.0.0' },
      prettier: { current: '3.0.0', wanted: '3.1.0', latest: '3.1.0' },
    };

    await printOutdated(data, {
      ...baseOptions,
      exclude: { eslint: 'Blocked', '@eslint/js': 'Also blocked' },
    });

    const allOutput = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(allOutput).toContain('2 package(s) excluded from analysis (see .dry-aged-deps.json)');
  });

  // @supports prompts/015.0-DEV-EXCLUDE-PACKAGES.md REQ-EXCLUDE-OUTPUT
  test('[REQ-EXCLUDE-OUTPUT] no exclusion note when exclude is empty', async () => {
    const data = {
      prettier: { current: '3.0.0', wanted: '3.1.0', latest: '3.1.0' },
    };

    await printOutdated(data, {
      ...baseOptions,
      exclude: {},
    });

    const allOutput = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(allOutput).not.toContain('excluded from analysis');
  });
});
