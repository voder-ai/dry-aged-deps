## NOW
Create a new module `src/fetch-version-times.js` that exports a function `fetchVersionTimes(packageName)` which uses `child_process.execSync('npm view <packageName> time --json')` to retrieve and parse a map of version→publish-date.

## NEXT
- Add a module `src/age-calculator.js` with `calculateAgeInDays(publishDate)` that computes days since publication.
- In `bin/dry-aged-deps.js`, for each outdated package invoke `fetchVersionTimes`, filter to versions newer than `current`, compute their ages via `calculateAgeInDays`, and include an “Age” column in the printed table.
- Write unit tests for `fetchVersionTimes` (mocking `child_process.execSync`) and `calculateAgeInDays` in the `test/` directory.

## LATER
- Format age into human-readable strings (e.g. “3 days ago”, “2 months ago”) with color-coded freshness indicators.
- Implement the 7-day maturity filter to skip versions younger than the threshold and clearly indicate skipped packages.
- Add a CLI option (e.g. `--min-age`) to configure the minimum age threshold.
- Update README with examples showing the new “Age” column and flag usage.
- Expand integration tests to cover end-to-end scenarios with mocked npm view data.