## NOW  
Enable TypeScript checking on all JavaScript files by updating `tsconfig.json`—set `"checkJs": true` under `compilerOptions`.

## NEXT  
- Run `npm run typecheck` and fix any type errors introduced by `"checkJs": true`.  
- Refactor `src/cli-options-helpers.js` (and any other high-duplication modules) to reduce cloned logic below 20% duplication, then verify with `npm run check:duplication`.  
- Add a JSON Schema for the `.dry-aged-deps.json` config (e.g. `config.schema.json` at project root) and link it in `docs/api.md` and `README.md`.

## LATER  
- Introduce a Husky “documentation-lint” pre-commit hook (and matching CI step) to enforce presence of `@story`/`@req` annotations.  
- Add CI checks that fail the build on jscpd duplication above 15% or ESLint cyclomatic complexity above 12.  
- Gradually tighten duplication and complexity thresholds in `eslint.config.js` and `jscpd` config, remediating violations in small increments.