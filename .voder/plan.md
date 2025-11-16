## NOW
Add a precise JSDoc traceability header to `test/exit-codes.test.js`, for example:
```js
/**
 * Tests for CLI exit code behaviors
 * @story prompts/012.0-DEV-EXIT-CODE-REFINEMENT.md
 * @req REQ-EXIT-0    - Exit code 0 when no safe updates available
 * @req REQ-EXIT-1    - Exit code 1 when safe updates are available
 * @req REQ-EXIT-2    - Exit code 2 on errors
 */
```

## NEXT
- Annotate `test/invalid-options.test.js` with its `@story` (prompts/014.0-DEV-INVALID-OPTION-ERROR.md) and matching `@req` tags.
- Locate any test files containing loops (e.g. `for`, `while`) and refactor them into individual or parameterized `it()` cases.
- Run `npm test` and verify that coverage remains ≥ 90% and that every `.test.js` file has a `@story` annotation.

## LATER
- Add a CI lint rule or Husky pre-push hook to fail if a test file is missing an `@story` tag or contains loop constructs.
- Update `docs/developer-guidelines.md` with the test‐traceability and “no logic in tests” conventions.
- Remove any placeholder traceability-injection scripts now that all tests are properly annotated.