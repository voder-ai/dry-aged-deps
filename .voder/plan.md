## NOW  
Remove all untracked patch and temporary files in the project root (e.g. `*.patch`, `README.tmp`, `README.new`) and commit the cleanup.

## NEXT  
- Run `npm run format` to apply Prettier formatting and commit any resulting changes.  
- Fix or suppress any remaining ESLint security warnings in test files and commit the fixes.  
- Add unit tests for `src/xml-formatter.js` to cover its missing branches and ensure branch coverage ≥ 80%, then commit the new tests.  
- Push all outstanding commits to `origin/main` to synchronize the remote branch.

## LATER  
- Integrate Husky pre-commit hooks to enforce linting, formatting, and tests locally.  
- Update documentation (`docs/api.md`, `docs/architecture.md`, `README.md`) to remove stale content and fully document the `--check` mode and exit codes.  
- Add CI workflow steps in `.github/workflows/ci-publish.yml` to fail builds on formatting, lint, or coverage breaches.  
- Create a JSON Schema file (`dry-aged-deps.schema.json`) for `.dry-aged-deps.json` to enable editor validation and autocomplete.