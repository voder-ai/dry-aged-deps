## NOW
Refactor duplicated logic in `src/cli-options-helpers.js` by consolidating repeated CLI option–validation and parsing code into a single reusable helper function.

## NEXT
- Refactor overlapping code in `src/print-outdated.js` and `src/print-outdated-handlers.js` to remove duplication and unify output–formatting logic.  
- Re-enable the ESLint complexity and max-lines rules for these modules and fix any new violations introduced by the refactoring.  
- Add targeted unit tests for `src/vulnerability-evaluator.js` to raise its statement and branch coverage above 90%.

## LATER
- Implement caching and parallelization for `npm view` and `npm audit` calls to improve execution reliability and reduce CLI run time on large dependency sets.  
- Introduce a performance-benchmarking suite to measure and monitor CLI execution under real-world project fixtures.  
- Create test-data builder utilities to eliminate test-suite duplication and simplify edge-case coverage.  
- Incrementally extract large, high-complexity functions into smaller modules to further drive down cyclomatic complexity.