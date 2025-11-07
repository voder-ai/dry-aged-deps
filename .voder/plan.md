## NOW
Add a GitHub Actions workflow at `.github/workflows/ci.yml` that runs on `push`/`pull_request`, checks out the code, sets up Node.js, installs dependencies (`npm ci`), runs `npm test` and `npm run test:cli`, and performs a vulnerability scan with `npm audit --audit-level=moderate`.

## NEXT
- Modify all `execSync` invocations (in `src/fetch-version-times.js` and `bin/dry-aged-deps.js`) to validate `packageName` against a strict regex (e.g. `/^[a-z0-9@\-/_\.]+$/i`) and switch to `child_process.execFileSync` or `spawnSync` with argument arrays to eliminate shell‐injection risk.  
- Enhance the CI workflow to fail on any audit errors by upgrading the audit step to `npm audit --audit-level=high`.  
- Add a security-focused ESLint plugin (e.g. `eslint-plugin-security`) and include a lint step in the CI workflow.

## LATER
- Integrate a third‐party security scanner (e.g. Snyk or GitHub CodeQL) into CI.  
- Enable Dependabot or Renovate to auto-open PRs for dependency updates.  
- Document the sanitization rules and CI security checks in the README and developer guide.