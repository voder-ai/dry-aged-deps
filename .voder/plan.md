## NOW
In `test/cli.outdated.test.js`, add a `beforeAll` hook that runs `npm ci --prefer-frozen-lockfile` in the `test/fixtures` directory so that the fixture’s dependencies are installed before invoking the CLI.

## NEXT
- In `.github/workflows/ci.yml`, insert a step before **Run CLI tests** to install fixture dependencies:
  ```yaml
  - name: Prepare CLI fixture dependencies
    run: npm ci --prefer-frozen-lockfile
    working-directory: test/fixtures
  ```
- In `test/cli.outdated.test.js`, add an `afterAll` hook to clean up `test/fixtures/node_modules` to prevent workspace pollution.
- Add a new integration test (e.g., in `test/cli.upToDate.test.js`) using a fixture with all up-to-date dependencies and assert the “All dependencies are up to date.” message.

## LATER
- Refactor CLI integration tests to run the CLI logic in-process with a mocked `child_process.execFileSync`, eliminating real `npm` calls for faster, more deterministic tests.
- Configure Vitest `setupFiles` to load mocks globally for CLI tests.
- Introduce CI caching for the `test/fixtures/node_modules` folder to speed up repeated runs.
- Add end-to-end tests that simulate network failures and validate CLI error handling.