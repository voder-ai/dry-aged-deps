## NOW  
Refactor `src/vulnerability-evaluator.js` to remove its file-wide `// eslint-disable security/detect-object-injection` directive by replacing dynamic property lookups with validated, safe access so that the module passes ESLint security rules without suppression.  

## NEXT  
- Apply the same safe-access refactoring to `src/security-helpers.js` and `src/update-packages.js`, removing their `eslint-disable security/detect-object-injection` comments.  
- Add targeted unit tests for every error and edge-case branch in those three modules to raise their test coverage above 90%.  
- Update `docs/api.md` and the JSDoc in those modules to reflect any signature or behavior changes (e.g. implement or remove the `configFile` option in `printOutdated`) so code and documentation stay in sync.  

## LATER  
- Extract and consolidate duplicated logic from `print-outdated.js` and its handler files into shared utility modules, reducing duplication and allowing complexity/max-lines rules to be re-enabled.  
- Rename test files that include forbidden terms like “branch” to descriptive, scenario-based names and enforce this convention via a new ESLint rule.  
- Integrate a documentation-lint step into CI that verifies every source and test file has correct `@story` and `@req` JSDoc annotations.