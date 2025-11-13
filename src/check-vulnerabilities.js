// @ts-nocheck - TODO: Fix type annotations incrementally
import { execFile } from 'child_process';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

/**
 * Check if a specific package version has known vulnerabilities.
 * Creates a temporary package.json with the specified version and runs npm audit.
 * This checks the entire dependency tree (direct + transitive dependencies).
 *
 * @param {string} packageName - The name of the npm package
 * @param {string} version - The version to check
 * @returns {Promise<number>} The number of vulnerabilities found (0 = safe)
 */
export async function checkVulnerabilities(packageName, version) {
  const pkgNameRegex = /^[a-z0-9@\-*/.]+$/i;
  if (!pkgNameRegex.test(packageName)) {
    throw new Error(`Invalid package name: ${packageName}`);
  }

  // Create temporary directory
  const tempDir = await fs.mkdtemp(join(tmpdir(), 'dry-aged-deps-'));

  try {
    // Create minimal package.json with the package@version to test
    const packageJson = {
      name: 'vulnerability-check',
      version: '1.0.0',
      dependencies: {
        [packageName]: version,
      },
    };

    await fs.writeFile(
      join(tempDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Run npm install to generate package-lock.json (needed for audit)
    await new Promise((resolve, reject) => {
      execFile(
        'npm',
        ['install', '--package-lock-only', '--no-audit'],
        { cwd: tempDir, encoding: 'utf8' },
        (error, stdout, stderr) => {
          if (error) {
            // npm install can exit with non-zero even on success for peer dep warnings
            // Only reject on actual errors
            if (stderr && !stderr.includes('WARN')) {
              return reject(error);
            }
          }
          resolve(stdout);
        }
      );
    });

    // Run npm audit --json to check for vulnerabilities
    const auditOutput = await new Promise((resolve) => {
      execFile(
        'npm',
        ['audit', '--json'],
        { cwd: tempDir, encoding: 'utf8' },
        (error, stdout) => {
          // npm audit exits with code 1 if vulnerabilities found
          // We want the output either way, so don't reject
          resolve(stdout);
        }
      );
    });

    const auditResult = JSON.parse(auditOutput);

    // Count total vulnerabilities across all severity levels
    const metadata = auditResult.metadata || {};
    const vulnerabilities = metadata.vulnerabilities || {};

    const total =
      (vulnerabilities.info || 0) +
      (vulnerabilities.low || 0) +
      (vulnerabilities.moderate || 0) +
      (vulnerabilities.high || 0) +
      (vulnerabilities.critical || 0);

    return total;
  } finally {
    // Clean up temporary directory
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}