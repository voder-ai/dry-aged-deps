## NOW  
Edit CHANGELOG.md to remove the “Unreleased” section and add concrete entries for config-file support and the --check mode under the current version, documenting those features as shipped.

## NEXT  
- Update tsconfig.json per ADR 0006: enable strict type‐checking flags and include the bin directory in the “include” paths.  
- Add or complete JSDoc annotations in `src/index.js` and any helpers missing `@throws`, parameter and return types.  
- Revise docs/api.md and README.md examples to cover `--config-file` and `--check` usage, including exit-code semantics.

## LATER  
- Publish a JSON Schema file (e.g. `.dry-aged-deps.schema.json`) for the config file and reference it in `.dry-aged-deps.json`.  
- Configure lint-staged in Husky to auto-run Prettier and ESLint --fix on staged files.  
- Add snapshot tests for JSON and XML formatter output to guard against future regressions.