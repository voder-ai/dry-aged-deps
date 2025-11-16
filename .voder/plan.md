## NOW  
Extract common formatting and filtering logic from `src/print-outdated.js` and `src/print-outdated-handlers.js` into a new module `src/print-outdated-utils.js`.  

## NEXT  
- Update `src/print-outdated.js` and `src/print-outdated-handlers.js` to import and use `src/print-outdated-utils.js`, then run `npm run check:duplication` to confirm duplication falls below the threshold.  
- Audit source files for missing JSDoc `@story`/`@req` annotations and add them to every exported function in modules such as `src/cli-parser-utils.js`, `src/apply-filters.js`, and `src/build-rows.js`.  
- Update the README Attribution section to exactly “Created autonomously by voder.ai” with a link to https://voder.ai.  
- Identify any functions exceeding the ESLint cyclomatic complexity limit and refactor them into smaller helper functions.  

## LATER  
- Introduce a Husky “documentation-lint” pre-commit hook and CI step to enforce presence and correctness of all `@story`/`@req` annotations and prevent new `// @ts-nocheck` or broad ESLint-disable comments.  
- Add a CI check that fails the build if jscpd reports duplication above a tightened threshold (e.g., 15%) or if ESLint reports cyclomatic complexity above a lower limit (e.g., 12).  
- Gradually ratchet down duplication and complexity thresholds in lint and jscpd configurations, remediating any violations in small, verifiable increments.