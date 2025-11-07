## NOW
Add a new end-to-end Vitest integration test in `test/cli.e2e.real-fixture.test.js` that runs `npm ci` in `test/fixtures`, invokes the CLI with Execa, and asserts that at least one “Age (days)” cell contains a positive integer.

## NEXT
- Update the CI workflow (`.github/workflows/ci.yml`) to run the new E2E test alongside existing CLI tests.  
- Refine `printOutdated` output formatting to align and validate numeric age values (e.g. ensure “Age (days)” is always a number or “N/A”).  
- Improve `bin/dry-aged-deps.js` error handling to catch and display user-friendly messages when `npm view` fails (e.g. “Unable to fetch publish times for <pkg>”).

## LATER
- Introduce a `--cwd <path>` CLI flag to target a custom project directory, with corresponding tests.  
- Refactor `fetchVersionTimes` to an async implementation with configurable timeouts, retries, and concurrency limits.  
- Add a `--profile` flag using Node’s `perf_hooks` and enforce a CI performance benchmark job.