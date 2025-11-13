## NOW  
Refactor **src/cli-options-helpers.js** to extract its repetitive flag-parsing logic into one generic `parseFlag()` helper, then remove its ESLint exemptions and re-enable the `complexity` and `max-lines-per-function` rules for that file.

## NEXT  
- Refactor **src/print-outdated.js** by breaking its large `printOutdated()` function into smaller, focused modules, remove its ESLint exemptions, and re-enable complexity/max-lines rules.  
- Split **src/xml-formatter.js** into utility modules (e.g. `escapeXml.js` + `xmlTemplate.js`), drop its ESLint overrides, and turn on complexity/max-lines rules.  
- Update **eslint.config.js** to remove the overrides that disable complexity and max-lines checks for those files, then run `npm run lint` and verify no warnings.

## LATER  
- Integrate `jscpd` duplicate-code detection into the CI pipeline and enforce an acceptable threshold.  
- Add JSDoc comments (and update docs/api.md) for internal modules (`config-loader.js`, `build-rows.js`, `apply-filters.js`) to improve documentation coverage.  
- Enable `checkJs` in `tsconfig.json` and remove all `// @ts-nocheck` directives to fulfill ADR 0006 and ensure type checking across the codebase.  
- Create a dedicated **docs/configuration.md** describing the `.dry-aged-deps.json` schema and usage examples, and add automated link/schema validation.