# Implementation Plan# Implementation Plan# Implementation Plan## NOW

## NOW## NOWDownload and inspect the **Build & Test** logs for the latest failing CI run on `main` (from the `ci-publish.yml` workflow) to identify the exact error or timeout causing instability.

**Implement 7-Day Maturity Filtering in `src/print-outdated.js` (Story 003.0-DEV-FILTER-MATURE-VERSIONS)**Fix the package integrity and security issues by updating package.json to reflect the currently installed (and secure) version of @semantic-release/npm.## NOW

Following Gall's Law, implement the simplest possible solution that filters packages based on the 7-day maturity rule:**Action**: Update @semantic-release/npm dependency in package.json from ^13.1.1 to ^12.0.2## NEXT

### Implementation Steps:**Rationale**: **Fix code formatting violations in test files**- Implement a targeted fix based on the log diagnosis:

1. **Modify `printOutdated()` function** to add filtering logic:- Version 12.0.2 is currently installed and is NOT affected by the security vulnerabilities
   - After fetching version times for each package, check if the latest version age >= 7 days

   - Only include packages in the output if they meet the maturity threshold- Version 13.1.1 (specified in package.json) introduces 3 moderate severity CVEs via transitive tar dependency (GHSA-29xp-372q-xqph)- If the real-fixture E2E test is timing out, increase just that test’s timeout in `test/cli.e2e.real-fixture.test.js` (e.g. change `it(..., 30000)` to `60000`).

   - Handle the case where no mature versions are available (show message or skip)

- This resolves the "invalid" package state reported by npm ls

2. **Update output format**:
   - Keep the existing npm outdated style table format- Aligns package.json with the working, secure installed versionRun Prettier to format the 2 test files that are blocking the code quality gates: - If a specific network error is surfacing in `fetch-version-times`, catch that error type (e.g. `ETIMEDOUT`) and add one extra retry.

   - Only show packages that have mature versions (>= 7 days old)

   - For packages with no mature versions, either skip them or indicate "(latest too fresh - X days old)"**Expected Outcome**:- `test/cli.e2e.real-fixture.test.js` - If a dependency is missing in the fixture project, update the fixture’s `package.json` or adjust the install command in the workflow.

3. **Create/update tests**:- npm ls @semantic-release/npm shows no "invalid" warnings
   - Add test case for filtering packages < 7 days old

   - Add test case for showing only packages >= 7 days old- npm audit shows 0 vulnerabilities- `test/fetch-version-times.retry.test.js`- Commit the fix and re-run the CI workflow to verify the instability is resolved.

   - Add test case for handling all packages being too fresh

   - Update existing tests to work with the new filtering behavior- package-lock.json will update to lock version 12.0.2

4. **Verify acceptance criteria**:Execute `npm run format` to apply Prettier formatting to all files, which will fix these formatting violations and ensure consistency across the codebase.## LATER
   - ✓ Filters out versions < 7 days old

   - ✓ Shows only packages with mature versions available## NEXT

   - ✓ Clearly indicates when no mature versions exist

   - ✓ Updated output maintains npm outdated style- Add a private npm cache or lightweight registry (Verdaccio) in CI for deterministic `npm outdated`/`npm view` responses.

   - ✓ Doesn't show package if mature version <= current version

Fix code formatting violations in test files to comply with Prettier configuration.

**Simple Implementation Approach:**

- Add a single `if (age >= 7)` condition in the `printOutdated` functionAfter formatting, verify the fix with `npx prettier --check .` to confirm no formatting issues remain (excluding `.voder/` directory which is not subject to quality gates).- Introduce CI telemetry and alerts for test duration and failure-rate monitoring.

- Filter the rows array before displaying

- Start with basic filtering, can optimize with smart filtering (latest first, backwards) in future iterations**Actions**:

## NEXT1. Run `npm run format` to auto-fix formatting issues- Review and parallelize slow or brittle tests to keep the pipeline fast and stable.

1. **Run full test suite** to ensure all tests pass with the new filtering logic2. Verify formatting with `npx prettier --check .`

2. **Test CLI manually** with real fixtures:## NEXT
   - Run on test/fixtures (has outdated packages)

   - Run on test/fixtures-up-to-date (all up to date)**Files to fix**:

   - Verify output shows only mature packages

- test/cli.e2e.real-fixture.test.jsNone - this is the only blocking issue preventing progression. Once formatting is fixed, the code will be ready for commit.

3. **Update documentation** if needed:
   - Ensure README explains the 7-day rule- test/fetch-version-times.retry.test.js

   - Update API docs if function signature changes

## LATER

4. **Run linting and formatting**:
   - `npm run lint`**Expected Outcome**:

   - `npm run format`

- Prettier --check passes with 0 warningsNone - no additional implementation work identified at this time.

5. **Commit changes** with conventional commit message:
   - `feat: implement 7-day maturity filtering for outdated packages`- Code quality gates pass

   - Reference story 003.0 in commit message- All tests continue to pass

## LATER## LATER

**After Story 003.0 is complete and all tests pass:**Monitor dependency maturity timeline and upgrade when packages reach 7-day maturity threshold.

1. **Validate remaining stories** (001.0 and 002.0) for completeness**Maturity Timeline**:

2. **Consider optimizations** to the filtering logic:- **2025-11-14** (5 days): vitest@4.0.8, @vitest/coverage-v8@4.0.8, semantic-release@25.0.2 become eligible
   - Smart filtering: check latest version first, work backwards to find newest mature version- **2025-11-15** (6 days): @semantic-release/github@12.0.2 becomes eligible

   - Performance optimization for packages with many versions

   - Configurable maturity threshold (future enhancement)**Consider**:

3. **Begin work on Story 004.0** (Filter Vulnerable Versions) once current stories are validated complete:- Upgrade semantic-release to 25.0.1 (already mature, 21 days old) if there are compelling features or fixes
   - Integrate security vulnerability checking- Review changelogs for vitest and coverage-v8 when they mature to assess upgrade value

   - Filter out mature versions that have known vulnerabilities- Continue monitoring @semantic-release/npm for future security-clean major version releases

   - Complete the safe updater feature

**Low Priority Enhancements** (after all quality gates pass):

4. **Enhance user experience**:
   - Add color coding for age (green for very mature, yellow for borderline)- Increase branch coverage to 100% by adding tests for remaining uncovered paths

   - JSON output format for CI/CD integration- Refactor shared JSON parsing/error handling logic into a utility module to reduce duplication

   - Progress indicators for large dependency trees- Add integration tests for real-world projects beyond fixtures

- Improve CLI output formatting (e.g., table alignment or JSON output option)
