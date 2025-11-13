## NOW
Remove the `// @ts-nocheck` directive from the top of `src/print-outdated.js`.

## NEXT
- In `eslint.config.js`, remove the file-specific override that disables the `complexity` and `max-lines-per-function` rules for `src/print-outdated.js`.  
- Delete any remaining `// @ts-nocheck` directives from `src/xml-formatter.js` and `src/filter-by-security.js`.  
- Run the full validation suite (`npm run validate`) locally and fix all new lint or type errors that arise in those files.

## LATER
- Refactor the logic in `src/print-outdated.js`, `src/xml-formatter.js`, and `src/filter-by-security.js` to break large functions into smaller, single-responsibility units and reduce cyclomatic complexity below the configured ESLint thresholds.  
- Gradually tighten the `max-lines-per-function` rule (e.g. lower from 200 to 100, then to 50) and address any violations.  
- Enhance and complete JSDoc annotations so that `tsc --noEmit` passes without errors, enabling full type-checking coverage across the codebase.