## NOW  
Refactor `src/security-helpers.js` to eliminate the inline `/* eslint-disable security/detect-object-injection */` by replacing any dynamic property access with `Object.prototype.hasOwnProperty.call(vulns, key)`, then remove the disable comment.

## NEXT  
- Remove all remaining `security/detect-object-injection` ESLint disables in `src/fetch-version-times.js`, `src/vulnerability-evaluator.js`, and `src/update-packages.js` by refactoring dynamic lookups into safe utilities.  
- Write unit tests to exercise the untested branches in `src/build-rows.js` and `src/filter-by-security.js` (as flagged by coverage gaps) to push branch coverage above 90%.  
- Audit and add missing `@story`/`@req` JSDoc annotations in `src/load-package-json.js`, `src/xml-formatter-utils.js`, and any other modules still lacking traceability tags.

## LATER  
- Introduce a Husky “documentation-lint” pre-commit hook and CI step that enforces the presence and correctness of all `@story` and `@req` annotations in source and test files.  
- Continuously refactor any functions exceeding cyclomatic complexity >12 or length >80 lines by extracting smaller helpers.  
- Periodically tighten ESLint duplication and complexity thresholds, remediating new violations as they arise.