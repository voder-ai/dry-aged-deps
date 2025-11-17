## NOW
Add a JSDoc header to the `filterBySecurity` function in `src/filter-by-security.js` that includes the precise `@story` and `@req` annotations. For example, immediately above the exported function add:
```js
/**
 * Filters dependencies by security vulnerabilities and age.
 * @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
 * @story prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md
 * @req REQ-AUDIT-CHECK - Check vulnerabilities using audit API
 * @req REQ-TRANSITIVE-DEPS - Include transitive dependencies in vulnerability check
 * @req REQ-SECURITY-THRESHOLD - Exclude versions older than configured security threshold
 */
```

## NEXT
- Apply the same JSDoc-level traceability to all remaining core functions:
  - In `src/apply-filters.js` annotate the main export with `@story prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md`, `@req REQ-AGE-THRESHOLD`, etc.
  - In `src/print-outdated.js` annotate `printOutdated` with its five story files (`001.0`, `003.0`, `004.0`, `008.0`, `009.0`) and all `@req` IDs.
  - In `src/output-utils.js` annotate JSON and XML formatter functions with `@story prompts/008.0-DEV-JSON-OUTPUT.md`, `@story prompts/009.0-DEV-XML-OUTPUT.md` and their `@req` tags.
- Run `npm run validate-traceability` and fix any remaining missing or malformed annotations.
- Execute `npm test` to ensure all tests still pass with the new annotations.

## LATER
- Enable `checkJs: true` in `tsconfig.json` and add `// @ts-check` to JS files incrementally.
- Gradually tighten ESLint rules (complexity, max-lines) and refactor any violations.
- Document code/test traceability requirements and coverage thresholds in `CONTRIBUTING.md` and re-enable the traceability check in the pre-push hook.