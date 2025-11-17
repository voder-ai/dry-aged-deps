## NOW
Lower the `max-lines-per-function` threshold from 90 to 80 in your ESLint configuration (`.eslintrc.js`).

## NEXT
- Run `npm run lint` to list any functions now exceeding 80 lines, then refactor each flagged function into smaller, focused helpers (with appropriate JSDoc and traceability annotations).
- Update the ESLint `max-lines` rule from 400 → 350 in `.eslintrc.js`, rerun `npm run lint` to find oversized files, and split/refactor those files into modules that comply with the new limit.
- Execute `npm run validate-traceability` to surface any remaining test files with invalid or missing `@story`/`@req` tags, then correct those annotations to point to the proper `prompts/XXX.0-DEV-*.md` and real requirement IDs.

## LATER
- Continue ratcheting down in 10-line increments (e.g. function limit → 70, file limit → 300), refactoring between each change and capturing the plan in an ADR.
- Re-enable the `validate-traceability` step in your Husky pre-push hook and CI workflow, and document the new linting/traceability standards in `CONTRIBUTING.md`.
- Periodically introduce stricter ESLint rules (cyclomatic complexity, no exceptions) once the codebase is stable under the current thresholds.