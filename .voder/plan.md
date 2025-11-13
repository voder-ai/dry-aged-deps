## NOW
Modify the default error‐handling branches in `bin/dry-aged-deps.js` so that any error path in table mode (outside the JSON/XML handlers) calls `process.exit(2)` instead of `process.exit(1)` to comply with the exit‐code standardization.

## NEXT
- Update `test/cli.error-cmd.test.js` to expect `exitCode: 2` for table‐mode failures (e.g. invalid JSON from `npm outdated`).  
- Revise the README and `docs/api.md` “Exit Codes” sections to clearly state that **exit 2 = error** in all formats, and **exit 1 = updates available**.  
- Run locally: `npm run lint && npm run type-check && npm test` to verify that all tests (including exit‐code tests) pass.

## LATER
- Complete any remaining user stories (“auto-update” refinements, concurrency/caching for `fetchVersionTimes`, lint‐staged pre‐commit auto‐fix).  
- Publish a JSON Schema for `.dry-aged-deps.json` and integrate it into docs and CI validation.  
- Gradually tighten JSDoc/type coverage (remove any remaining `@ts-nocheck`) and refactor for stricter lint complexity rules.