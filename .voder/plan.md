## NOW
Remove the tag‐based trigger from the CI workflow by editing `.github/workflows/ci-publish.yml` and deleting the `tags: ['v*']` entry so it only runs on pushes to `main`.

## NEXT
- Scan all remaining `test/**/*.test.js` files for placeholder traceability annotations (e.g. `@story` referencing `*-user-story-map.md` or `@req UNKNOWN`) and update each header to point at the correct `prompts/…md` story path and requirement IDs.  
- Run `npm run validate-traceability` to verify no placeholders remain, then commit the fixed test files.

## LATER
- Add a CI check step that fails the build if any `*.test.js` files lack valid `@story/@req` tags.  
- Enhance the Husky pre-push hook to install fixture dependencies in `test/fixtures` before running tests.  
- Establish a periodic audit task (e.g. a quarterly job) to review and update test traceability as new stories are added.