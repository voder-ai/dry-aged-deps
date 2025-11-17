## NOW
Run `npm run validate-traceability` to identify all source and test files missing or mis‐annotated with `@story` and `@req` tags.

## NEXT
- For each file and code branch flagged by the validate‐traceability report, add a proper JSDoc block with `@story prompts/XXX.0-DEV-*.md` and matching `@req REQ-ID – description` tags.
- Update all test files that reference the user-story-map or use `@req UNKNOWN` so they point to the correct specific story markdown under `prompts/` with real requirement IDs.
- In `.eslintrc`, lower `max-lines-per-function` from 100→90 and `max-lines` from 500→400, then fix any new lint violations under those rules.
- Commit your annotation and lint-threshold changes and re-run `npm run validate-traceability` and `npm run lint` until both report zero errors.

## LATER
- Add the `validate-traceability` check to the Husky pre-push and CI pipeline to prevent regressions.
- Gradually ratchet the lint thresholds down to target levels (e.g. functions ≤50 lines, files ≤300 lines), addressing violations incrementally.
- Document the annotation and linting standards in `CONTRIBUTING.md` to guide future contributors.