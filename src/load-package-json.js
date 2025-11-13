import fs from 'fs';
import path from 'path';

/* eslint-disable security/detect-non-literal-fs-filename */

/**
 * Load and parse package.json from the current working directory.
 * Returns an object with dependencies and devDependencies fields.
 * If the file cannot be read or parsed, returns an object with empty dependencies.
 *
 * @returns {{ dependencies: Record<string, string>, devDependencies: Record<string, string> }}
 */
export function loadPackageJson() {
  try {
    const pkgPath = path.join(process.cwd(), 'package.json');
    const pkgContent = fs.readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(pkgContent);
    return {
      dependencies: pkg.dependencies || {},
      devDependencies: pkg.devDependencies || {},
    };
  } catch {
    // If package.json is missing or invalid, treat all as dev dependencies
    return { dependencies: {}, devDependencies: {} };
  }
}