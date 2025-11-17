## NOW
Update the two affected test files (`test/update-packages.abort-and-backup.test.js` and `test/xml-formatter.error-branch.test.js`) by replacing their placeholder `@story` and `@req UNKNOWN` annotations with the exact `prompts/…md` story paths and corresponding requirement IDs.

## NEXT
1. Regenerate and commit an up-to-date `package-lock.json` by running `npm install` and then verify with `npm run check:lockfile`.  
2. Modify the Husky pre-push hook to invoke the test-traceability validation script (e.g. `npm run validate-traceability`) before running the test suite.

## LATER
- Add fixture-directory installs (e.g. `npm install` in `test/fixtures`) into the pre-push hook so CLI tests always have their mocks ready.  
- Formalize a CI check that scans all `*.test.js` files for missing or malformed `@story/@req` tags and fails the build on violations.  
- Periodically audit and update all tests to ensure new stories and requirements are fully traceable.