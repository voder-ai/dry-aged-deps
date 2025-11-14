## NOW  
Remove the early JSON‐only branch in `src/print-outdated.js` (the top `if (format === 'json') { … return }` block) so that JSON output flows through the same `applyFilters` + `handleJsonOutput` pipeline and therefore honors maturity‐and‐security filtering.

## NEXT  
- Update or add CLI tests (`test/cli.format-json.test.js`, `test/cli.json.skip-outdated.test.js`) to assert that JSON output excludes packages younger than the age threshold or with vulnerabilities.  
- Update `README.md` and `docs/api.md` examples for `--format=json` to show filtered results.  
- Run `npm test -- --coverage` and confirm branch coverage ≥ 80% on `print-outdated.js` (including the JSON path).

## LATER  
- Refactor `src/print-outdated.js` to simplify control flow and eliminate duplication between JSON, XML, and table handlers.  
- Break down `filter-by-security.js` and `xml-formatter.js` into smaller helper functions to re-enable ESLint complexity/max-lines rules.  
- Introduce caching or parallel execution in `src/check-vulnerabilities.js` for performance.