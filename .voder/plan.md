# Implementation Plan: Remove File-Level eslint-disable Directives

## Goal
Remove all file-level `/* eslint-disable ... */` directives by fixing the underlying traceability issues that require them. Work systematically, one file at a time.

## Strategy
For each file:
1. Remove the file-level `/* eslint-disable ... */` directive
2. Run `npm run lint` to see what errors appear
3. Fix the actual traceability issues (add missing annotations, fix format issues, etc.)
4. Verify lint passes and tests still pass
5. Commit with message: `chore(lint): remove file-level eslint-disable from <filename>`

## NOW: Source Files - Simple Cases (2 rules disabled)

These files disable only `valid-story-reference` and `valid-annotation-format`. Start with the smallest files first.

### 1. `src/cli-options-helpers/get-flag-raw-value.js`
- **Disabled rules**: `valid-story-reference`, `valid-annotation-format`
- **Action**: Remove directive, fix any story reference or annotation format issues
- **Estimate**: ~5 min

### 2. `src/cli-options-helpers/parse-integer-flag.js`
- **Disabled rules**: `valid-story-reference`, `valid-annotation-format`
- **Action**: Remove directive, fix issues
- **Estimate**: ~5 min

### 3. `src/cli-options-helpers/parse-string-flag.js`
- **Disabled rules**: `valid-story-reference`, `valid-annotation-format`
- **Action**: Remove directive, fix issues
- **Estimate**: ~5 min

### 4. `src/security-smart-search.js`
- **Disabled rules**: `valid-story-reference`, `valid-annotation-format`
- **Action**: Remove directive, fix issues
- **Estimate**: ~5 min

### 5. `src/security-helpers.js`
- **Disabled rules**: `valid-story-reference`, `valid-annotation-format`
- **Action**: Remove directive, fix issues
- **Estimate**: ~5 min

### 6. `src/filter-by-age.js`
- **Disabled rules**: `valid-story-reference`, `valid-annotation-format`
- **Action**: Remove directive, fix issues
- **Estimate**: ~5 min

### 7. `src/output-utils.js`
- **Disabled rules**: `valid-story-reference`, `valid-annotation-format`
- **Action**: Remove directive, fix issues
- **Estimate**: ~5 min

### 8. `src/print-utils.js`
- **Disabled rules**: `valid-story-reference`, `valid-annotation-format`
- **Action**: Remove directive, fix issues
- **Estimate**: ~5 min

### 9. `src/print-outdated.js`
- **Disabled rules**: `valid-story-reference`, `valid-annotation-format`
- **Action**: Remove directive, fix issues
- **Estimate**: ~5 min

### 10. `src/build-rows.js`
- **Disabled rules**: `valid-story-reference`, `valid-annotation-format`
- **Action**: Remove directive, fix issues
- **Estimate**: ~5 min

### 11. `src/json-formatter.js`
- **Disabled rules**: `valid-story-reference`, `valid-annotation-format`
- **Action**: Remove directive, fix issues
- **Estimate**: ~5 min

### 12. `src/xml-formatter.js`
- **Disabled rules**: `valid-story-reference`, `valid-annotation-format`
- **Action**: Remove directive, fix issues
- **Estimate**: ~5 min

## NEXT: Source Files - Moderate Cases (3 rules disabled)

### 13. `src/load-package-json.js`
- **Disabled rules**: `valid-story-reference`, `valid-annotation-format`, `prefer-supports-annotation`
- **Action**: Remove directive, fix issues
- **Estimate**: ~10 min

### 14. `src/vulnerability-evaluator.js`
- **Disabled rules**: `require-story-annotation`, `require-req-annotation`
- **Action**: Remove directive, add missing story/req annotations
- **Estimate**: ~10 min

## LATER: Source Files - Complex Cases (4 rules disabled)

### 15. `src/config-loader.js`
- **Disabled rules**: `valid-story-reference`, `valid-req-reference`, `valid-annotation-format`, `prefer-supports-annotation`
- **Action**: Remove directive, fix issues
- **Estimate**: ~15 min

### 16. `src/update-packages.js`
- **Disabled rules**: `valid-story-reference`, `valid-req-reference`, `valid-annotation-format`, `prefer-supports-annotation`
- **Action**: Remove directive, fix issues
- **Estimate**: ~15 min

### 17. `src/filter-by-security.js`
- **Disabled rules**: `valid-story-reference`, `valid-req-reference`, `valid-annotation-format`, `require-branch-annotation`
- **Action**: Remove directive, fix issues
- **Estimate**: ~15 min

### 18. `bin/dry-aged-deps.js`
- **Disabled rules**: `valid-story-reference`, `valid-req-reference`, `valid-annotation-format`, `prefer-supports-annotation`
- **Action**: Remove directive, fix issues
- **Estimate**: ~10 min

## FINAL: Test Files

### 19. `test/check-vulnerabilities.advisories.test.js`
- **Disabled rules**: `valid-story-reference`, `valid-annotation-format`
- **Action**: Remove directive, fix issues
- **Estimate**: ~5 min

### 20. `test/check-vulnerabilities.test.js`
- **Disabled rules**: `valid-story-reference`, `valid-annotation-format`
- **Action**: Remove directive, fix issues
- **Estimate**: ~5 min

### 21. `test/filter-by-security-severity.test.js`
- **Disabled rules**: `valid-story-reference`, `valid-annotation-format`
- **Action**: Remove directive, fix issues
- **Estimate**: ~5 min

### 22. `test/filter-by-security.fetchError-fallback.test.js`
- **Disabled rules**: `valid-story-reference`, `valid-annotation-format`
- **Action**: Remove directive, fix issues
- **Estimate**: ~5 min

### 23. `test/cli.error-cmd.test.js`
- **Disabled rules**: `valid-story-reference`, `valid-annotation-format`, `prefer-supports-annotation`
- **Action**: Remove directive, fix issues
- **Estimate**: ~10 min

### 24. `test/cli-options-helpers.test.js`
- **Disabled rules**: `valid-story-reference`, `valid-req-reference`, `valid-annotation-format`, `prefer-supports-annotation`
- **Action**: Remove directive, fix issues
- **Estimate**: ~10 min

### 25. `test/cli.config-file.test.js`
- **Disabled rules**: `valid-story-reference`, `valid-req-reference`, `valid-annotation-format`, `prefer-supports-annotation`
- **Action**: Remove directive, fix issues
- **Estimate**: ~10 min

## Completion Criteria
- All 25 file-level `/* eslint-disable ... */` directives removed
- `npm run lint` passes with no errors
- `npm test` passes with 100% tests passing
- All commits follow conventional commit format: `chore(lint): remove file-level eslint-disable from <filename>`
- Total estimated time: ~3-4 hours
