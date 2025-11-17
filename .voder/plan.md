## NOW
Run `npm run validate-traceability` to identify every test file with missing or incorrect `@story`/`@req` annotations.

## NEXT
- For each file flagged by the validation script, update its JSDoc header to reference the exact `prompts/XXX.0-DEV-*.md` story(s) and corresponding `@req` ID(s).  
- Re-run `npm run validate-traceability` and correct any remaining violations until the script reports zero errors.  
- Commit the updates with a message like  
  `test: update traceability annotations in tests`

## LATER
- Add a CI step that runs `npm run validate-traceability` and fails the build on any traceability errors.  
- Integrate this validation into the Husky pre-push hook for local enforcement.  
- Document the test traceability requirements in CONTRIBUTING.md to guide future contributors.