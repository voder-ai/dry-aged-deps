## NOW  
Modify the Husky pre-push hook (`.husky/pre-push`) to run the full local quality pipeline instead of just tests. Replace its contents with a single command sequence that invokes all project scripts for linting, type-checking, formatting-check, tests, lockfile drift, duplication check, and audit.  

## NEXT  
- Ensure all required commands exist in `package.json` scripts: verify or add entries for `lint`, `type-check`, `format:check`, `test`, `lockfile` (e.g. `npm install --package-lock-only --legacy-peer-deps`), `jscpd --threshold 20 src`, and `npm audit --audit-level=moderate`.  
- Update `docs/developer-guidelines.md` to describe the new pre-push hook commands and list the exact script names that will run before every push.  
- Test the updated hook locally by attempting a push with an intentional lint or test failure to confirm it blocks.  

## LATER  
- Consolidate the full check sequence into a single npm script (e.g. `"prepush"`) in `package.json` and simplify `.husky/pre-push` to call that one script.  
- Add a CI validation step that verifies the pre-push hook itself (for example, invoke `git push --dry-run` against a disposable branch) to guard against hook drift.  
- Periodically review and tighten hook command thresholds (e.g. lower `jscpd` threshold, raise audit level) as project quality needs evolve.