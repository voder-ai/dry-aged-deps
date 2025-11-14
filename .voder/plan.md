## NOW  
Modify `bin/dry-aged-deps.js` so that in the default (non-`--check`) mode, if `summary.safeUpdates > 0`, the CLI calls `process.exit(1)` instead of `process.exit(0)`.

## NEXT  
- Update all CLI tests that assert exit codes for safe updates (e.g. `test/cli.outdated.test.js`, JSON/XML format tests) to expect exit code 1 in default mode when updates exist.  
- Revise documentation in `README.md`, `docs/decisions/0003-exit-code-standardization.md`, `docs/decisions/0004-check-mode-behavior.md`, and the API docs to reflect that default mode now exits with code 1 when safe updates are available.  
- Add a new integration test verifying that running `dry-aged-deps` without `--check` against a fixture with safe updates returns exit code 1.

## LATER  
- Audit and align the CLI help (`--help`) text and man pages to include the updated exit-code behavior.  
- Consider introducing a CLI flag (e.g. `--no-exit-on-updates`) for users who want the old 0-exit-code behavior as an option.  
- Monitor downstream CI scripts and provide migration notes or a deprecation period for users updating their pipelines.