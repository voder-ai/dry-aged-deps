## NOW  
Modify `bin/dry-aged-deps.js` so that after `await printOutdated(data, options)` it captures the returned `summary` and then calls  
```js
process.exit(summary.safeUpdates > 0 ? 1 : 0);
```  
instead of unconditionally exiting 0 (continue using exit code 2 for errors).

## NEXT  
- Update the CLI help text and README to document the new exit codes:  
  • 0 = no safe updates  
  • 1 = safe updates available  
  • 2 = error occurred  
- Add Vitest integration tests covering all exit‐code scenarios in normal mode:  
  • No outdated packages → exit 0  
  • Outdated but none safe → exit 0  
  • Safe updates available → exit 1  
  • npm outdated failure or invalid flags/config → exit 2  

## LATER  
- Extend tests to verify exit codes under `--format=json` and `--format=xml`.  
- Add a CI workflow step that fails the build on exit code 1 (safe updates).  
- Document exit‐code semantics and examples in `docs/api.md` and expand CI/CD examples in the README.