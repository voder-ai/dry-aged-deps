# Implementation Plan# Implementation Plan## NOW

## NOWDownload and inspect the **Build & Test** logs for the latest failing CI run on `main` (from the `ci-publish.yml` workflow) to identify the exact error or timeout causing instability.

Fix the package integrity and security issues by updating package.json to reflect the currently installed (and secure) version of @semantic-release/npm.## NOW

**Action**: Update @semantic-release/npm dependency in package.json from ^13.1.1 to ^12.0.2## NEXT

**Rationale**: **Fix code formatting violations in test files**- Implement a targeted fix based on the log diagnosis:

- Version 12.0.2 is currently installed and is NOT affected by the security vulnerabilities

- Version 13.1.1 (specified in package.json) introduces 3 moderate severity CVEs via transitive tar dependency (GHSA-29xp-372q-xqph)- If the real-fixture E2E test is timing out, increase just that test’s timeout in `test/cli.e2e.real-fixture.test.js` (e.g. change `it(..., 30000)` to `60000`).

- This resolves the "invalid" package state reported by npm ls

- Aligns package.json with the working, secure installed versionRun Prettier to format the 2 test files that are blocking the code quality gates: - If a specific network error is surfacing in `fetch-version-times`, catch that error type (e.g. `ETIMEDOUT`) and add one extra retry.

**Expected Outcome**:- `test/cli.e2e.real-fixture.test.js` - If a dependency is missing in the fixture project, update the fixture’s `package.json` or adjust the install command in the workflow.

- npm ls @semantic-release/npm shows no "invalid" warnings

- npm audit shows 0 vulnerabilities- `test/fetch-version-times.retry.test.js`- Commit the fix and re-run the CI workflow to verify the instability is resolved.

- package-lock.json will update to lock version 12.0.2

Execute `npm run format` to apply Prettier formatting to all files, which will fix these formatting violations and ensure consistency across the codebase.## LATER

## NEXT

- Add a private npm cache or lightweight registry (Verdaccio) in CI for deterministic `npm outdated`/`npm view` responses.

Fix code formatting violations in test files to comply with Prettier configuration.

After formatting, verify the fix with `npx prettier --check .` to confirm no formatting issues remain (excluding `.voder/` directory which is not subject to quality gates).- Introduce CI telemetry and alerts for test duration and failure-rate monitoring.

**Actions**:

1. Run `npm run format` to auto-fix formatting issues- Review and parallelize slow or brittle tests to keep the pipeline fast and stable.

2. Verify formatting with `npx prettier --check .`

## NEXT

**Files to fix**:

- test/cli.e2e.real-fixture.test.jsNone - this is the only blocking issue preventing progression. Once formatting is fixed, the code will be ready for commit.

- test/fetch-version-times.retry.test.js

## LATER

**Expected Outcome**:

- Prettier --check passes with 0 warningsNone - no additional implementation work identified at this time.

- Code quality gates pass
- All tests continue to pass

## LATER

Monitor dependency maturity timeline and upgrade when packages reach 7-day maturity threshold.

**Maturity Timeline**:

- **2025-11-14** (5 days): vitest@4.0.8, @vitest/coverage-v8@4.0.8, semantic-release@25.0.2 become eligible
- **2025-11-15** (6 days): @semantic-release/github@12.0.2 becomes eligible

**Consider**:

- Upgrade semantic-release to 25.0.1 (already mature, 21 days old) if there are compelling features or fixes
- Review changelogs for vitest and coverage-v8 when they mature to assess upgrade value
- Continue monitoring @semantic-release/npm for future security-clean major version releases

**Low Priority Enhancements** (after all quality gates pass):

- Increase branch coverage to 100% by adding tests for remaining uncovered paths
- Refactor shared JSON parsing/error handling logic into a utility module to reduce duplication
- Add integration tests for real-world projects beyond fixtures
- Improve CLI output formatting (e.g., table alignment or JSON output option)
