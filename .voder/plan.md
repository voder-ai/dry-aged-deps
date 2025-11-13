## NOW
Remove all `// @ts-nocheck` pragmas in `src/` and `bin/` and update JSDoc/type annotations so that `npm run type-check` (tsc --noEmit) passes without errors.

## NEXT
- Add a `npm run type-check` step to the Build & Test job in `.github/workflows/ci-publish.yml`.  
- Update `docs/api.md` to document that `fetchVersionTimes` returns a `Promise` and detail its possible errors.  
- Revise `README.md` examples to cover `--config-file` and `--check` usage along with exit-code semantics.

## LATER
- Implement in-memory caching in `src/fetch-version-times.js` to batch `npm view` calls.  
- Configure lint-staged via Husky to auto-run Prettier and `eslint --fix` on staged files.  
- Publish a JSON Schema (`.dry-aged-deps.schema.json`) for the CLI config file and reference it in the docs.