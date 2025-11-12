## NOW  
Extract the age‐filtering logic out of `src/print-outdated.js` into a new helper function (for example, `filterByAge` in `src/filter-by-age.js`) and update `print-outdated.js` to call it.

## NEXT  
- Extract the security‐filtering logic into its own helper (e.g. `filterBySecurity` in `src/filter-by-security.js`) and wire it into `print-outdated.js`.  
- Write dedicated unit tests for `filterByAge` and `filterBySecurity` to cover edge cases and validate thresholds.  
- Run `npm run lint` and fix any new lint errors or complexity warnings in the refactored modules.

## LATER  
- Refactor the remaining large functions (`printOutdated`, CLI argument parsing) into smaller, focused modules (e.g. `src/cli-args.js`, `src/formatter-table.js`).  
- Integrate a continuous code-quality analysis tool (e.g. SonarCloud or ESLint complexity rules) into the CI pipeline.  
- Add comprehensive JSDoc comments and update developer guidelines to document the new helper modules.