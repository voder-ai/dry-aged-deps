# Problem 018: .husky/pre-commit auto-write hook's `--diff-filter=ACM` excludes R (renamed)

**Status**: Open
**Reported**: 2026-05-30
**Priority**: 6 (Medium) — Impact: Minor (2) x Likelihood: Possible (3)
**Origin**: internal
**Effort**: S — one-character diff-filter change (ACM → ACMR) in `.husky/pre-commit` + REQ-PRECOMMIT-AUTO-WRITE-RESTAGE rename-with-edit test
**WSJF**: 6.0 = (6 × 1.0) / 1
**Type**: technical

## Description

`.husky/pre-commit` auto-write hook's `--diff-filter=ACM` excludes R (renamed) — rename-with-edit commits bypass auto-write and `format:check` rejects.

Local fix path (.husky/pre-commit + ADR-0016 confirmation note + REQ-PRECOMMIT-AUTO-WRITE-RESTAGE test fixture).

Evidence: this session's commit `c0dfae8` (run-retro session-wrap closing P009 + briefing refresh) was REJECTED on first try by `format:check` after the auto-write step skipped the renamed `docs/problems/closed/009-...md` (renamed-with-edit from `verifying/009-...md` + Edit-tool Status field update + `## Verification observed` section append). Recovered with manual `npm run format && git add ...`. The hook's `git diff --cached --name-only --diff-filter=ACM` only catches A/C/M; R is excluded. P009's verification contract held for plain Modify but not for rename-with-edit — a related-but-distinct gap.

Fix shape: change diff-filter to `ACMR` so renames pass through. Also extend the REQ-PRECOMMIT-AUTO-WRITE-RESTAGE test to assert the rename-with-edit case.

## Symptoms

(deferred to investigation)

## Workaround

(deferred to investigation)

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: (deferred to investigation)
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [x] Re-rate Priority and Effort at next /wr-itil:review-problems (2026-05-30: Impact 2 × Likelihood 3 = 6 (Medium), Effort S — one-character diff-filter change + test fixture extension; root cause + fix shape already documented, kept Open pending implementation)
- [ ] Investigate root cause
- [ ] Create reproduction test

## Fix Strategy

**Kind**: improve. **Shape**: shell script + test fixture.

**Target file**: `.husky/pre-commit` (the auto-write block) + `test/husky-pre-commit.test.js` (REQ-PRECOMMIT-AUTO-WRITE-RESTAGE assertions).

**Observed flaw**: `git diff --cached --name-only --diff-filter=ACM` excludes `R` (renamed). When a commit stages a rename-with-edit (e.g. `git mv old new` + Edit-tool change to the renamed file), the auto-write block skips the renamed file and `format:check` rejects the commit. P009's fix contract held for plain Modify shapes but not for rename-with-edit — a related-but-distinct gap.

**Edit summary**: change the diff-filter from `ACM` to `ACMR` so renames-with-edits pass through the auto-write step. Also extend `REQ-PRECOMMIT-AUTO-WRITE-RESTAGE` (`test/husky-pre-commit.test.js`) with an assertion covering the rename-with-edit case (stage a rename + post-rename Edit; commit; assert no format:check rejection AND the formatted content lands IN the commit). Routing target: this project's own `.husky/pre-commit` (local shell-script edit) + REQ-PRECOMMIT-AUTO-WRITE-RESTAGE test fixture.

**Evidence**:

- This session commit `c0dfae8` (run-retro session-wrap closing P009 + briefing refresh) was REJECTED on first try by `format:check` after auto-write skipped the renamed `docs/problems/closed/009-...md` (renamed-with-edit from `verifying/009-...md`).
- Recovery: manual `npm run format && git add ...` then retry — exactly the friction P009 was supposed to eliminate, but for the rename shape.
- The hook output explicitly listed only the README files (`docs/problems/README-history.md 12ms (unchanged)`, `docs/problems/README.md 9ms (unchanged)`) — the renamed file was NOT in the auto-write log, confirming the diff-filter ACM excludes R.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P009 (closed) — same auto-write verification contract; this ticket extends coverage to rename-with-edit case

## Related

(captured via /wr-itil:capture-problem; expand at next investigation)

Duplicate-grep matches (informational; not true duplicates):

- `docs/problems/closed/009-edit-tool-markdown-writes-skip-prettier-pre-commit-format-check-fails.md` — closed; this ticket extends its REQ-PRECOMMIT-AUTO-WRITE-RESTAGE coverage to rename-with-edit
- `docs/problems/closed/003-pre-commit-prettier-leaves-unstaged-deltas.md` — closed; related historical context
