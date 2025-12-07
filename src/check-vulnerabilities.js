// @ts-check
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
 * @returns {Promise<{ count: number, vulnerabilities: { info: number, low: number, moderate: number, high: number, critical: number }, details: Array<Object> }>}
 * @supports prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md REQ-AUDIT-CHECK REQ-TRANSITIVE-DEPS
 */
export async function checkVulnerabilities(packageName, version) {
  const pkgNameRegex = /^[a-z0-9@\-*/.]+$/i;
  // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
  // @req REQ-AUDIT-CHECK
  if (!pkgNameRegex.test(packageName)) {
    throw new Error(`Invalid package name: ${packageName}`);
  }

  // Create temporary directory
  const tempDir = await fs.mkdtemp(join(tmpdir(), 'dry-aged-deps-'));

  // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
  // @req REQ-AUDIT-CHECK
  try {
    // Create minimal package.json with the package@version to test
    const packageJson = {
      name: 'vulnerability-check',
      version: '1.0.0',
      dependencies: {
        [packageName]: version,
      },
    };

    await fs.writeFile(join(tempDir, 'package.json'), JSON.stringify(packageJson, null, 2));

    // Run npm install to generate package-lock.json (needed for audit)
    await new Promise((resolve, reject) => {
      execFile(
        'npm',
        ['install', '--package-lock-only', '--no-audit'],
        { cwd: tempDir, encoding: 'utf8' },
        (error, stdout, stderr) => {
          // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
          // @req REQ-AUDIT-CHECK
          if (error) {
            // npm install can exit with non-zero even on success for peer dep warnings
            // Only reject on actual errors
            // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
            // @req REQ-AUDIT-CHECK
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
      execFile('npm', ['audit', '--json'], { cwd: tempDir, encoding: 'utf8' }, (_error, stdout) => {
        // npm audit exits with code 1 if vulnerabilities found
        // We want the output either way, so don't reject
        resolve(stdout);
      });
    });

    const auditResult = JSON.parse(auditOutput);

    // Count total vulnerabilities across all severity levels
    const metadata = auditResult.metadata || {};
    const vulnerabilities = metadata.vulnerabilities || {
      info: 0,
      low: 0,
      moderate: 0,
      high: 0,
      critical: 0,
    };

    let total =
      (vulnerabilities.info || 0) +
      (vulnerabilities.low || 0) +
      (vulnerabilities.moderate || 0) +
      (vulnerabilities.high || 0) +
      (vulnerabilities.critical || 0);

    // Collect detailed vulnerability entries
    let details = [];
    // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
    // @req REQ-AUDIT-CHECK
    if (auditResult.vulnerabilities && typeof auditResult.vulnerabilities === 'object') {
      details = Object.entries(auditResult.vulnerabilities).map(([moduleName, vuln]) => ({ moduleName, ...vuln }));
    }
    // eslint-disable-next-line traceability/require-branch-annotation -- Prettier/traceability conflict with else-if (see issue #4)
    else if (auditResult.advisories && typeof auditResult.advisories === 'object') {
      details = Object.values(auditResult.advisories);
    }

    // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
    // @req REQ-AUDIT-CHECK
    if (auditResult.advisories) {
      total = details.length;
    }

    return {
      count: total,
      vulnerabilities,
      details,
    };
  } finally {
    // Clean up temporary directory
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}
