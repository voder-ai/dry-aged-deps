## NOW
Update the `beforeAll` hook in `test/cli.e2e.real-fixture.test.js` to remove `test/fixtures/node_modules` and `test/fixtures/package-lock.json` before running `npm ci`.

## NEXT
- Add a cleanup step to `.github/workflows/ci.yml` (before the fixture install steps) that deletes both `test/fixtures/node_modules` & `test/fixtures-up-to-date/node_modules` and their `package-lock.json` files.
- Rerun the CI pipeline to verify the E2E fixture tests now pass reliably on a clean install.
- Adjust fixture setup timeouts or flags if necessary to stabilize the test.

## LATER
- Extract fixture cleanup logic into a reusable script (e.g. `scripts/clean-fixtures.js`) and invoke it in tests and CI.
- Refactor CLI tests to copy fixtures into temporary directories for full isolation.
- Introduce caching for fixture dependencies in CI to speed up installs without sacrificing a clean environment.