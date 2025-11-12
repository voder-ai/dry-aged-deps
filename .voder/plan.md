## NOW
Run `git push origin main` to publish the three pending local commits to the remote repository and synchronize history.

## NEXT
- Re-run the GitHub Actions CI workflow on the updated `main` branch and review any failing steps in the “Build & Test” and “Release” jobs.
- Locally reproduce any CI failures by running:
  1. `npm ci --prefer-frozen-lockfile`
  2. `npm run lint`
  3. `prettier --check .`
  4. `npm test`
  Fix any formatting, linting, or test errors uncovered, commit the changes, and push again.
- Update `.github/workflows/ci-publish.yml` (and related scripts) to correct broken steps (e.g., lockfile‐drift check, peer‐dependency installs, commitlint invocation) so that the CI pipeline passes reliably.

## LATER
- Write targeted Vitest unit tests to cover under-tested branches in `src/print-outdated.js` and `src/xml-formatter.js` to raise branch coverage above 90%.
- Implement support for `.dry-aged-deps.json` configuration files, merge with CLI flags (precedence CLI > config > defaults), and add corresponding tests and documentation.
- Complete `--check` mode enforcement logic with exit-code behavior, add end-to-end tests, and update README, API docs, and CHANGELOG.