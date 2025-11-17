## NOW
Modify the JSDoc header in `test/cli.upToDate.test.js` to reference the correct story file (`prompts/001.0-DEV-RUN-NPM-OUTDATED.md`) and include the appropriate `@req` identifiers.

## NEXT
- Update the JSDoc headers in `test/printOutdated.edge-cases.test.js`, `test/filter-by-security.test.js`, and `test/output-utils.test.js` to point to their respective `prompts/XXX.0-DEV-*.md` stories and real requirement IDs.
- Enhance each suite’s `describe` titles to include the story or requirement ID.
- Run `npm run validate-traceability` and `npm test` to confirm all traceability violations are fixed and tests pass.

## LATER
- Add unit and integration tests for any uncovered code paths to push overall coverage above 90%.
- Re-enable the `validate-traceability` step in the Husky pre-push hook and CI workflow.
- Document the new test traceability rules and coverage threshold in `CONTRIBUTING.md`.