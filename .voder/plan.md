## NOW
Update `test/cli.format-json.test.js` by adding a JSDoc header with the appropriate `@story` and `@req` annotations (e.g., reference `prompts/008.0-DEV-JSON-OUTPUT.md` and the JSON-output requirements) so that traceability validation passes.

## NEXT
- Add similar JSDoc `@story`/`@req` headers to the other test files missing annotations:
  - `test/cli.format-xml.test.js`
  - `test/cli.test.js`
  - `test/printOutdated.test.js`
  - `test/printOutdated.xmlEmpty.test.js`
- Run `npm run validate-traceability` and fix any remaining annotation errors.
- Re-run `npm test` and `npm run coverage` to confirm the testing score rises above 90%.

## LATER
- Audit and remediate all remaining high-severity vulnerabilities:
  - Upgrade or document exceptions for affected dependencies.
  - Create or update an `audit-resolve.json` (or equivalent) to track accepted advisories with expiration dates.
  - Update the `audit:ci` npm script to match the finalized list of excluded advisories.
- Verify the CI pipeline’s security gate no longer reports unresolved high-severity issues.