## NOW
Add comprehensive unit tests for `src/update-packages.js` that exercise every logical branch (successful update, backup failure, prompt abort, `--yes` auto-confirm, error handling) to raise its branch coverage above 90%.

## NEXT
- Write targeted unit tests for `src/build-rows.js` to cover its error paths, invalid input branches, and additional scenarios.  
- Add unit tests for `src/output-utils.js` to exercise all formatting branches and edge cases.  
- Refactor the duplicated logic in `src/security-helpers.js` and `src/vulnerability-evaluator.js` into a shared utility module to eliminate remaining code clones.

## LATER
- Integrate a jscpd duplication check (e.g. `npx jscpd --threshold 20 src`) into the CI workflow to enforce DRY automatically.  
- Further refactor `src/cli-options-helpers.js` to reduce its duplication below 10%.  
- Break up large, high-complexity functions in `src/xml-formatter.js` and `src/filter-by-security.js` into smaller units so ESLint complexity and max-lines rules can be re-enabled.  
- Explore caching and parallelization of `npm view` and `npm audit` calls to improve performance on large dependency sets.