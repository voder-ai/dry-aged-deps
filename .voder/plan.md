## NOW

Fix systematic linting suppression by correcting @req annotation format and removing eslint-disable directives.

**Root Cause**: The traceability ESLint plugin expects `@req REQ-ID` format (ID only), but code has `@req REQ-ID - Description` format (ID + description). This causes validation warnings, which were suppressed with eslint-disable directives in 25 out of 31 source files (80% suppression rate).

**Solution**: 
1. Remove descriptions from all `@req` annotations (keep only the requirement ID)
2. Remove all `/* eslint-disable traceability/valid-annotation-format */` directives
3. Remove all `/* eslint-disable traceability/valid-req-reference , traceability/valid-annotation-format , traceability/valid-annotation-format */` directives
4. Verify linting passes without suppressions

**Implementation**:
- Use multi-file search and replace to fix all @req annotations
- Remove eslint-disable directives from all source files
- Run npm run lint to verify no errors
- Confirm suppression rate is < 10%

**Files to Fix** (25 files total):
- src/security-smart-search.js
- src/vulnerability-evaluator.js
- src/security-helpers.js
- src/cli-parser-utils.js
- src/load-package-json.js
- src/cli-options-helpers.js
- src/xml-formatter.js
- src/config-loader.js
- src/check-vulnerabilities.js
- src/print-outdated-handlers.js
- src/age-calculator.js
- src/print-utils.js
- src/json-formatter.js
- src/output-utils.js
- src/xml-formatter-utils.js
- src/apply-filters.js
- src/print-outdated-utils.js
- src/filter-by-age.js
- src/cli-options.js
- src/fetch-version-times.js
- src/update-packages.js
- src/print-outdated.js
- src/filter-by-security.js
- src/build-rows.js
- src/index.js
- bin/dry-aged-deps.js (if it has suppressions)

Plus all corresponding test files that may have the same pattern.

## NEXT

Run quality checks to ensure the fixes are complete:

1. Run `npm run lint` - should pass with no warnings/errors
2. Run `npm run format:check` - should pass
3. Run `npm run typecheck` - should pass
4. Run `npm test` - should pass (all 211 tests)
5. Verify suppression count: `grep -r "eslint-disable" src/ bin/ test/ | wc -l` should be significantly reduced
6. Calculate new suppression rate - should be < 10%

## LATER

After quality checks pass:

1. Update .voder/history.md with summary of changes
2. Commit changes with descriptive message
3. Push to remote repository
4. Monitor CI/CD pipeline for success
5. Re-run assessment to confirm blocking issue is resolved
