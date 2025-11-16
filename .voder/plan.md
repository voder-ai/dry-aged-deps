## NOW
Modify the JSDoc header in `test/exit-codes.test.js` to replace the placeholder annotations with the precise traceability header referencing `prompts/012.0-DEV-EXIT-CODE-REFINEMENT.md` and its requirements (`REQ-EXIT-0`, `REQ-EXIT-1`, `REQ-EXIT-2`).

## NEXT
- Annotate `test/invalid-options.test.js` with its correct `@story` (`prompts/014.0-DEV-INVALID-OPTION-ERROR.md`) and matching `@req` tags.
- Scan all remaining `.test.js` files for any placeholder `@req UNKNOWN` or missing `@story` and update them to reference the exact prompt and requirement IDs.
- Locate any tests that use loops (`for`/`while`) and refactor each into individual or parameterized `it()` cases to eliminate logic in tests.
- Run `npm test -- --coverage` and verify overall coverage remains ≥ 90% and that no test file contains placeholder annotations.

## LATER
- Introduce a CI lint rule or Husky pre-push check to fail the build if any test file lacks a valid `@story` annotation or contains loop constructs.
- Update `docs/developer-guidelines.md` to formalize the “test traceability” requirements and the “no logic in tests” convention.
- Remove any placeholder traceability‐injection scripts now that all tests have been correctly annotated.