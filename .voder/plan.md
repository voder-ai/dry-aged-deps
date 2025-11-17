## NOW
Remove the inline test/mock implementation (the `execFile.mock` wrapper) from `src/fetch-version-times.js` so that production code no longer contains test logic.

## NEXT
- Extract that mock logic into a new helper module at `test/helpers/execFileMock.js` and update all tests to import and use it.  
- Replace any `@story prompts/*-user-story-map.md` and `@req UNKNOWN` annotations in test files with the correct `prompts/XXX.0-DEV-*.md` paths and real requirement IDs.  
- Run `npm run lint`, `npm test`, and `npm run validate-traceability` to confirm code_quality and testing metrics are back above 90%.

## LATER
- Re-enable the `validate-traceability` step in the Husky pre-push hook and CI pipeline to lock in annotation compliance.  
- Refactor `xml-formatter-utils.js` into smaller focused modules to improve maintainability and meet future lint thresholds.  
- Document the traceability and linting standards in `CONTRIBUTING.md` and plan a gradual tightening of line-count rules.