## NOW  
Extract the CLI argument parsing and configuration‐loading block from `bin/dry-aged-deps.js` into a new module `src/cli-options.js` that exports a single `parseOptions(argv: string[])` function, and update `bin/dry-aged-deps.js` to call this function for all flag, config file, and default‐value logic.

## NEXT  
- Add JSDoc comments to `src/cli-options.js`, `bin/dry-aged-deps.js`, and all modules to fully document inputs, outputs, and thrown errors.  
- Refactor `printOutdated.js` by extracting its concerns into smaller modules (e.g. `src/load-package-json.js`, `src/build-rows.js`, `src/apply-filters.js`, `src/output-formatters.js`) to reduce per-file complexity.  
- Enforce maintainability rules by configuring ESLint “complexity” and “max-lines-per-function” limits in `eslint.config.js` and enabling them in CI.  
- Turn on JSDoc type checking: set `"checkJs": true` in `tsconfig.json`, add a `"type-check": "tsc --noEmit"` script, and include it in the CI pipeline and Husky pre-push hook.

## LATER  
- Integrate a duplication detector (e.g. jscpd) into pre-push checks to catch copy-paste code.  
- Update `docs/api.md` and `docs/developer-guidelines.md` with the new module boundaries and usage examples for `cli-options.js`.  
- Plan a gradual migration of core modules to TypeScript (`.ts`) once JSDoc checking is stable.