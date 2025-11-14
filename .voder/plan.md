## NOW  
Add a JSDoc `@story` and `@req` annotation to the `fetchVersionTimes` function in `src/fetch-version-times.js`, linking it to `prompts/002.0-DEV-FETCH-VERSION-AGES.md` and `REQ-NPM-VIEW`.

## NEXT  
- Add or update JSDoc traceability annotations (`@story` and `@req`) on all remaining public API functions in `src/` (e.g. `calculateAgeInDays`, `checkVulnerabilities`, `jsonFormatter`, `xmlFormatter`, `printOutdated`, etc.), pointing to their corresponding prompt files and requirement IDs.  
- Enhance **docs/api.md**: document the `--config-file` flag and the `updateMode` and `skipConfirmation` options for `printOutdated`, including parameter descriptions and examples.  
- Update **README.md** CLI reference section to list every supported flag (including `--config-file`) with a brief usage example.

## LATER  
- Audit each source file to insert branch‐level `@story`/`@req` comments in significant `if`/`catch`/loop blocks to meet full traceability requirements.  
- Create or update a JSON schema file for `.dry-aged-deps.json` and reference it in **docs/api.md** for editor autocomplete.  
- Add a CI validation step that scans all `src/` and `test/` files for missing `@story` annotations and fails the build if any are absent.