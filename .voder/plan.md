# Implementation Plan

## ROOT CAUSE ANALYSIS: Systematic Linting Suppressions

**Problem**: 48 out of 94 source files (51%) contain `eslint-disable` directives for traceability rules.

**Root Cause Identified**: Annotation format mismatch
- **Current (incorrect) format in suppressed files**:
  ```javascript
  /**
   * @story prompts/013.0-DEV-CHECK-MODE.md
   * @req REQ-CHECK-FLAG - Description
   * @req REQ-EXIT-1-ON-UPDATES - Description
   */
  ```

- **Expected format (working files)**:
  ```javascript
  /**
   * @supports prompts/013.0-DEV-CHECK-MODE.md REQ-CHECK-FLAG REQ-EXIT-1-ON-UPDATES
   */
  ```

**Why This Happened**: Legacy annotation format from earlier implementation phase not aligned with current traceability plugin requirements.

**Solution Approach**: Convert annotations from multi-line `@story`/`@req` format to single-line `@supports` format, then remove suppressions.

**Verification Strategy**: 
1. Fix ONE representative file
2. Run `npm run lint` to verify fix works
3. Commit that single fix
4. Repeat for next file

---

## NOW

**COMPLETED**: Fixed the first two test files with traceability suppressions

**Files Fixed**:
1. ✅ `test/cli.check-mode.test.js` - Converted annotations, updated describe/test names, removed suppressions
2. ✅ `test/cli-entrypoint.test.js` - Converted annotations, updated describe/test names, removed suppressions

**Verification**:
- ✅ `npm run lint` passes
- ✅ `npm test` passes (all 211 tests passing)
- ✅ Suppressions reduced from 48 to 46

**Discovery**: Each file requires:
1. Converting `@story`/`@req` annotations to `@supports` format
2. Updating `describe()` block to start with `Story XXX.X-DEV-...:`
3. Updating each `it()` or `test()` to start with `[REQ-XXX]`
4. Removing old inline `// Story: REQ-XXX` comments
5. Ensuring REQ IDs match what's actually in the story files

**Learned**: Some files reference requirements that don't exist or have multiple stories, requiring careful analysis of each file individually.

---

## NEXT

**Fix remaining test files systematically (one at a time)**

After verifying the approach works with `test/cli.check-mode.test.js`, apply the same fix to other test files with traceability suppressions:

1. `test/cli.invalid-options.test.js` - Convert annotations, remove suppressions
2. `test/cli.format-json.test.js` - Convert annotations, remove suppressions  
3. `test/printOutdated.edge-cases.test.js` - Convert annotations, remove suppressions
4. `test/cli.outdated.test.js` - Convert annotations, remove suppressions
5. `test/cli.config-file.test.js` - Convert annotations, remove suppressions
6. `test/cli.format-xml.test.js` - Convert annotations, remove suppressions
7. `test/cli.flags.test.js` - Convert annotations, remove suppressions
8. `test/printOutdated.extra.test.js` - Convert annotations, remove suppressions

Continue with remaining ~15 test files identified in assessment.

**Process for each file**:
- Apply annotation format conversion
- Remove `eslint-disable` directives
- Run `npm run lint` to verify
- Commit individually with clear message
- Move to next file

---

## LATER

**Fix bin/ and src/ files with traceability suppressions**

After all test files are fixed:

1. **Fix `bin/dry-aged-deps.js`**:
   - Convert function-level `@story`/`@req` annotations to `@supports` format
   - Remove the two top-level `eslint-disable` directives
   - Verify with linting
   - Commit

2. **Review any src/ files** with traceability suppressions (if any beyond bin/):
   - Apply same conversion process
   - Remove suppressions
   - Verify and commit

3. **Final verification**:
   - Run `npm run lint` across entire codebase
   - Confirm zero traceability-related suppressions remain
   - Run `npm test` to ensure all tests still pass
   - Run `npm run format:check` to verify formatting

4. **Update assessment report**:
   - Document that code quality issue is resolved
   - Update suppression count to 0%
   - Mark Phase 3 as fully passed

**Expected Final State**:
- ✅ All 48 suppressions removed
- ✅ All files use correct `@supports` annotation format
- ✅ Linting passes without suppressions
- ✅ Tests pass
- ✅ Code quality phase unblocked
- ✅ Ready to proceed with new feature development
