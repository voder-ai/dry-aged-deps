## Plan to Achieve Full Traceability Annotations

## NOW  
Modify **src/filter-by-age.js** to add JSDoc traceability to its main function:
- Add a `@story prompts/003.0-DEV-FILTER-MATURE-VERSIONS.md` tag.
- Add `@req REQ-AGE-THRESHOLD - enforce minimum age threshold`, `@req REQ-SMART-SEARCH - search newest first`, and `@req REQ-COMPARISON - only versions > current` tags to the function’s JSDoc.

## NEXT  
1. In **src/filter-by-security.js**, annotate its exported functions with  
   `@story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md` and all relevant `@req` tags (e.g. `REQ-AUDIT-CHECK`, `REQ-TRANSITIVE-DEPS`, `REQ-SMART-SEARCH`, `REQ-SAFE-ONLY`).  
2. In **src/build-rows.js** and **src/apply-filters.js**, add `@story prompts/002.0-DEV-FETCH-VERSION-AGES.md` / `prompts/003.0-DEV-FILTER-MATURE-VERSIONS.md` and corresponding `@req` tags around the core functions and branches.  
3. Update each **test/** file header to include `@story prompts/XXX.md` matching the story under test, and add individual `@req` annotations in `describe` or `it` blocks for the acceptance criteria being verified.

## LATER  
- Create a script (e.g., `scripts/check-traceability.js`) to scan `src/` and `test/` for missing `@story`/`@req` tags and fail when gaps are found; integrate it into the CI pipeline under `npm run lint` or a new `npm run check:traceability` command.  
- Document the traceability requirements and `@story`/`@req` conventions in **docs/developer-guidelines.md** so all future code and tests include proper annotations.  
- Periodically audit newly added modules and tests to ensure 100% traceability as part of the Definition of Done for each story.