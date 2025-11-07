## NOW
Generate and commit the `package-lock.json` file to the repository (run `npm install` at the project root and add the resulting lockfile under version control).

## NEXT
- Update every CI job (build, test, E2E, audit) to install via `npm ci --prefer-frozen-lockfile`, ensuring the lockfile is respected.  
- Enhance `.github/dependabot.yml` to watch both dependencies and devDependencies, adjust the update schedule/PR limits as needed, and enable security-only and version-bump PRs.  
- Add a CI “lockfile drift” step that runs `npm ci --package-lock-only` after checkout and fails if the lockfile changes.

## LATER
- Evaluate migrating to Renovate for more granular grouping, auto-merge, and schedule control of dependency bumps.  
- Configure auto-merge for non-breaking (patch/minor) dependency PRs once CI passes.  
- Integrate deeper SCA tooling (e.g., Snyk or GitHub’s Advisory Database) for automated vulnerability remediation.