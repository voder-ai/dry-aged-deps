## NOW  
Create a Vitest unit test file at `test/xml-formatter.no-thresholds.test.js` that calls `xmlFormatter({ rows: [], summary: { totalOutdated:0, safeUpdates:0, filteredByAge:0, filteredBySecurity:0 }, timestamp: '' })` without a `thresholds` argument and asserts that the output does **not** contain a `<thresholds>` element.

## NEXT  
- Update **README.md** and **docs/api.md** to remove or clearly mark as “coming soon” any references to the `--check` flag and configuration-file support until those features are implemented, ensuring documentation accuracy above 80%.  
- Add a Prettier “check” step (e.g. `prettier --check .`) to the CI workflow (in `.github/workflows/ci-publish.yml`) to enforce code formatting and prevent drift.

## LATER  
- Implement full `.dry-aged-deps.json` config-file support (CLI parsing, schema validation, merge precedence, tests).  
- Add true `--check` mode handling in `bin/dry-aged-deps.js` and `printOutdated` with integration tests and documentation per ADR 0004.  
- Install and configure Husky pre-commit hooks to run `npm run lint` and `npm test`.  
- Enhance CI to fail on lint errors, formatting violations, or coverage drops below thresholds.  
- Publish a JSON Schema file (`.dry-aged-deps.schema.json`) for the config file to enable editor validation.