## NOW
Remove the file-level `@ts-nocheck` directive from `src/filter-by-security.js`.

## NEXT
- Run `npm run type-check` and fix any resulting errors in `src/filter-by-security.js` by adding proper JSDoc types or refactoring code so it fully passes TypeScript checking.  
- Search the entire codebase for remaining `@ts-ignore` or file-level disable comments, remove them, and resolve the underlying issues.  
- Scan all `test/**/*.test.js` files for placeholder `@story`/`@req` annotations and update each JSDoc header to reference the correct `prompts/*.md` story paths and requirement IDs.

## LATER
- Add a CI step that fails the build if any test file lacks valid `@story`/`@req` tags.  
- Lower the ESLint complexity threshold (e.g. from 15 to 12) and refactor any functions that exceed the new limit to maintain code quality above 90%.  
- Establish a periodic audit (quarterly) to remove any suppression comments and ensure both code quality and test traceability metrics remain at or above 90%.