## NOW  
Run the test‐header auto‐fix script to update every test file’s JSDoc header with a specific `@story` reference (e.g. `prompts/001.0-DEV-RUN-NPM-OUTDATED.md`) and initial `@req` placeholders by executing:  
```bash
node scripts/setup-traceability.sh
```  

## NEXT  
- Review each test file and replace `@req` placeholders with the correct requirement IDs in their `describe`/`it` blocks.  
- Remove any lingering references to `prompts/dry-aged-deps-user-story-map.md`.  
- Add a CI step that scans the `test/` directory after every push and fails if a test file is missing a valid `@story` or `@req` annotation.  

## LATER  
- Enhance the traceability script to automatically infer and insert precise `@req` tags based on test names and story metadata.  
- Build an ESLint or Vitest plugin to enforce the presence and correctness of `@story`/`@req` annotations in all test files as part of the local and CI linting pipeline.