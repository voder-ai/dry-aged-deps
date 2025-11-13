## NOW  
Install the missing Vitest coverage provider so tests can run with coverage:  
```bash
npm install --save-dev @vitest/coverage-v8
```

## NEXT  
- Run the full test suite (`npm test`) and correct any test failures, including updating Vitest config if needed.  
- Fix the CLI check-mode logic in `bin/dry-aged-deps.js`/`src/print-outdated.js` so that `--check` with no safe updates returns exit code 0 and matches test expectations.  
- Run ESLint (`npm run lint`) and address any lint errors that appear.

## LATER  
- Apply Prettier formatting across the codebase (`npm run format`) to enforce consistent style in CI.  
- Refactor high-complexity functions and lower the ESLint `complexity` threshold (e.g. from 25 to 20), extracting helpers to reduce cyclomatic complexity.  
- Consolidate duplicated validation logic in `src/cli-options-helpers.js` into shared utilities and continue tightening code quality rules.