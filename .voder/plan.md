## NOW
In `package.json`, pin the version of `@eslint/eslintrc` by replacing its wildcard `"*"` with the exact version recorded in `package-lock.json`.

## NEXT
- Remove the unused `semver` dependency (or integrate it into the code).  
- Pin any other open-ended version specifiers in `package.json` to exact versions, run `npm install`, and commit the updated `package.json` and `package-lock.json`.

## LATER
- Add a CI step to enforce lockfile consistency using `npm ci --prefer-frozen-lockfile --dry-run`.  
- Enable automated lockfile updates with Dependabot or Renovate.  
- Integrate semantic-release (or changesets) for automated version bumps and changelog generation on tag pushes.  
- Investigate caching of frequent `npm view` calls in CI to speed up CLI tests.