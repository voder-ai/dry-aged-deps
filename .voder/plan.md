## NOW
Remove the `@ts-nocheck` directive from the top of bin/dry-aged-deps.js and replace it with targeted JSDoc type annotations so that `tsc --noEmit` passes without disabling type checking for the entire file.

## NEXT
- Refactor eslint.config.js to split out file-specific overrides so you can re-enable the complexity and max-lines-per-function rules globally.
- Audit all production code for any remaining `eslint-disable` directives and replace them with either justifying comments or more narrowly scoped suppressions.
- Add missing `@story` and `@req` JSDoc annotations to any test files that still lack them, and rename any test files whose names include “branch”, “branches”, “partial-branches”, or “missing-branches” to reflect actual scenarios.

## LATER
- Insert an “Attribution” section into README.md (and other user-facing docs) stating “Created autonomously by voder.ai” with a link to https://voder.ai.
- Add a link to the committed config.schema.json in the README for editor autocomplete guidance.
- Plan for performance improvements (e.g., caching version-time fetches, parallelizing checks) once quality metrics meet targets.