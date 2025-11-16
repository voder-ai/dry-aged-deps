## NOW
Remove the `// @ts-nocheck` directive from the top of `src/cli-parser-utils.js` and correct any resulting type errors so that `npm run typecheck` passes without disabling checks.

## NEXT
- Remove all remaining file-level `// @ts-nocheck` directives across the `src/` directory, refactoring code or adding precise JSDoc annotations to satisfy the TypeScript checker.
- Refactor `src/cli-options-helpers.js` to eliminate duplicated parsing logic by extracting shared helper functions, then verify duplication metrics fall below acceptable thresholds.
- Add `@story` and `@req` JSDoc annotations to each exported function in `src/update-packages.js`, referencing `prompts/011.0-DEV-AUTO-UPDATE.md`.
- Insert `@story` annotations into the headers of test files that currently lack them, mapping each test file to its specific prompt/story file.

## LATER
- Introduce a Husky “documentation-lint” pre-commit hook and corresponding CI step to enforce the presence and correctness of all `@story`/`@req` annotations and prevent new `// @ts-nocheck` directives.
- Add a CI check that fails the build on any file-level disables or broad ESLint-disable comments to prevent regressions.
- Gradually tighten ESLint duplication and complexity thresholds, remediating any violations as they arise.
- Periodically audit and refactor functions or modules that exceed line-count or cyclomatic complexity limits by extracting smaller helpers.