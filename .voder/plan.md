## NOW

Analyze ONE file with traceability linting errors to determine the correct fix approach.

**File to analyze**: `src/age-calculator.js`

**Analysis steps**:
1. Read the current file and identify all `@req` annotations
2. Read the referenced story file (`prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md`)
3. Check which requirement IDs are documented in the story file
4. For each `@req` annotation in the code, determine:
   - Does the requirement ID exist in the story file? (code matches story)
   - Does the requirement ID need updating to match what's in the story?
   - Is the code untraceable (no matching requirement in story)? Should it be removed?
   - Does the requirement need to be added to the story file? (less common)

**Then**: Document the findings and create a plan to fix this ONE file correctly, verify the fix passes linting, commit it, and proceed to the next file.

## NEXT

After successfully fixing and committing the first file:

1. Analyze the next file with traceability errors using the same approach
2. Apply the fix pattern learned from the first file
3. Verify linting passes for that file
4. Commit the fix
5. Repeat for remaining files with errors

Track progress:
- Total files with errors: ~40+ files
- Approach: Fix one at a time, commit each, verify incrementally

## LATER

After all traceability errors are resolved:

1. Verify final quality checks:
   - `npm run lint` - should pass completely
   - `npm run format:check` - should pass
   - `npm run typecheck` - should pass  
   - `npm test` - all tests pass
2. Update `.voder/history.md` with summary of the traceability fixes
3. Push all commits to remote repository
4. Monitor CI/CD pipeline for success
