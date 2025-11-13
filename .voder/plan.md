## NOW  
Lower the ESLint cyclomatic‐complexity threshold in `eslint.config.js` from 20 to 15 by updating the `complexity` rule.

## NEXT  
- Run `npm run lint` locally to list all functions now failing the new complexity limit.  
- Incrementally refactor each reported function (for example in `print-outdated.js`, `cli-options-helpers.js`, `config-loader.js`, `xml-formatter.js`)—extract smaller helpers, simplify conditionals—to bring their complexity below 15.  
- Rerun `npm run lint` to verify no complexity violations remain and commit the refactored code.

## LATER  
- Remove the temporary ESLint overrides (`complexity: 'off'` and `max-lines-per-function: 'off'`) from previously exempted files once they pass under the stricter rules.  
- Consolidate and DRY‐up repetitive CLI flag‐parsing logic into shared helper functions to reduce duplication.  
- Configure CI to enforce per-file branch coverage thresholds (e.g., ≥90%) and add targeted tests for uncovered branches.  
- Enable `"checkJs": true` in `tsconfig.json` and complete missing JSDoc annotations on internal modules for full type‐checking coverage.