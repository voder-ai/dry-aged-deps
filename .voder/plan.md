## NOW  
Run `npm audit --json` to enumerate all high-severity vulnerabilities in development dependencies.

## NEXT  
- Review the audit JSON and for each high-severity devDependency, upgrade to the patched version (e.g. `npm install <pkg>@<version>`) or, if no patch exists, document a security incident in `docs/security-incidents/`.  
- Open `test/filter-by-security.object.test.js` and `test/filter-by-security.fetchError-fallback.test.js` and add the required JSDoc `@story` and `@req` annotations at the top of each file to restore full traceability.  
- Run the full quality pipeline (`npm test`, `npm run lint`, `npm run type-check`, `npm run format:check`) to verify there are no new errors.

## LATER  
- Integrate `npm audit --json` as a gating step in the pre-push hook and CI to automatically fail on new high-severity issues.  
- Schedule regular `dry-aged-deps` audits (e.g. via a GitHub Actions cron job) and automatically open PRs for safe upgrades.  
- Review long-term strategy for replacing or removing frequently vulnerable devDependencies with more secure alternatives.