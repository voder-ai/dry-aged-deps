## NOW  
Add a proper JSDoc header to test/update-packages.additional.test.js with its corresponding `@story` reference (e.g. prompts/011.0-DEV-AUTO-UPDATE.md) and a matching `@req` tag so that traceability validation passes.

## NEXT  
- Add similar `@story` and `@req` JSDoc headers to test/filter-by-age.test.js.  
- Remove any `eslint-disable` comments that bypass traceability in those two files.  
- Run `npm run validate-traceability` and verify there are no missing annotations.

## LATER  
- Audit all other test files for hidden loops or inline logic; refactor into explicit, parameterized Vitest assertions.  
- Re-run coverage and validate-traceability to ensure the TESTING score rises above 90%.  
- Continually monitor for any new tests added without annotations and enforce through CI.