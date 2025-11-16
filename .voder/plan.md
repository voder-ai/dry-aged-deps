## NOW
Refactor `src/cli-options-helpers.js` to extract its duplicated flag-parsing logic into a single helper in `src/cli-options-helpers/utils-common.js`, update calls to use that helper, and verify the duplication in `cli-options-helpers.js` falls below 20%.

## NEXT
- Remove the per-file ESLint disables for complexity and max-lines-per-function on the CLI helper files in `eslint.config.js`, fix any resulting violations so the rules can be re-enabled.
- Update every test file’s JSDoc header to reference its specific story prompt (e.g. `prompts/001.0-DEV-RUN-NPM-OUTDATED.md`) instead of the user-story-map, and add `@req` tags in `describe`/`it` blocks for direct requirement traceability.

## LATER
- Add a CI step using jscpd (or a custom script) to enforce per-file duplication thresholds and fail on regressions.
- Introduce a CI check that scans test files and fails if any lack a valid `@story` JSDoc pointing to a real prompt file.
- Plan a similar refactor for `src/print-outdated.js` and `src/print-outdated-handlers.js` by pulling shared code into `src/print-outdated-utils.js` to eliminate remaining clones.