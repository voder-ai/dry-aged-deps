// @ts-check
/* eslint-disable traceability/valid-story-reference, traceability/valid-annotation-format, traceability/prefer-supports-annotation */
import fs from 'fs';
import path from 'path';

/**
 * Load and parse package.json from the current working directory.
 * @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-JSON-PARSE
 * @returns {{ dependencies: Record<string, string>, devDependencies: Record<string, string> }}
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
    // @req REQ-JSON-PARSE
    // If package.json is missing or invalid, treat all as dev dependencies
    // @story <story-file>.story.md
    return { dependencies: {}, devDependencies: {} };
  }
}
