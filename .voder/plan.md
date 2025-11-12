## NOW  
Refactor `test/cli.error-cmd.test.js` to create its fake-npm executable inside an OS temporary directory (using `fs.mkdtemp`) instead of under `test/`, ensuring tests do not write into the repository.

## NEXT  
- Add a CI post-test step (`git diff --exit-code`) to fail the build if any repository files were modified during tests.  
- Identify under-tested branches in `src/print-outdated.js` and `src/xml-formatter.js`, then write targeted Vitest unit tests to push branch coverage above 90%.

## LATER  
- Implement support for `.dry-aged-deps.json` configuration files and add corresponding tests and documentation.  
- Complete and test real-npm-outdated behavior for `--check` mode, then update docs and add E2E coverage.  
- Introduce caching or performance benchmarks for `fetchVersionTimes` to optimize CLI responsiveness.