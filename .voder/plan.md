## NOW  
Add a JSDoc `@story` header to every test file in `test/`, referencing its corresponding `prompts/*.md` user‐story file (e.g. add `/** @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md */` at the top of each test file).

## NEXT  
- In each test file, extend that header to include the primary `@req` ID for the requirement under test.  
- Replace all placeholder JSDoc tags (`@story ???`, `@req UNKNOWN`) in helper modules (e.g. `src/cli-options-helpers.js`, `src/config-loader.js`, `src/output-utils.js`, `src/print-outdated-handlers.js`) with the correct `@story` and `@req` tags.  
- Update **docs/api.md** to document the `--config-file`, `--update`, and `--yes`/`--skipConfirmation` options for `printOutdated`, including parameter descriptions and usage examples.  
- Update **README.md**’s CLI reference to list every supported flag (including `--config-file`, `--update`, `--yes`, `--check`) with a brief example.

## LATER  
- Audit all `src/` files to insert branch-level `@story`/`@req` annotations on key `if`/`catch`/loop blocks for full traceability.  
- Author or update a JSON Schema for `.dry-aged-deps.json` in the repo and reference it in **docs/api.md** for editor validation.  
- Add a CI validation step that scans `src/` and `test/` for missing `@story` tags and fails the build if any are absent.