## NOW  
Implement the configurable-security-threshold story (006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD) by updating `src/filter-by-security.js` to honor the `prodMinSeverity`/`devMinSeverity` settings rather than blocking every nonzero vulnerability count.

## NEXT  
- Enhance `src/check-vulnerabilities.js` (and its tests) to return a breakdown of vulnerabilities by severity, not just a total count.  
- Add unit tests in `test/filter-by-security.test.js` covering cases where vulnerabilities below the threshold are allowed and only those at or above the threshold are blocked.  
- Update documentation (README.md, docs/api.md, and prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md) to describe the new severity-threshold behavior and examples.

## LATER  
- Add end-to-end CLI tests for `--severity`/`--prod-severity`/`--dev-severity` flags to verify enforcement in real fixtures.  
- Cache audit results to speed up repeated vulnerability checks.  
- After security threshold support is stable, refactor any remaining large functions (e.g., in `print-outdated.js` and `xml-formatter.js`) to reduce complexity and re-enable their ESLint complexity rules.