## NOW  
Refactor src/print-outdated-handlers.js’s `handleJsonOutput` to build and pass object‐style package entries—including `name`, `type`, `current`, `wanted`, `latest`, `recommended`, `age`, `vulnerabilities` (count, maxSeverity, details), `filtered`, and `filterReason`—to `jsonFormatter`, replacing the existing array‐only rows.

## NEXT  
- Update src/json-formatter.js so it serializes these new object fields into the final JSON output schema.  
- Revise all JSON‐output tests (e.g. test/cli.format-json.test.js, test/printOutdated.json.test.js) to assert presence and correctness of the added fields.  
- Run local quality checks (npm run lint, npm run type-check, npm test) to confirm everything still passes.

## LATER  
- Define a formal JSON Schema (e.g. schema/outdated-packages.schema.json), reference it in README.md/docs/api.md, and add runtime or test-time validation against it.  
- Add CI E2E tests that parse JSON output and validate against the schema to catch regressions.  
- Extract shared XML/JSON formatting helpers into a common utility module to remove duplication and simplify future maintenance.