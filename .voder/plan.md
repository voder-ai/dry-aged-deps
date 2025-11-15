## NOW
Run `npm install --ignore-scripts --package-lock-only` to regenerate the project’s `package-lock.json` and eliminate the current lockfile drift.

## NEXT
- Stage and commit the updated `package-lock.json` to git.
- Run `npm run check:lockfile` to confirm the lockfile is now in sync.
- Execute `npm run validate` (lint, typecheck, tests, duplication, lockfile) to verify all quality gates still pass.

## LATER
- Annotate the CLI entrypoint (`bin/dry-aged-deps.js`) and the `parseOptions` function in `src/cli-options.js` with complete `@story` and `@req` JSDoc tags.
- Insert branch-level `// @story …` and `// @req …` comments in key error-handling blocks (e.g., `print-outdated.js`, `output-utils.js`, `load-package-json.js`).
- Refactor any remaining large or duplicated modules (such as `src/cli-options-helpers.js`) to reduce complexity and improve maintainability.
- Expand `docs/developer-guidelines.md` with a “Traceability Conventions” section and author an `npm run check:traceability` script to enforce 100% coverage of `@story`/`@req` tags in CI.
- After completing these steps, re-measure Documentation and Code Quality metrics to ensure they exceed 90%.