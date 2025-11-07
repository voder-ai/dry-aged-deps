## NOW  
Add `@eslint/js` and `globals` to the `devDependencies` section of `package.json`.  

## NEXT  
- In `.github/workflows/ci.yml`, remove the `--dry-run` flag so the install step reads:  
  ```yaml
  run: npm ci --prefer-frozen-lockfile
  ```  
- Run `npm install` to update `package-lock.json` with the new devDependencies.  
- Commit the updated `package.json`, `package-lock.json`, and CI workflow, then verify that the CI pipeline’s lint step passes without missing‐plugin errors.  

## LATER  
- Configure commitlint (conventional config) with a Husky `commit-msg` hook to enforce `feat:`, `fix:`, `chore:`-style messages.  
- Set up lint-staged with a Husky `pre-commit` hook to run `npm run lint` and `npm test` on staged files.  
- Integrate semantic-release (or changesets) in CI for automated version bumps and changelog generation on tag pushes.  
- Add a GitHub Actions workflow (`.github/workflows/publish.yml`) to publish to npm when new tags are pushed.  
- Enable Dependabot or Renovate to automatically update the lockfile and open pull requests.