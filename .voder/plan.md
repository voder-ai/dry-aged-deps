## NOW  
Add JSDoc `@story` and `@req` annotations to every exported function in `src/security-helpers.js`, linking each to `prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md` and the corresponding vulnerability-filtering requirement IDs.

## NEXT  
- Audit all remaining modules in `src/` (e.g. `apply-filters.js`, `build-rows.js`, `fetch-version-times.js`, `filter-by-age.js`, `filter-by-security.js`, `load-package-json.js`, `print-outdated-utils.js`, `print-outdated.js`, `print-utils.js`, `security-smart-search.js`, `update-packages.js`, `vulnerability-evaluator.js`, `xml-formatter-utils.js`, `xml-formatter.js`) and add proper JSDoc `@story`/`@req` annotations for every public API and complex internal function.  
- Update every `.test.js` file to replace placeholder JSDoc headers with precise `@story` prompt paths and `@req` IDs, and remove all references to `prompts/dry-aged-deps-user-story-map.md`.  
- Upgrade GitHub Actions in `.github/workflows/ci-publish.yml` to the latest major versions (`actions/checkout@v4`, `actions/setup-node@v4`, `codeql-action@v4`) and run `npm run lint && npm test` locally to confirm no deprecation warnings.

## LATER  
- Build or configure an ESLint (or Vitest) plugin to enforce the presence and correctness of `@story`/`@req` annotations in both source and test files as part of the CI lint step.