## NOW  
Remove the `.husky/**` entry from `.gitignore` so that the Husky hook scripts are no longer ignored.

## NEXT  
- Stage and commit the existing `.husky/` directory (e.g. `git add .husky && git commit -m "chore: track Husky pre-push and commit-msg hooks"`) so collaborators automatically get the hooks.  
- Rename any test files whose names include coverage-metric terms (for example, change `printOutdated.branches.test.js` → `printOutdated.edge-cases.test.js` and `xml-formatter.partial-branches.test.js` → `xml-formatter.edge-cases.test.js`), and update any import paths accordingly.  
- Update `vitest.config.js` to enforce a 90% minimum branch coverage threshold under the `coverage` section so that CI fails if branch coverage drops below 90%.

## LATER  
- Add unit tests to cover the missing branches in `build-rows.js`, `xml-formatter.js`, and `filter-by-security.js` to raise overall branch coverage above 90%.  
- Refactor `xml-formatter.js` and `filter-by-security.js` to remove `// @ts-nocheck` and disabled complexity/max-lines rules, breaking large functions into smaller, testable helpers, then re-enable complexity and length rules.  
- Provide a JSON Schema file (e.g. `schema/dry-aged-deps.schema.json`) for `.dry-aged-deps.json`, reference it in `README.md` and `docs/api.md`, and validate it in the config loader.  
- Document Husky hook installation and usage in `docs/developer-guidelines.md` so new contributors know how the pre-push and commit-msg checks work.