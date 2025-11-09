# Implementation Plan# Implementation Plan## NOW

## NOWEdit `.github/workflows/ci-publish.yml` and change the lockfile drift step to only diff `package-lock.json`:

Implement Story 004.0-DEV-FILTER-VULNERABLE-VERSIONS: Filter Out Vulnerable Versions## NOW```yaml

Following Gall's Law, start with the simplest implementation that could work: - name: Check lockfile drift

1. **Create vulnerability checker module** (`src/check-vulnerabilities.js`):Commit the updated story specification for 004.0-DEV-FILTER-VULNERABLE-VERSIONS which now explicitly requires transitive dependency checking. run: |
   - Function to check a specific package@version for vulnerabilities

   - Use temporary directory with package.json containing the version to test npm install --package-lock-only

   - Run `npm audit --json` to get vulnerability data (checks full dependency tree)

   - Parse results and return vulnerability count or details**What changed:** git diff package-lock.json --exit-code

   - Clean up temporary directory after check

- Updated story 004.0 to explicitly require checking transitive dependencies for vulnerabilities```

2. **Update print-outdated.js to filter vulnerable packages**:
   - For each mature package (already filtered by 7-day rule)- Added REQ-TRANSITIVE-DEPS requirement

   - Call vulnerability checker for the latest mature version

   - If vulnerabilities found, skip that package in output- Enhanced acceptance criteria to specify "direct and transitive dependencies"## NEXT

   - Add optional column showing security status (or omit vulnerable packages entirely)

- Added real-world example (tar@7.5.1 vulnerability in @semantic-release/npm@13.1.1)1. Add a Husky pre-commit hook (`.husky/pre-commit`) that runs:

3. **Add tests for vulnerability filtering**:
   - Unit test for checkVulnerabilities function with mocked npm audit- Updated testing strategy to include transitive dependency test cases ```sh

   - Integration test showing package with vulnerable version is filtered out

   - Test case verifying clean packages still appear in output- Removed duplicate content that was accidentally merged into the story file #!/usr/bin/env sh

   - Use fixtures or mocks to avoid real npm audit calls in tests

npm install --package-lock-only

4. **Keep it simple first**:
   - Check ONLY the latest mature version (not backward search yet)**Files to commit:** git diff --exit-code package-lock.json

   - Simply omit packages with vulnerabilities from output

   - Don't add complex output formatting initially- `prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md` - Updated story specification ```

   - Get basic functionality working and tested

- `scripts/setup-traceability.sh` - New traceability setup script2. Create a scheduled GitHub Action (`.github/workflows/prune-branches.yml`) to automatically find and close branches inactive for over 30 days.

## NEXT

- `.voder/traceability/prompts-004.0-DEV-FILTER-VULNERABLE-VERSIONS.json` - New traceability file

After basic vulnerability filtering is working:

- `.voder/traceability/prompts-*.json` - Updated traceability files from assessment## LATER

1. **Enhance with backward search** (if time permits):
   - Implement smart checking: if latest mature has vulns, check previous versions- `.voder/implementation-progress.md` - Assessment report showing story 004.0 is not implemented- Add CI‐health and lockfile‐drift status badges to `README.md`.

   - Sort mature versions newest-first, find first safe one

   - Update output to show the safe version found (may not be latest)- `.voder/history.md` - Updated history with assessment findings- Integrate alerting (e.g., Slack or email) for successive CI failures.

2. **Improve output messaging**:- Document branch‐management best practices in `docs/developer-guidelines.md`.
   - Add clear indication when packages are filtered due to vulnerabilities **Rationale:**

   - Show "No safe mature version available" for filtered packages This clarification is critical because the original story didn't explicitly state that transitive dependencies must be checked, which could lead to incomplete implementation that misses vulnerabilities like the tar@7.5.1 issue in @semantic-release/npm.

   - Consider adding a summary line about how many packages were filtered

## NEXT

3. **Performance optimization**:
   - Consider caching vulnerability check resultsNo further work needed at this time. The story has been clarified with transitive dependency requirements. The next cycle should focus on implementing story 004.0 with the updated requirements.

   - Parallelize vulnerability checks if checking multiple versions

   - Add timeout/retry logic for npm audit calls## LATER

## LATERAfter story 004.0 is implemented:

Future enhancements after MVP is complete:- Validate remaining stories (003.0, 002.0, 001.0) in the next assessment cycle

- Consider implementing story 005.0 or other backlog items once all current stories are complete

- Make vulnerability severity threshold configurable (currently any vulnerability filters out)- Evaluate the @semantic-release/npm upgrade opportunity (12.0.2 → 13.1.1) once it no longer has transitive vulnerabilities

- Add --show-vulnerable flag to display filtered packages with security warnings
- Cache vulnerability check results to avoid repeated npm audit calls
- Add integration with npm registry API as alternative to npm audit
- Consider adding vulnerability details to output (CVE IDs, severity levels)
