## NOW
Create a new integration test file `test/cli.outdated.test.js` that mocks `child_process.execFileSync` for both `npm outdated --json` and `npm view … time --json`, then runs the CLI with `runCli` and asserts that the output includes the table header and a data row for a fake outdated package (name, current, wanted, latest, age).

## NEXT
- Update the `test` script in `package.json` to `"vitest --coverage"` and configure coverage reporters and thresholds in `vitest.config.js`.
- Write unit tests for `printOutdated` edge cases in a new file `test/printOutdated.test.js` (no outdated packages, JSON parse errors, `fetchVersionTimes` failures).
- Add minimum coverage thresholds in `vitest.config.js` so CI fails if overall coverage drops below (e.g.) 80%.

## LATER
- Introduce end-to-end fixture-based tests that spin up a temporary `package.json` with real outdated dependencies and verify the CLI’s live output.
- Add a coverage badge to `README.md` and publish coverage reports (e.g. Coveralls or Codecov) in CI.
- Configure the CI pipeline to enforce coverage thresholds and surface coverage reports on pull requests.