## NOW
Add a JSDoc header to `test/vulnerability-evaluator.test.js` with the precise `@story` and matching `@req` annotations for prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md.

## NEXT
- Annotate each of the remaining test files under `test/` (`json-formatter.test.js`, `xml-formatter.test.js`, `update-packages.test.js`, `exit-codes.test.js`, `check-mode.test.js`, `invalid-options.test.js`) with their correct `@story` and `@req` tags.
- Run `npm test` and verify that coverage remains ≥ 90% and that every `.test.js` file contains at least one `@story` annotation.
- Add a CI lint rule (or Husky pre-commit hook) that fails if any test file is missing a `@story` tag.

## LATER
- Remove the placeholder traceability-injection script once all tests are annotated.
- Refactor tests to use shared test-data builders and eliminate complex logic in test bodies.
- Document test traceability conventions in `docs/developer-guidelines.md` and enforce them via an ESLint plugin or CI validation.