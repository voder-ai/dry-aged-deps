## NOW
Refactor the CLI entrypoint (`bin/dry-aged-deps.js`) to normalize exit codes: explicitly call `process.exit(0)` after successful execution (including when outdated packages are found) and ensure only fatal errors invoke `process.exit(1)`.

## NEXT
- Add integration tests to verify exit codes for all scenarios: `--help`, up-to-date, outdated results, and real errors.
- Improve error handling in `bin/dry-aged-deps.js` by catching and reporting JSON-parse failures from both `npm outdated` and `npm view` with clear, user-friendly messages.
- Document the CLI’s exit-code contract in `README.md` under a new “Exit Codes” section.

## LATER
- Introduce a `--profile` flag that uses Node’s `perf_hooks` to measure and optionally print execution times for each major step.
- Refactor `fetchVersionTimes` to use asynchronous, parallelized calls with configurable concurrency, timeouts, and retry logic for network resilience.
- Add a CI check that captures and enforces performance benchmarks (e.g., maximum allowed runtime) for the CLI on a typical project.