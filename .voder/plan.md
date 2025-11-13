## NOW
Remove `src/print-outdated.js` and `src/cli-options-helpers.js` from the `ignores` list in `eslint.config.js` so that ESLint will lint those files.

## NEXT
- Run `npm run lint` locally and fix any new ESLint errors or warnings in `src/print-outdated.js` and `src/cli-options-helpers.js` (e.g. complexity, unused-vars, max-lines-per-function).
- Commit and push the lint-fix changes to bring code_quality above 90%.

## LATER
- Lower the ESLint `complexity` threshold in `eslint.config.js` from 25 to 20, run lint, and refactor any functions that now exceed the new limit.
- Break up oversized modules (e.g. `src/cli-options-helpers.js`) into smaller, single-responsibility files to further reduce cyclomatic complexity.
- Add a Husky pre-commit hook to run `npm run format` on staged files and enforce consistent formatting automatically.