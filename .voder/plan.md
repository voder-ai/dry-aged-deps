## NOW  
Update the `lint` script in package.json to run ESLint over your source and bin files (for example: `"lint": "eslint src bin --ext .js --max-warnings=0"`) so that `npm run lint` actually enforces your ESLint rules locally.

## NEXT  
- In .github/workflows/ci-publish.yml and your Husky pre-push hook, replace the stubbed lint step with `npm run lint` so that lint failures block CI and local pushes.  
- Refactor src/filter-by-security.js by extracting its inner loops and scoring logic into smaller helper functions to reduce cyclomatic complexity, then re-enable ESLint’s `complexity`, `max-depth`, and `max-lines-per-function` rules for that file.  
- In eslint.config.js, lower the `max-lines-per-function` threshold (e.g. from 200 to 150) to tighten function-size limits across the codebase.

## LATER  
- Globally re-enable the `max-depth` rule and refactor any remaining functions that exceed the depth limit.  
- Remove the `|| true` bypass in your jscpd steps so code-duplication above threshold fails the build.  
- Break up src/xml-formatter.js into focused submodules (e.g. formatPackage, formatSummary, escapeXml) to reduce function size and improve maintainability.  
- Implement caching or parallelization in src/check-vulnerabilities.js to boost performance on large dependency sets.