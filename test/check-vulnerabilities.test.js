/**
 * Tests for checkVulnerabilities function
 *
 * @supports prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md REQ-AUDIT-CHECK REQ-TRANSITIVE-DEPS
 */

import { checkVulnerabilities } from '../src/check-vulnerabilities.js';
import { execFile } from 'child_process';
import { promises as fs } from 'fs';

// Mock the child_process and fs modules
vi.mock('child_process');
vi.mock(
  'fs',
  // @supports prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md REQ-AUDIT-CHECK
  () => ({
    promises: {
      mkdtemp: vi.fn(),
      writeFile: vi.fn(),
      rm: vi.fn(),
    },
  })
);

describe('Story 004.0-DEV-FILTER-VULNERABLE-VERSIONS: checkVulnerabilities', () => {
  const mockTempDir = '/tmp/dry-aged-deps-test123';

  beforeEach(() => {
    vi.clearAllMocks();
    fs.mkdtemp.mockResolvedValue(mockTempDir);
    fs.writeFile.mockResolvedValue(undefined);
    fs.rm.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('[REQ-AUDIT-CHECK] [REQ-TRANSITIVE-DEPS] returns 0 when no vulnerabilities found', async () => {
    // Mock npm install --package-lock-only
    execFile.mockImplementationOnce((cmd, args, opts, callback) => {
      callback(null, '', '');
    });

    // Mock npm audit --json with zero vulnerabilities
    execFile.mockImplementationOnce((cmd, args, opts, callback) => {
      const auditResult = {
        metadata: {
          vulnerabilities: {
            info: 0,
            low: 0,
            moderate: 0,
            high: 0,
            critical: 0,
          },
        },
      };
      callback(null, JSON.stringify(auditResult), '');
    });

    const result = await checkVulnerabilities('express', '4.18.2');

    expect(result.count).toBe(0);
    expect(result.vulnerabilities).toEqual({
      info: 0,
      low: 0,
      moderate: 0,
      high: 0,
      critical: 0,
    });
    expect(result.details).toEqual([]);
    expect(fs.mkdtemp).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalled();
    expect(fs.rm).toHaveBeenCalledWith(mockTempDir, {
      recursive: true,
      force: true,
    });
  });

  it('[REQ-AUDIT-CHECK] [REQ-TRANSITIVE-DEPS] returns vulnerability count when vulnerabilities found', async () => {
    // Mock npm install --package-lock-only
    execFile.mockImplementationOnce((cmd, args, opts, callback) => {
      callback(null, '', '');
    });

    // Mock npm audit --json with vulnerabilities
    execFile.mockImplementationOnce((cmd, args, opts, callback) => {
      const auditResult = {
        metadata: {
          vulnerabilities: {
            info: 0,
            low: 1,
            moderate: 2,
            high: 0,
            critical: 0,
          },
        },
      };
      callback(null, JSON.stringify(auditResult), '');
    });

    const result = await checkVulnerabilities('@semantic-release/npm', '13.1.1');

    expect(result.count).toBe(3); // 1 low + 2 moderate
    expect(result.vulnerabilities.low).toBe(1);
    expect(result.vulnerabilities.moderate).toBe(2);
  });

  it('[REQ-AUDIT-CHECK] cleans up temporary directory even on error', async () => {
    // Mock npm install --package-lock-only to fail
    execFile.mockImplementationOnce((cmd, args, opts, callback) => {
      callback(new Error('Network error'), '', 'Network error');
    });

    await expect(checkVulnerabilities('invalid-package', '1.0.0')).rejects.toThrow();

    expect(fs.rm).toHaveBeenCalledWith(mockTempDir, {
      recursive: true,
      force: true,
    });
  });

  it('[REQ-AUDIT-CHECK] throws error for invalid package name', async () => {
    await expect(checkVulnerabilities('invalid name with spaces', '1.0.0')).rejects.toThrow('Invalid package name');

    // Should not create temp directory for invalid input
    expect(fs.mkdtemp).not.toHaveBeenCalled();
  });

  it('[REQ-AUDIT-CHECK] continues despite WARN in stderr during npm install', async () => {
    // Simulate npm install warning in stderr
    execFile.mockImplementationOnce((cmd, args, opts, callback) => {
      callback(null, '', 'npm WARN deprecated package');
    });

    // Mock npm audit --json with zero vulnerabilities
    execFile.mockImplementationOnce((cmd, args, opts, callback) => {
      const auditResult = {
        metadata: {
          vulnerabilities: {
            info: 0,
            low: 0,
            moderate: 0,
            high: 0,
            critical: 0,
          },
        },
      };
      callback(null, JSON.stringify(auditResult), '');
    });

    const result = await checkVulnerabilities('some-package', '1.2.3');
    expect(result.count).toBe(0);
    expect(fs.rm).toHaveBeenCalledWith(mockTempDir, {
      recursive: true,
      force: true,
    });
  });
});
