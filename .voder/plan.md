## NOW
Run Prettier across the entire codebase (`npm run format`) to fix all style violations and commit the formatted files.

## NEXT
- Commit and push the formatting commit to `main` so the working directory is clean and all style fixes are in version control.  
- Update README.md (Development section) and docs/developer-guidelines.md to document running `npm run typecheck` and `npm run validate` as part of the local quality-gate workflow.  
- Lower the ESLint `complexity` threshold in eslint.config.js from 25 to 20 and refactor any functions that now exceed the new limit.

## LATER
- Add a Husky pre-commit hook that runs `npm run format` on staged files to enforce style automatically.  
- Remove the `|| true` bypass in the jscpd CI step and address any reported duplicate-code clones.  
- Break up oversized modules (e.g. `src/cli-options-helpers.js`) into smaller utility files to further reduce cyclomatic complexity.