## NOW  
Patch **bin/dry-aged-deps.js** so that in check mode with `--format=json`, the CLI exits with code 0 when `summary.safeUpdates === 0` (instead of code 1).

## NEXT  
- Refactor the JSON error handling branch in **bin/dry-aged-deps.js** to emit the error object on stdout only (no stderr) and exit 2.  
- Run `npm test` and verify that all CLI JSON and exit-code tests now pass.  
- Stage and commit the fixes (`git add bin/dry-aged-deps.js && git commit -m "fix: correct JSON check-mode exit code and suppress stderr on errors"`) and push to `origin/main`.

## LATER  
- Break up **src/print-outdated.js** into smaller helper functions to satisfy ESLint complexity rules.  
- Enhance **src/json-formatter.js** to serialize full object-style rows (including `recommended`, `vulnerabilities`, `filtered`, `filterReason`, `dependencyType`) and update corresponding tests.  
- Add a published JSON schema (e.g. `schemas/outdated-packages.json`) and integrate schema validation into the CI pipeline.  
- Audit and bump outdated devDependencies, regenerate the lockfile, and run `npm audit` to maintain security.