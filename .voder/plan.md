## NOW  
Add parsing for the `--update` and `--yes` flags in `bin/dry-aged-deps.js`, setting `updateMode` and `skipConfirmation` variables for the CLI.

## NEXT  
- Extend the CLI to pass `updateMode` and `skipConfirmation` into `printOutdated` (or a new update handler).  
- Scaffold a “preview” step that computes the safe updates and shows the diff against `package.json` without writing.  
- Implement a non-interactive confirmation prompt (skipped when `--yes` is present).  
- Create a backup of `package.json` (e.g. `package.json.backup`) before applying any changes.

## LATER  
- Write the updated versions into `package.json`, preserving formatting and key order.  
- Display a post-update summary and remind the user to run `npm install`.  
- Add unit and integration tests for the `--update`/`--yes` flows, including backup and error handling.  
- Update README, API docs, and CLI help text to document the `--update` and `--yes` flags.