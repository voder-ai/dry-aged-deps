## NOW
Extract the duplicated logic in `src/print-outdated.js` and `src/print-outdated-handlers.js` into a new shared module (e.g. `src/print-utils.js`), then refactor both files to import and use the shared functions.

## NEXT
- Refactor `src/cli-options-helpers.js` by splitting it into smaller, single‐responsibility modules (e.g. parsing, validation, defaults) to reduce duplication and complexity.  
- Update `docs/architecture.md` so it lists every current source file (including `apply-filters.js`, `config-loader.js`, `update-packages.js`, etc.), reflecting the actual module layout.  
- Augment `docs/api.md` to document the `options.update` and `options.skipConfirmation` parameters of `printOutdated`, along with any other newly exposed functions.

## LATER
- Draft and add ADRs under `docs/decisions/` for configuration‐file support (story 010) and the auto‐update (`--update`) feature (story 011).  
- Provide a JSON Schema file (e.g. `dry-aged-deps.schema.json`) for `.dry-aged-deps.json` and link it in the documentation for editor validation.  
- Integrate a `jscpd --threshold 20 src` step into the CI workflow to enforce DRY principles automatically.