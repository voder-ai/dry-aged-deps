## NOW
Add the required JSDoc `@story` and `@req` annotations to the top of test/printOutdated.updateBackupError.test.js.

## NEXT
- Add the same JSDoc `@story` and `@req` annotations to test/printOutdated.updatePromptAbort.test.js.  
- Check for mature patched releases of `@semantic-release/npm` and `semantic-release`; if none are available, create security‐incident markdown files in docs/security-incidents/ and add their advisory IDs to the audit filter (.nsprc or audit‐ci.json).  
- Remove the `.voder/` entry from .gitignore so assessment history is tracked, then commit the now-tracked `.voder/` files.  
- Add `#!/usr/bin/env sh` as the shebang at the top of .husky/pre-push and ensure it’s executable.

## LATER
- Integrate `npm audit --json` as a gating step in the pre-push hook and CI to automatically fail on new high-severity issues.  
- Schedule regular `dry-aged-deps` audits via a GitHub Actions cron job and auto-open PRs for safe upgrades.  
- Review and replace any repeatedly vulnerable devDependencies with more secure alternatives.  
- Periodically tighten ESLint thresholds and extend test traceability validation.