## NOW
Refactor `src/cli-options-helpers.js` to extract its duplicated flag-parsing logic into a new shared helper module (e.g. `src/cli-parser-utils.js`), reducing `src/cli-options-helpers.js` duplication below 20%.

## NEXT
- Add missing `@story` and `@req` JSDoc tags to every source function and test file to satisfy traceability requirements.
- Enrich code documentation by writing complete JSDoc comments for all public APIs (e.g. in `src/output-utils.js`, `src/config-loader.js`) and update `docs/api.md` accordingly.
- Update the Husky pre-commit hook (`.husky/pre-commit`) to run fast checks (`npm run lint && npm run type-check && npm run format:check`) before allowing commits.

## LATER
- Integrate a CI documentation-lint step that verifies presence and correctness of traceability annotations and JSDoc coverage.
- Consolidate shared logic from `print-outdated.js` and its handlers into utility modules to further reduce duplication and re-enable complexity rules.
- Rename test files that include forbidden terms and enforce naming conventions via a new ESLint rule.
- Gradually tighten per-file duplication and complexity thresholds in CI, ensuring ongoing code quality.