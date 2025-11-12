## NOW  
Modify the CLI entrypoint (`bin/dry-aged-deps.js`) to detect and store the `--check` flag—e.g. immediately after parsing `args`, add  
```js
const checkMode = args.includes('--check');
```  

## NEXT  
- Pass `checkMode` through to the invocation of `printOutdated`, capture its returned summary object (for table mode you’ll need to update `printOutdated` to always return a summary).  
- After `await printOutdated(...)`, implement the check‐mode exit logic in the CLI:  
  - If `checkMode` and `summary.safeUpdates > 0`, call `process.exit(1)`.  
  - If `checkMode` and `summary.safeUpdates === 0`, call `process.exit(0)`.  
  - Leave existing exit codes (0/2) for non-check and error conditions.  
- Add a new test suite (e.g. `test/cli.check-mode.test.js`) covering:  
  - No updates → exit 0  
  - Safe updates available → exit 1  
  - Errors (invalid JSON, invalid flags, config errors) → exit 2  
  - Verify behavior in table, JSON, and XML modes.  

## LATER  
- Update README.md, docs/api.md, and ADRs to remove “coming soon” and add `--check` usage examples and exit-code semantics.  
- Enhance CI examples in docs to show `--check` enforcement in GitHub Actions (and other pipelines).  
- Refactor `printOutdated` to always return its summary in all formats so future features (auto‐update, config file support) can reuse it.