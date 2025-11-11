## NOW  
Write a new Vitest unit test (`test/xml-formatter.summary.test.js`) that passes a `summary` object containing a `minAge` property into `xmlFormatter` and asserts that the `<min-age>` element is emitted in the `<summary>` block—this will cover the currently untested `summary.minAge` branch in `src/xml-formatter.js` and push branch coverage above the 80% threshold.

## NEXT  
- Add a unit test for `src/check-vulnerabilities.js` that simulates `npm install` failing with a stderr containing `"WARN"` and verifies that the code treats it as non-fatal (i.e., does not reject), covering the peer-dependency warning path.  
- Update `CHANGELOG.md` to record the addition of JSON/XML output, the `--check` flag behavior, and the standardized exit codes in the v0.1.2 entry.  
- Commit the removal of `update-readme-check-mode.patch` and add `*.patch` to `.gitignore` so future patch files are never tracked.

## LATER  
- Implement full configuration-file support (`.dry-aged-deps.json`), including CLI parsing, schema validation, merging with flags, and tests (per story 010.0).  
- Install and configure Husky pre-commit hooks to run `npm run lint` and `npm test`.  
- Enhance the CI workflow to fail the build on lint errors, formatting violations, or coverage drops below configured thresholds.  
- Publish a JSON Schema file (`.dry-aged-deps.schema.json`) for the configuration file to aid editor autocomplete and validation.