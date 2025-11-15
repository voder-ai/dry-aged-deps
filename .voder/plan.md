## NOW  
Remove all `@ts-nocheck` directives from `src/print-outdated.js` and `bin/dry-aged-deps.js`, run `npm run type-check`, and fix any resulting type errors to restore full JSDoc-based type coverage.

## NEXT  
- Re-enable ESLint complexity and max-lines-per-function rules on `src/print-outdated.js`, then refactor its largest functions into smaller, testable units so they satisfy those rules.  
- Run `npm test -- --coverage` to generate a branch-coverage report, identify any uncovered code paths, and add unit tests to raise branch coverage above 95%.  
- Audit every exported function in `src/` for missing `@story` and `@req` JSDoc tags and add them (including key `if`/`switch`/`catch` branches) to achieve 100% traceability.

## LATER  
- Define and commit a JSON Schema file for `.dry-aged-deps.json` under `docs/` and update `docs/api.md` to reference it for editor validation.  
- Introduce in-memory caching or throttling for `npm view … time` and `npm audit` calls to improve performance on large projects; instrument a CI smoke test to catch regressions.  
- Gradually ratchet up other ESLint rules (e.g., max-params, sonarjs) across the codebase as complexity and duplication shrink under refactoring.