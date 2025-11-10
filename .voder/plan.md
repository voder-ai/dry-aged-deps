# Implementation Plan: Story 007.0-DEV-SEPARATE-PROD-DEV-THRESHOLDS## NOW

Create a new unit test `test/xml-formatter.error.test.js` that calls `xmlFormatter({ error: new Error('Test failure'), code: 'E_TEST', details: 'detail text', timestamp: '2025-01-01T00:00:00Z' })` and asserts the output contains a well-formed `<error>` block with `<message>`, `<code>`, `<details>`, and the closing `</outdated-packages>` tag.

Following Gall's Law: "A complex system that works is invariably found to have evolved from a simple system that worked."

## NEXT

## NOW- Add unit tests for the XML formatter’s thresholds section (prod/dev min-age and min-severity tags).

- Write tests for object-style `<package>` entries in `xmlFormatter`, covering vulnerability `<details>` and correct escaping of special characters.

**Implement separate prod/dev threshold flags in CLI with fallback behavior**- Expand `printOutdated` tests to cover the XML branch with empty rows and verify exit codes when safe updates exist or on error.

- Add integration tests in `test/cli.format-xml.test.js` to simulate an error in mock mode and confirm the CLI emits the XML error block and exits with code 2.

Story 007 requires adding separate thresholds for production and development dependencies. The current implementation already has `--min-age` and `--severity` flags working correctly. We need to:

## LATER

1. **Add four new CLI flags** to `bin/dry-aged-deps.js`:- Introduce coverage thresholds in CI to fail if overall coverage falls below 80%.
   - `--prod-min-age=<days>` (falls back to `--min-age` if not specified)- Review and add missing tests for JSON formatter edge cases and table output branches.

   - `--dev-min-age=<days>` (falls back to `--min-age` if not specified)- Update `README.md` and docs to document the XML error format and new CLI exit-code semantics.

   - `--prod-severity=<level>` (falls back to `--severity` if not specified)- Continue filling coverage gaps for `printOutdated` logic (maturity filtering, vulnerability filtering, “all up to date” messages).
   - `--dev-severity=<level>` (falls back to `--severity` if not specified)

   Implementation approach:
   - Parse the four new flags using the same pattern as existing flags
   - Apply fallback logic: if `--prod-min-age` not specified, use `--min-age` value
   - Apply fallback logic: if `--dev-min-age` not specified, use `--min-age` value
   - Same fallback for severity flags
   - This ensures backward compatibility (existing behavior preserved)

2. **Update help text** in `bin/dry-aged-deps.js`:
   - Add all four new flags to the help output
   - Document the fallback behavior

3. **Pass separate thresholds** to `printOutdated`:
   - Instead of passing `minAge` and `minSeverity`, pass:
     - `prodMinAge`, `devMinAge`, `prodMinSeverity`, `devMinSeverity`
   - Update the function signature and implementation in `src/print-outdated.js`

4. **Update `printOutdated` function** in `src/print-outdated.js`:
   - Accept the four separate threshold parameters
   - Use appropriate threshold based on dependency type (already have `type` field from npm outdated)
   - Update the thresholds object in JSON/XML output to show prod and dev separately
   - Maintain backward compatibility when thresholds are the same

5. **Add "Type" column** to table output in `src/print-outdated.js`:
   - Add a new column showing "prod" or "dev" for each package
   - Update table formatting logic

6. **Write tests** for the new functionality:
   - Test CLI flag parsing for all four new flags
   - Test fallback behavior (prod/dev flags not specified → use general flags)
   - Test that prod and dev dependencies use correct thresholds
   - Test table output includes Type column
   - Test JSON/XML output includes separate prod/dev thresholds

7. **Update documentation**:
   - Add examples to README.md showing the new flags
   - Document the fallback behavior

## NEXT

None - all work is in the NOW section as this is a single coherent feature.

## LATER

None - this plan only covers Story 007 implementation.
