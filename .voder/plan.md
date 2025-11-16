## NOW  
Refactor `src/cli-options-helpers.js` by extracting its duplicated flag-parsing logic into a shared helper in `src/cli-parser-utils.js`, reducing that file’s duplication below 20% and then run lint, type-check, and tests to verify no regressions.

## NEXT  
- Review every test file and replace the placeholder JSDoc headers (`@story ???`, `@req UNKNOWN`) with the correct `@story` prompt paths (e.g. `prompts/001.0-DEV-RUN-NPM-OUTDATED.md`) and the exact requirement IDs in their `describe`/`it` blocks.  
- Remove any remaining imports or references to `prompts/dry-aged-deps-user-story-map.md` from tests.  
- Audit key helper modules (e.g. `output-utils.js`, `security-helpers.js`) and add missing `@story`/`@req` JSDoc annotations so that all public and complex internal functions are fully traceable to specific stories and requirements.

## LATER  
- Enhance or replace the placeholder traceability script to automatically infer and insert precise `@req` tags from test names and story metadata.  
- Build and integrate an ESLint or Vitest plugin that enforces the presence and correctness of `@story`/`@req` annotations in test files as part of local and CI linting.  
- Plan and ratchet down code-quality thresholds (e.g. lower max-lines-per-function, stricter complexity, tighter duplication limits) incrementally, adding jscpd and complexity checks to the CI pipeline.