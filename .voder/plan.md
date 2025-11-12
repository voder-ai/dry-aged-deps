## NOW  
Refactor the `if (format === 'json')` branch in **src/print-outdated.js** to drive the full pipeline (fetchVersionTimes → calculateAgeInDays → filterByAge → filterBySecurity) and emit enriched JSON via `jsonFormatter`, including all fields required by prompts/008.0-DEV-JSON-OUTPUT.md (recommended version, vulnerabilities, filtered flags, filter reasons, dependency type).

## NEXT  
- Enhance **src/json-formatter.js** to accept and serialize object-style rows with properties:  
  - `name`, `current`, `wanted`, `latest`, `recommended`, `age`,  
  - `vulnerabilities` (with `count`, `maxSeverity`, `details`),  
  - `filtered`, `filterReason`, `dependencyType`  
  and include summary thresholds exactly as in the spec.  
- Update **bin/dry-aged-deps.js** to catch errors when `--format=json` and print a JSON error object (`{ error: { message, code, details }, timestamp }`) before exiting with code 2.  
- Add Vitest unit tests for:  
  - JSON error output format  
  - Full JSON output content (vulnerability details, filter reasons, dependency types)  
  extending or creating test files under `test/cli.format-json.*` and `test/json-formatter.*`.  
- Revise the **README.md** JSON examples under “Output Formats” to reflect the complete schema.

## LATER  
- Publish a formal JSON schema file (e.g. `schemas/outdated-packages.json`) and integrate schema validation in CI.  
- Add end-to-end tests that run `dry-aged-deps --format=json` against real fixtures and validate output against the schema.  
- Version the JSON schema in documentation (`docs/api.md`) and plan a migration path for future schema changes.