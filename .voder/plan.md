## NOW
Remove the `// @ts-nocheck` directive from `src/cli-options-helpers.js` and replace it with precise JSDoc type annotations so that `npm run type-check` passes without suppressions.

## NEXT
Add missing `@story` and `@req` JSDoc tags to every public function and key code branch in `src/update-packages.js`, then run the traceability checker (ESLint or custom) to verify 100% coverage of traceability annotations.

## LATER
Refactor all test files to reference their specific story prompt (not the user-story-map), include requirement IDs in `describe` and `it` blocks, and rewrite tests into clear GIVEN-WHEN-THEN structure; then add a CI check to enforce test traceability.