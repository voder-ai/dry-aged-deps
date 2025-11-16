/**
 * @story prompts/dry-aged-deps-user-story-map.md
 * @req UNKNOWN - Placeholder traceability annotation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkVulnerabilities } from '../src/check-vulnerabilities.js';
import { execFile } from 'child_process';
import { promises as fs } from 'fs';

vi.mock('child_process');
vi.mock('fs', () => ({
  promises: {
    mkdtemp: vi.fn(),
    writeFile: vi.fn(),
    rm: vi.fn(),
  },
}));

describe('checkVulnerabilities legacy advisories', () => {
  const mockTempDir = '/tmp/dry-aged-deps-test-advisories';

  beforeEach(() => {
    vi.clearAllMocks();
    fs.mkdtemp.mockResolvedValue(mockTempDir);
    fs.writeFile.mockResolvedValue(undefined);
    fs.rm.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('parses advisories object and returns correct count, vulnerabilities, and details', async () => {
    // Mock npm install --package-lock-only
    execFile.mockImplementationOnce((cmd, args, opts, callback) => {
      callback(null, '', '');
    });

    // Prepare legacy advisories output
    const advisories = {
      100: {
        id: 100,
        module_name: 'foo',
        severity: 'high',
        title: 'Critical issue in foo',
        url: 'http://example.com/foo',
      },
      200: {
        id: 200,
        module_name: 'bar',
        severity: 'low',
        title: 'Minor issue in bar',
        url: 'http://example.com/bar',
      },
    };
    const auditResult = { advisories };

    // Mock npm audit --json with legacy advisories output
    execFile.mockImplementationOnce((cmd, args, opts, callback) => {
      callback(null, JSON.stringify(auditResult), '');
    });

    const result = await checkVulnerabilities('foo', '1.2.3');

    // Expect count equal to number of advisories
    expect(result.count).toBe(2);
    // Vulnerabilities breakdown should default to zero counts
    expect(result.vulnerabilities).toEqual({
      info: 0,
      low: 0,
      moderate: 0,
      high: 0,
      critical: 0,
    });
    // Details should equal the advisories values
    expect(result.details).toEqual(Object.values(advisories));
    // Temporary directory cleaned up
    expect(fs.rm).toHaveBeenCalledWith(mockTempDir, {
      recursive: true,
      force: true,
    });
  });
});
