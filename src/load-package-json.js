// @ts-check
import fs from 'fs';
import path from 'path';

/**
 * Load and parse package.json from the current working directory.
 * @returns {{ dependencies: Record<string, string>, devDependencies: Record<string, string> }}
 * @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-JSON-PARSE
 */
export function loadPackageJson() {
  // @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-JSON-PARSE
  try {
    const pkgPath = path.join(process.cwd(), 'package.json');
    const pkgContent = fs.readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(pkgContent);
    return {
      dependencies: pkg.dependencies || {},
      devDependencies: pkg.devDependencies || {},
    };
  } catch {
    // @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-JSON-PARSE
    // If package.json is missing or invalid, treat all as dev dependencies
    return { dependencies: {}, devDependencies: {} };
  }
}
