## NOW  
Extract the duplicated JSON‐row mapping logic from **src/print-outdated.js** and **src/print-outdated-handlers.js** into a single helper function (e.g. `prepareJsonItems(rows, vulnMap, filterReasonMap, thresholds)`) in a new module `src/output-utils.js`, then update both callers to use that helper and remove the duplicated blocks.

## NEXT  
- Remove the `|| true` from the jscpd steps in `.github/workflows/ci-publish.yml` and `.husky/pre-push` so that code duplication above the 20% threshold fails the build.  
- Add ESLint rules in `eslint.config.js` for `max-params: ["error", 5]` and `max-depth: ["error", 4]` to enforce parameter count and nesting limits.  
- Extend the Husky pre-push hook to invoke the CodeQL analyze step (matching CI) so SAST runs locally before every push.

## LATER  
- Refactor **src/filter-by-security.js** into smaller, focused functions (e.g. extract vulnerability‐scoring and iteration logic) to lower cyclomatic complexity and satisfy complexity/max-lines rules.  
- Break **src/xml-formatter.js** into sub‐modules (e.g. `formatPackage`, `formatSummary`, `escapeXml`) to reduce function size and improve readability.  
- Implement parallelization or caching of vulnerability checks in **src/check-vulnerabilities.js** to boost performance on large dependency sets.