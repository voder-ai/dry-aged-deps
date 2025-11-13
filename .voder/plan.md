## NOW
Add a test case in `test/cli.check-mode.test.js` that runs  
```
node bin/dry-aged-deps.js --check --min-age=10000
```
with `DRY_AGED_DEPS_MOCK=1` and asserts `exitCode === 0` and that stdout contains the “No outdated packages with mature versions found” message.

## NEXT
- Update README.md’s **Exit Codes** section to state clearly that:
  - `0` = no safe updates available (in both default and `--check` modes),  
  - `1` = safe updates available,  
  - `2` = an error occurred.
- Update **docs/api.md** under **CI/CD Integration** (or exit‐code docs) to reflect the same semantics for table, JSON, and XML formats.
- Commit these changes and verify locally with  
  ```
  npm run lint && npm run type-check && npm test
  ```

## LATER
- Implement and test any remaining user stories (e.g., auto‐update refinements, concurrency or caching for `fetchVersionTimes`, lint-staged pre-commit auto-fix).  
- Publish a JSON Schema for `.dry-aged-deps.json`, add schema validation in CI, and document the schema.  
- Gradually tighten ESLint complexity/length rules and remove any remaining `@ts-nocheck` pragmas as JSDoc coverage improves.