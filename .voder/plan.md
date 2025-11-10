## NOW
Create a new module `src/json-formatter.js` that exports a `jsonFormatter` function to serialize the packages data, summary, and timestamp into a single JSON string matching the story-008 schema.

## NEXT
- In `src/print-outdated.js`, add a `format === 'json'` branch that calls `jsonFormatter` and `console.log(...)` the JSON output.  
- Write unit tests in `test/json-formatter.test.js` to verify valid JSON, full data, and summary fields.  
- Add a CLI integration test `test/cli.format-json.test.js` using Execa to run `dry-aged-deps --format=json` and assert valid, parseable JSON and correct exit code.  
- Update `bin/dry-aged-deps.js` help text and `README.md` to document `--format=json` usage and show an example JSON output.

## LATER
- Implement proper exit codes for JSON mode (0 = no updates, 1 = safe updates available, 2 = error).  
- Suppress any non-JSON console output when `--format=json` is used.  
- Add JSON-formatted error output (with `error` and `timestamp` fields).  
- Extend the JSON schema to include vulnerability counts/detail and configuration thresholds.