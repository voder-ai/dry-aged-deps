## NOW  
Implement the auto-update write-back in the `updateMode` block of `src/print-outdated.js`: after creating the backup, read and parse `package.json`, update each package in `safeRows` under `dependencies` or `devDependencies` to its `wanted` version, then write the file back with 2-space indentation, replacing the existing preview/“TODO” placeholder.

## NEXT  
- Add unit tests for the `--update` and `--yes` flows: verify backup creation, package.json modifications, confirmation prompt behavior, and error handling.  
- Extend `bin/dry-aged-deps.js` help text and `README.md` to document `--update` and `--yes` flags, including examples.  
- In `src/print-outdated.js`, print a summary report after applying updates and remind users to run `npm install`.

## LATER  
- Create end-to-end tests that run `dry-aged-deps --update --yes` against a real fixture, verify package.json was updated and backup exists, and then restore state.  
- Add an ADR in `docs/decisions/` to capture the architectural decision for auto-update behavior.  
- Optionally support updating `package-lock.json` and/or running `npm install` automatically behind a new flag.