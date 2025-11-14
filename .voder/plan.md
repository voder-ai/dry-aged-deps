## NOW  
Add a new unit test for the smart‐filter branch in `src/build-rows.js` by creating `test/build-rows.no-mature-version.test.js` that exercises the case where no available version meets the maturity threshold and asserts the correct “skip” behavior.  

## NEXT  
- Add unit tests for the remaining untested branches in key modules:  
  - `xml-formatter` error and threshold‐only paths (`test/xml-formatter.error-branch.test.js`)  
  - `vulnerability-evaluator` edge cases for unexpected audit output (`test/vulnerability-evaluator.unexpected-format.test.js`)  
  - `update-packages` abort, confirm, and backup‐error flows (`test/update-packages.abort-and-backup.test.js`)  
- Run the full suite and verify branch coverage rises above 90%; iterate by adding any additional tests for still-missed branches.  

## LATER  
- Refactor all test files to include JSDoc `@story` annotations for requirement traceability.  
- Introduce shared test data builders/fixtures to DRY repetitive setups.  
- Gradually tighten coverage thresholds (aiming for 95%+ branch coverage) and add tests for any new gaps as they appear.