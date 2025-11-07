## NOW
Update `.github/workflows/ci.yml` so that the “Install dependencies” step runs:  
```yaml
run: npm ci --prefer-frozen-lockfile --dry-run
```  

## NEXT
- Add `.voder/` to `.gitignore` and commit the change to remove internal AI artifacts from version control.  
- Configure **commitlint** (conventional config) with a Husky `commit-msg` hook to enforce scoped commit messages (`feat:`, `fix:`, `chore:`).  
- Set up **lint-staged** with a Husky `pre-commit` hook to run `npm run lint` and `npm test` on staged files.  

## LATER
- Integrate **semantic-release** (or **changesets**) in CI for automated version bumps and changelog generation on tag pushes.  
- Add a GitHub Actions workflow (`.github/workflows/publish.yml`) triggered on new tags to publish the package to npm.  
- Enable Dependabot or Renovate to automatically update the lockfile and raise PRs.