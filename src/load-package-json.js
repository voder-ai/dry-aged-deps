// @ts-check
import fs from 'fs';
import path from 'path';

/**
 * Load and parse package.json from the current working directory.
 * @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
 * @req REQ-JSON-PARSE
 * @returns {{ dependencies: Record<string, string>, devDependencies: Record<string, string> }}
 */
export function loadPackageJson() {
  // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
  // @req REQ-JSON-PARSE
  try {
    const pkgPath = path.join(process.cwd(), 'package.json');
    const pkgContent = fs.readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(pkgContent);
    return {
      dependencies: pkg.dependencies || {},
      devDependencies: pkg.devDependencies || {},
    };
  }
  // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
  // @req REQ-JSON-PARSE
  catch {
    // If package.json is missing or invalid, treat all as dev dependencies
    return { dependencies: {}, devDependencies: {} };
  }
}
