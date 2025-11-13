## NOW
Run `git push origin main` to publish your two local commits and bring version control compliance above 90% so CI runs on the latest code.

## NEXT
- In `eslint.config.js`, lower the complexity rule from `max: 45` to `max: 30`.
- Run ESLint against `src/` with the new rule to identify violations:  
  ```
  npx eslint src --rule 'complexity:["error",{"max":30}]'
  ```
- Refactor the top offenders (for example, in `src/print-outdated.js` and `src/cli-options-helpers.js`) by extracting sub-logic into smaller helper functions so each function’s cyclomatic complexity is ≤ 30.

## LATER
- Gradually reduce the `complexity` threshold down to 15, refactoring as you go.
- Split `src/cli-options-helpers.js` into multiple focused modules to eliminate duplication and improve readability.
- Enable additional ESLint rules (e.g. `max-params`, `max-nested-callbacks`, tighter `max-lines-per-function`) and remove any remaining `@ts-nocheck` pragmas as JSDoc coverage is completed.