## NOW
Add unit tests to cover `fetchVersionTimes` error paths—write a new test (e.g. `test/fetch-version-times.error.test.js`) that asserts it throws on invalid package names and when the npm‐view JSON is malformed.

## NEXT
- Rename `eslint.config.cjs` to `.eslintrc.cjs` (or point `lint` at it) so ESLint picks up the project config and then fix any lint errors so `npm run lint` passes cleanly.
- Add Prettier configuration (`.prettierrc` & `.prettierignore`) and a `npm run format` script, then run it to normalize existing code.
- Write a unit test for the “no outdated packages” CLI path (e.g. `test/cli.up-to-date.test.js`), mocking `npm outdated --json` to return `{}` and asserting the tool prints “All dependencies are up to date.” with exit code 0.
- Verify that after these tests the coverage for `src/fetch-version-times.js` rises above 80%.

## LATER
- Introduce end-to-end fixture tests that spin up temporary projects with real `package.json` fixtures and verify the CLI’s live output.
- Add a coverage badge to `README.md` and integrate Coveralls or Codecov in CI.
- Set up Husky pre-commit hooks to run lint and tests automatically.
- Enable automated dependency updates (Dependabot/Renovate) and add SAST/CodeQL scanning in CI.