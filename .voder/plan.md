## NOW  
Create a new Vitest test file at `test/cli.outdated.mock.test.js` that imports `test/helpers/cli.outdated.mock.js`, invokes `node ./bin/dry-aged-deps.js` with no flags via Execa, and asserts `stdout` contains “Outdated packages:” and a single row for `fakepkg` with its mocked current, wanted, and latest values.  

## NEXT  
- Run `npm test` and update `src/print-outdated.js` or `bin/dry-aged-deps.js` so the CLI correctly parses the stubbed `npm outdated` and `npm view … time` outputs and prints the expected table row.  
- Ensure the new mock-based CLI test and existing real-fixture table-mode tests (`test/cli.outdated.test.js`, `test/cli.upToDate.test.js`) pass without network or install calls.  

## LATER  
- Refactor `print-outdated` to support dependency injection or a “test mode” flag to cleanly bypass real network calls in tests.  
- Implement structured JSON/XML error handling and proper exit codes for core CLI before re-enabling full fetch/audit logic under machine-readable modes.  
- Optimize auditing performance (caching/parallelism) and expand tests to cover maturity and vulnerability filtering across formats.