## NOW
Refactor `src/cli-options-helpers.js` to extract its duplicated flag-parsing and validation logic into shared utilities in `src/cli-options-helpers/utils-common.js`, reducing duplication below 20%.

## NEXT
- Run `npm run check:duplication` to verify duplication is now under the threshold.  
- Restore `checkJs` in `tsconfig.json` and update JSDoc in `src/xml-formatter-utils.js` so that `npm run type-check` passes without `// @ts-nocheck`.  
- Run `node scripts/add-story-annotations.cjs` and `node scripts/add-req-annotations.cjs`, then review several test files to ensure every header has the correct `@story` and `@req` annotations.

## LATER
- Author ADRs for Configuration File Support (010.0), Auto-Update Mode (011.0), and Invalid-Option Error Handling (014.0) in `docs/decisions/`.  
- Annotate critical conditional branches in `print-outdated.js`, `output-utils.js`, and `load-package-json.js` with `// @story` and `// @req` comments.  
- Expand `docs/developer-guidelines.md` with a “Traceability Conventions” section and add an `npm run check:traceability` script to enforce 100% coverage of `@story`/`@req` tags.  
- After completing these steps, re-measure code quality, testing, and documentation metrics to confirm they exceed 90%.