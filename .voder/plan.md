## NOW
Generate and commit the project root package-lock.json file to version control to ensure reproducible installs.

## NEXT
- Add and commit `package-lock.json` files in **each** test fixture directory (`test/fixtures/` and `test/fixtures-up-to-date/`).
- Update the fixture setup in `test/cli.outdated.test.js` and `test/cli.upToDate.test.js` to install dependencies with `npm ci --prefer-frozen-lockfile` instead of `npm install`.
- Modify `.github/workflows/ci.yml` so that all dependency installs (root and fixtures) use `npm ci --prefer-frozen-lockfile` and fail immediately if the lockfile is out of sync.

## LATER
- Configure GitHub Actions cache for `~/.npm` and fixture `node_modules` to speed up CI builds.
- Add a CI validation step that runs `npm ci --prefer-frozen-lockfile` and checks for lockfile drift (e.g., fail if it would update the lockfile).
- Introduce a Husky pre-push hook to automatically verify lockfile consistency before any push.