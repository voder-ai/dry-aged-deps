# Implementation Plan

## Root Cause Analysis

**Problem**: 618 out of 5390 files (11.5%) contain systematic linting suppressions for `traceability/require-branch-annotation`, exceeding the 10% threshold.

**Root Cause**: The `require-branch-annotation` rule requires `@story` and `@req` annotations on **each control flow branch** (IfStatement, SwitchCase, TryStatement, etc.), but files only have these annotations at the function level, not on individual branches.

**What the Rule Enforces**: Every control flow statement (if, switch case, try, catch, for, while, etc.) must have inline comments with `@story` and `@req` annotations documenting which requirements justify that specific code path.

**Example** (from the rule's own code):
```javascript
// @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
// @req REQ-TRACEABILITY-WHILE - Trace while loop that collects preceding comments
while (i >= 0 && /^\s*(\/\/|\/\*)/.test(lines[i])) {
  comments.unshift(lines[i].trim());
}
```

**Why This Happened**: The rule represents an extremely detailed level of traceability that would require annotating every if/switch/try/catch/loop statement. This level of granularity may not align with the project's traceability goals.

**Correct Solution**: Determine if this level of branch-by-branch traceability is actually needed, or if the rule should be disabled in favor of function-level traceability only.

---

## NOW

**Add branch-level traceability to ONE simple file and verify approach**

Start with the simplest file to validate the pattern: `src/cli-options-helpers/get-flag-raw-value.js`

1. **Open the file** and identify all control flow branches:
   - Line 14: `if (eqArg)` - handles `--flag=value` format
   - Line 18: `if (idx !== -1)` - handles `--flag value` format  
   - Line 19: `if (args.length > idx + 1)` - validates value exists

2. **Add inline `@story` and `@req` comments** before each branch:
   ```javascript
   // @story prompts/014.0-DEV-INVALID-OPTION-ERROR.md
   // @req REQ-ERROR-EXIT-CODE
   if (eqArg) {
     return eqArg.slice(prefix.length);
   }
   
   const idx = args.indexOf(`--${flag}`);
   // @story prompts/014.0-DEV-INVALID-OPTION-ERROR.md
   // @req REQ-ERROR-EXIT-CODE
   if (idx !== -1) {
     // @story prompts/014.0-DEV-INVALID-OPTION-ERROR.md
     // @req REQ-ERROR-EXIT-CODE
     if (args.length > idx + 1) {
       return args[idx + 1];
     }
     console.error(`Missing value for --${flag}`);
     process.exit(2);
   }
   ```

3. **Remove the suppression**: Delete the `/* eslint-disable traceability/require-branch-annotation */` line

4. **Verify the fix**:
   ```bash
   npx eslint src/cli-options-helpers/get-flag-raw-value.js
   npm test
   ```

5. **Commit the change**:
   ```bash
   git add src/cli-options-helpers/get-flag-raw-value.js
   git commit -m "chore(lint): add branch-level traceability to get-flag-raw-value.js
   
   - Added @story/@req annotations for 3 control flow branches
   - Removed eslint-disable suppression
   - Progress: 1/618 files fixed"
   ```

**Expected Outcome**: One file properly annotated, linting passes, pattern validated for remaining files.

---

## NEXT

**Add branch-level traceability incrementally across the codebase**

After validating the approach with the first file:

1. **Fix remaining `src/cli-options-helpers/` files** (3 more files):
   - `parse-integer-flag.js`
   - `parse-string-flag.js`
   - `utils-common.js` (if exists)
   - One file at a time, verify each, commit individually

2. **Fix simple utility files in `src/`** (start with files that have fewer branches):
   - `load-package-json.js`
   - `age-calculator.js`
   - Review each file for control flow branches
   - Add annotations, remove suppression, verify, commit

3. **Create a tracking script** to monitor progress:
   ```bash
   # Create scripts/count-suppressions.sh
   echo "Remaining suppressions: $(grep -r 'eslint-disable traceability/require-branch-annotation' src/ bin/ test/ 2>/dev/null | wc -l | tr -d ' ')/618"
   ```

4. **Fix moderate complexity files in `src/`**:
   - `filter-by-age.js`
   - `filter-by-security.js`
   - `check-vulnerabilities.js`
   - `json-formatter.js`
   - `xml-formatter.js`
   - Continue one file at a time, verify, commit

5. **Fix complex files in `src/`**:
   - `print-outdated.js`
   - `update-packages.js`
   - `vulnerability-evaluator.js`
   - `security-smart-search.js`
   - These may have many branches, take time to understand requirements

6. **Fix `bin/` file**:
   - `bin/dry-aged-deps.js`
   - Main CLI entrypoint, likely has argument parsing branches
   - Add annotations, verify, commit

7. **Fix test files**:
   - Start with simplest test file to understand test annotation patterns
   - Test branches may reference different requirements than source branches
   - Apply pattern to remaining test files
   - Can batch similar test files after pattern is established

**Key Principles**:
- ONE file at a time for first 10-15 files
- Verify linting AND tests after EACH file
- Individual commits with progress tracking (X/618 fixed)
- Can accelerate to small batches (2-3 files) once confident
- Use `git add -p` to review each annotation carefully
- Run progress script regularly to track completion

---

## LATER

**Complete remaining files and establish maintenance practices**

After completing the initial batches in NOW and NEXT:

1. **Continue systematic progress through remaining files**:
   - Work through all suppressed files methodically
   - Group similar files together for efficiency
   - Maintain commit discipline (descriptive messages with progress counts)

2. **Final verification**:
   ```bash
   # Confirm all suppressions removed
   grep -r "eslint-disable traceability/require-branch-annotation" src/ bin/ test/ 2>/dev/null
   
   # Should return no results
   
   # Run full quality checks
   npm run lint
   npm test
   npm run typecheck
   npm run format:check
   ```

3. **Update developer documentation**:
   - Add section to `docs/developer-guidelines.md` about branch-level traceability
   - Include examples of proper branch annotations
   - Explain when and how to add `@story` and `@req` comments
   - Document the approved requirements each branch should reference

4. **Add pre-commit enforcement** (optional):
   - Configure git hooks to prevent commits with traceability suppressions
   - Add check for unannotated branches in new code

5. **Re-run assessment**:
   - Execute assessment to confirm Phase 3 passes
   - Suppression rate should be 0%
   - Ready to proceed with new story development

**Expected Final State**:
- 0 files with `eslint-disable traceability/require-branch-annotation`
- All control flow branches annotated with `@story` and `@req`
- Full traceability from code paths to requirements
- Clean linting output
- All tests passing
- Assessment Phase 3 passing
