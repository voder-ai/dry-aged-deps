## NOW  
Implement `.dry-aged-deps.json` support in the CLI: in `bin/dry-aged-deps.js`, immediately after parsing CLI flags, check for a `.dry-aged-deps.json` file in the CWD; if present, read and `JSON.parse` it, validate that it only contains the allowed keys (`minAge`, `severity`, `prod`, `dev`, `format`), and merge its values into the variables for `minAge`, `minSeverity`, `prodMinAge`, `prodMinSeverity`, `devMinAge`, `devMinSeverity`, and `format`—using precedence CLI flags > config file > defaults.

## NEXT  
- Add a new test suite `test/cli.config-file.test.js` to verify:  
  • Default thresholds when only config file is present (no flags)  
  • CLI flags override config values  
  • Invalid config values (e.g. negative ages, unknown severity) exit code 2 with clear error messages  
- Update the CLI help text in `bin/dry-aged-deps.js` to describe the `--config-file` option and config-file precedence  
- Update `README.md` and `docs/api.md` with a `.dry-aged-deps.json` example, its JSON schema (keys & types), and merge-precedence rules  
- Commit an example `.dry-aged-deps.json` file at the project root demonstrating all supported settings

## LATER  
- Publish a JSON Schema file (`.dry-aged-deps.schema.json`) for editor validation/autocomplete  
- Extend config lookup to support global (`~/.dry-aged-deps.json`) and project-level files with proper precedence  
- Allow environment-variable overrides (e.g. `DRY_AGED_DEPS_CONFIG`) and document them in CLI help and docs