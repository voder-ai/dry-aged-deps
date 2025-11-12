## NOW  
Create a Vitest test file at `test/xml-formatter.partial-branches.test.js` that includes:  
- A test verifying that `xmlFormatter({ error: new Error('msg'), timestamp })` (with no `error.details` property) omits the `<details>` element in the `<error>` block.  
- A test verifying that when `xmlFormatter` is passed `thresholds: { prod: { minAge: 5, minSeverity: 'low' } }` without a `dev` key, the `<dev>` section is not rendered (and vice-versa when only `dev` is provided).

## NEXT  
- Update `README.md` and `docs/api.md` to clearly mark `--check` and configuration-file support as “coming soon” (or remove their descriptions) so documentation accuracy rises above 80%.  
- Add a Prettier “check” step (`prettier --check .`) to the CI workflow (`.github/workflows/ci-publish.yml`) to enforce code formatting.

## LATER  
- Implement full `.dry-aged-deps.json` config-file support (schema validation, CLI merge precedence, tests).  
- Add true `--check` mode handling in the CLI and `printOutdated` (per ADR 0004) with integration tests and updated docs.  
- Install and configure Husky pre-commit hooks to run `npm run lint` and `npm test`.  
- Publish a JSON Schema file (`.dry-aged-deps.schema.json`) for config-file editor validation.