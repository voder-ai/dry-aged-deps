# Implementation Plan

## NOW

**Fix One Pilot Test File - Validate Traceability Approach**

Fix `test/build-rows.additional.test.js` to establish the correct pattern for traceability annotations. This single file will serve as the reference implementation for fixing the remaining 66 test files.

**Specific Changes**:

1. **Remove eslint-disable suppressions** (lines 1-2)
   - Delete both eslint-disable comment lines

2. **Add @supports annotation** (replace current JSDoc block)
   - Format: `@supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-NPM-COMMAND REQ-JSON-PARSE REQ-OUTPUT-DISPLAY`
   - Use actual requirement IDs from the story file (REQ-NPM-COMMAND, REQ-JSON-PARSE, REQ-OUTPUT-DISPLAY)
   - Remove invalid requirement IDs (REQ-NPM-VIEW, REQ-AGE-CALC - these don't exist in 001.0)

3. **Fix describe() block naming** (line 15)
   - Change from: `'prompts/001.0-DEV-RUN-NPM-OUTDATED.md & prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md: buildRows error logging'`
   - Change to: `'Story 001.0-DEV-RUN-NPM-OUTDATED: buildRows error logging'`
   - Use single story reference in "Story XXX.X-..." format

4. **Fix test naming** (lines 16, 39, 74+)
   - Add requirement ID prefix to each it() block
   - Change from: `'logs warning when fetchVersionTimes throws and format is table'`
   - Change to: `'[REQ-OUTPUT-DISPLAY] logs warning when fetchVersionTimes throws and format is table'`
   - Apply same pattern to all it() blocks in the file

5. **Verify the fix**:
   - Run: `npx eslint --config eslint.config.js test/build-rows.additional.test.js`
   - Confirm zero errors/warnings
   - Run: `npm test test/build-rows.additional.test.js`
   - Confirm tests still pass

**Success Criteria**:
- File lints with zero errors/warnings
- All tests pass
- No eslint-disable directives remain
- File serves as reference pattern for remaining fixes

**Why This First**:
- Following Gall's Law: Start with one simple fix that works
- Validates our understanding of traceability requirements
- Creates a reference pattern to replicate
- Allows immediate verification with existing tooling
- Can be reverted easily if approach is wrong
- Minimal blast radius (1 file, ~94 lines)

## NEXT

**Fix Second Test File - Build Confidence**

After the pilot file works, fix ONE more test file to confirm the pattern is repeatable and we haven't missed anything.

**File**: `test/age-calculator.test.js` (choose a simple, small file)

**Process**:
1. Read the file to identify which story it relates to
2. Read that story file to get valid requirement IDs
3. Apply the same pattern as the pilot:
   - Remove eslint-disable suppressions
   - Add @supports annotation with valid requirement IDs
   - Fix describe() to "Story XXX.X-..." format
   - Add [REQ-ID] prefixes to it() blocks
4. Verify: `npx eslint --config eslint.config.js test/age-calculator.test.js`
5. Verify: `npm test test/age-calculator.test.js`
6. Commit: `chore(test): fix traceability annotations in age-calculator.test.js`

**Success Criteria**:
- File lints with zero errors
- Tests pass
- Pattern validated on second file
- Ready to continue with third file

---

**Fix Third Test File - Establish Rhythm**

After two successful fixes, fix ONE more file to establish the working rhythm.

**File**: Choose the next simplest file (TBD based on what we learn)

**Process**: Same as second file

**Success Criteria**: Same as second file

---

**Continue One File at a Time**

After establishing the pattern works on 3 files, continue fixing one file at a time:
- Fix one file
- Verify linting passes
- Verify tests pass
- Commit that single file
- Move to next file

**Stop and reassess** if any file fails or reveals new issues with the pattern.

## LATER

**Continue Fixing Test Files One at a Time**

After successfully fixing 3+ files with the established pattern:

- Continue fixing one file at a time
- Each file is a separate commit
- Stop immediately if pattern doesn't work for any file
- Reassess approach if more than 2 files in a row have issues

**Target**: Eventually fix all 67 test files, but one at a time, not as a batch

---

**Code Quality Improvements** (After ALL Files Fixed)

Only after all 67 test files are fixed and linting passes cleanly:

1. **Enhance Pre-commit Hooks**
   - Prevent new eslint-disable directives without justification

2. **Establish Suppression Policy**
   - Document when suppressions are acceptable
   - Require approval for new suppressions

3. **Documentation Updates**
   - Add traceability annotation examples to developer guidelines
   - Create quick reference guide

4. **Team Training**
   - Share reference implementations
   - Update code review checklist

---

**Note**: This plan is STRICTLY incremental - one file at a time, verify, commit, repeat. NO batches, NO automation across multiple files, NO mass changes. If you're not good at making changes across many files, you fix ONE file, verify it works, commit it, then ask what to do next.
