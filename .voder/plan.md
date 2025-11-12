## NOW  
Update CHANGELOG.md to remove the `--check` and `.dry-aged-deps.json` bullets from the **[0.1.2]** section (or move them into an “Unreleased” section) so the changelog reflects only implemented features.

## NEXT  
- Bump the version in package.json to `0.1.2` to align with the updated CHANGELOG.  
- In `bin/dry-aged-deps.js`, remove or append “(coming soon)” to the `--check` and config-file flags in the help text.  
- Add an “Unreleased” heading at the top of CHANGELOG.md for planned features.

## LATER  
- Implement `.dry-aged-deps.json` config-file support with schema validation, merging logic, and tests.  
- Add true `--check` mode in the CLI and `printOutdated` per ADR 0004, with enforcement exit codes, tests, and documentation.  
- Configure Husky pre-commit hooks to run `npm run lint` and `npm test`.  
- Publish a JSON Schema file (`.dry-aged-deps.schema.json`) for editor validation of the config file.