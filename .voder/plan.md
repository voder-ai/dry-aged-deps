## NOW  
Commit and push all pending changes (including the modifications to README.md and .voderignore) to `origin/main` to clean the working tree.

## NEXT  
- Run `npm run format` and commit any formatting changes.  
- Suppress or fix the remaining ESLint security warnings in test files and commit those fixes.  
- Add unit tests for `src/xml-formatter.js` to exercise its currently untested branches and commit the new tests.

## LATER  
- Integrate Husky pre-commit hooks to enforce linting, formatting, and tests locally.  
- Update CLI help text and README to document the `--check` flag and standardized exit codes.  
- Augment the CI workflow (`.github/workflows/ci-publish.yml`) to fail on formatting, lint, or coverage breaches.  
- Create a JSON Schema file (`dry-aged-deps.schema.json`) for the `.dry-aged-deps.json` config file.