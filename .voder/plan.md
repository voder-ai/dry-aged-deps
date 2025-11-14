## NOW  
Add a JSDoc `@story` header to every `*.test.js` file in the `test/` directory that currently lacks one, referencing its corresponding `prompts/*.md` user‐story file (e.g. prepend `/** @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md */`).

## NEXT  
- Under each test file’s `@story` header, add the primary `@req` tag for the requirement under test.  
- Rename test files with misleading “branch” or coverage terminology (e.g. change `xml-formatter.error-branch.test.js` to `xml-formatter.error-missing-details.test.js`).  
- Update **README.md** to list every supported CLI flag—including `--config-file`, `--update`, `--yes`, and `--check`—with a brief usage example for each.

## LATER  
- Audit all `src/` modules and insert missing `@story` and `@req` JSDoc annotations on exported functions and key control‐flow branches.  
- Refactor common test setup into reusable builders in `test/helpers/` to eliminate duplicated fixtures.  
- Commit a JSON Schema for `.dry-aged-deps.json` into `docs/` and reference it in **docs/api.md** for editor validation.  
- Add a CI lint step that scans `test/` for missing `@story` annotations and fails the build if any are absent.