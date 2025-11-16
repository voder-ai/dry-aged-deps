## NOW
Modify `test/build-rows.fetchError.test.js` to replace its placeholder JSDoc header with a traceable header, for example:
```js
/**
 * Tests for buildRows handling version‐fetch errors.
 * @story prompts/002.0-DEV-FETCH-VERSION-AGES.md
 * @req REQ-NPM-VIEW - use npm view to fetch version publish dates
 * @req REQ-AGE-CALC - calculate age in days for each version
 */
```

## NEXT
- Update the remaining test files to include precise `@story` and `@req` JSDoc annotations:
  - `test/build-rows.success.test.js` → story 001 / REQ-NPM-COMMAND, REQ-JSON-PARSE, REQ-OUTPUT-DISPLAY  
  - `test/build-rows.table-success.test.js` → story 001 / same requirements  
  - `test/build-rows.additional.test.js` → story 001 / REQ-OUTPUT-DISPLAY additional cases  
  - `test/build-rows.invalid-types.test.js` → story 001 / REQ-OUTPUT-DISPLAY error handling  
- Run `npm test` and `npm run type-check` to verify no regressions.

## LATER
- Introduce a lint rule or CI check that fails if any test file lacks a `@story` tag.
- Remove the placeholder traceability script (`scripts/add-test-traceability.cjs`) once all tests are annotated.
- Refine ESLint security rule disables by replacing any remaining broad disables with targeted inline comments and justification.