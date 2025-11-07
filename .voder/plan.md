## NOW
Create a new GitHub Actions workflow for CodeQL analysis by adding a file at `.github/workflows/codeql-analysis.yml` that uses `github/codeql-action/init@v2` and `github/codeql-action/analyze@v2` to run SAST and secret-scanning on every push to `main` and on pull requests.

## NEXT
- Enable and configure `eslint-plugin-security` in `eslint.config.cjs` (add the plugin and its recommended rules) and fix any lint errors so that `npm run lint` passes with security rules enforced.  
- Add a Dependabot configuration file at `.github/dependabot.yml` to automate weekly npm dependency updates and keep the dependency graph up to date.

## LATER
- Add an npm audit CI job that runs `npm audit --audit-level=moderate` and fails the build on any vulnerabilities above “low.”  
- Introduce a Husky pre-commit hook to run lint, tests, and `npm audit` before commits.  
- Extend the CLI to flag known-vulnerable package versions in its output (as per Story 004.0).