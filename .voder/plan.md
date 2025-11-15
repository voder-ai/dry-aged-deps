## NOW  
Refactor `src/cli-options-helpers.js` by extracting its duplicated parsing logic into a new utility module (e.g. `src/cli-options-helpers/utils-common.js`) and updating `cli-options-helpers.js` to import and use that module—reducing code duplication below the jscpd 20% threshold.

## NEXT  
- Refactor `src/xml-formatter.js` to split out XML tag and element–generation into smaller functions/modules, then re-enable and satisfy the ESLint complexity and max-lines-per-function rules.  
- Refactor `src/print-outdated-handlers.js` to group related parameters into option objects, reducing function arity so the max-params rule can be re-enabled.  
- Remove the `security/detect-object-injection` exemption in `src/filter-by-security.js` by refactoring property access to a safe pattern.

## LATER  
- Write additional unit tests for any uncovered branches (identify via `npm run test -- --coverage`) to raise branch coverage above 95%.  
- Audit all `src/` modules and add missing `@story` and `@req` JSDoc annotations on exported functions and key control-flow branches.  
- Commit a JSON Schema for `.dry-aged-deps.json` into `docs/` and reference it in `docs/api.md` to enable editor validation/autocomplete.