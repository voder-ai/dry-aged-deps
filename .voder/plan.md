## NOW  
Add a new unit test for the legacy‐advisories branch of `checkVulnerabilities`, e.g. `test/check-vulnerabilities.advisories.test.js`, that mocks `npm audit` output with an `advisories` object and asserts `checkVulnerabilities` correctly parses `count`, `vulnerabilities`, and `details`.

## NEXT  
- Write additional branch‐coverage tests for modules with low coverage:  
  • `buildRows` (e.g. test JSON skip‐outdated and error paths)  
  • `xmlFormatter` (hit all conditional branches around thresholds, no‐thresholds, and error formatting)  
  • `filterBySecurity` (cover error paths and original single‐version logic without smart fallback)  
  • `updatePackages` (cover confirmation prompt abort and successful apply branches)  
- Run `npm test -- --coverage` and ensure **branch** coverage ≥ 80% on all affected modules.  
- Commit tests (e.g. `test/check-vulnerabilities.advisories.test.js`, others) and push with message `test: add branch‐coverage tests for missing audit/advisories and edge cases`.

## LATER  
- Refactor high‐complexity modules (`filter-by-security.js`, `xml-formatter.js`) into smaller helper functions to re-enable complexity and max-lines rules.  
- Gradually ratchet down ESLint complexity and function-length thresholds, fixing violations as you go.  
- Introduce caching or parallel execution in `fetchVersionTimes` to improve performance.  
- Update documentation to note support for legacy `advisories` format in `checkVulnerabilities`.