## NOW
Add a new unit test `test/build-rows.fetchError.test.js` that stubs `fetchVersionTimes` to throw an error and verifies that `buildRows` returns a row with the package’s age set to `"N/A"` when a publish‐date lookup fails.

## NEXT
- Write unit tests for unexercised branches to raise branch coverage above 90%:
  1. **filterBySecurity**: cover the branch where `checkVulnerabilities` throws in JSON mode (no console errors) and in table mode (logs a warning and treats the package as safe).
  2. **xmlFormatter**: cover all threshold‐only combinations (prod only, dev only, missing fields) and missing‐details branches.
  3. **config-loader**: cover invalid‐JSON, unknown key, invalid ranges, and missing custom config file error paths.
  4. **printOutdated**: cover the early‐JSON branch when a local `package.json` exists and bypasses `npm outdated`.
- Run local quality checks:
    ```
    npm run lint
    npm run type-check
    npm test
    ```
  and verify branch coverage is ≥ 90% and all checks pass.

## LATER
- Refactor oversized modules (e.g. `print-outdated.js`, `xml-formatter.js`) into smaller functions so complexity and max‐lines rules can be re-enabled.
- Implement caching and parallel fetching in `fetch-version-times.js` to improve performance.
- Define a formal JSON Schema for the machine‐readable output, publish it under `schema/`, and add test-time validation against it.