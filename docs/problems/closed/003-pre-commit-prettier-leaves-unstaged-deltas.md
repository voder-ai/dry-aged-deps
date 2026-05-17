# Problem 003: husky pre-commit `prettier --write` leaves unstaged working-tree deltas

**Status**: Closed
**Reported**: 2026-05-13
**Closed**: 2026-05-13 — verified during work-problems session: read-only `format:check` hook held cleanly across iter 2's commit cycle AND the 10-commit v2.7.1 drain push (no unstaged prettier deltas observed on either occasion). Closure authorised by user via /wr-itil:work-problems Step 2.5 routing.
**Priority**: 10 (High) — Impact: Minor (2) x Likelihood: Almost certain (5)
**Effort**: S — single-file change to .husky/pre-commit (lint-staged or format:check), plus test
**WSJF**: 0 (excluded — Closed)
**Type**: technical

## Description

`.husky/pre-commit` runs `npm run format` which is `prettier --write .`. This modifies files in the working tree AFTER the index has been captured for the commit. Git then commits the staged content (the un-reformatted version), and the prettier-applied formatting remains as unstaged working-tree changes.

Observed pattern across 5 commits this session: every commit landed with the originally-staged content, then prettier deltas appeared in `git status` immediately after, requiring a follow-up `style:` commit (or bundling the deltas with the next substantive commit). This produced two of the unpushed batch's commits (`8ff6033`, `d05aa4d`) — both labelled "apply prettier reformatting from previous commit".

**Fix shape (preferred)**: switch pre-commit to use `lint-staged` (or equivalent) so only the staged file paths are formatted AND re-staged. Common implementations: `lint-staged` config in package.json with `prettier --write` per glob; the lint-staged runner stages the formatted output before the commit proceeds.

**Fix shape (lighter)**: have `.husky/pre-commit` only run `npm run format:check` (read-only). If check fails, abort the commit with guidance to run `npm run format` and re-stage. Avoids the auto-write/no-restage trap entirely.

## Symptoms

- After every commit on this project, `git status` shows modified-but-unstaged files that were not touched by the maintainer.
- The unstaged changes are pure prettier reformatting (whitespace, italic-marker normalisation, table column padding).
- Follow-up `style: apply prettier reformatting from previous commit` commits accumulate (2 of 13 commits this session).

## Workaround

After each commit, immediately stage and commit the prettier deltas as `style:` (does not trigger a release per semantic-release). Or accept the working-tree noise and bundle the deltas with the next substantive commit.

## Impact Assessment

(deferred to investigation)

## Root Cause Analysis

Git captures the index at the start of `git commit`, then runs the pre-commit hook against the working tree. `.husky/pre-commit` invoked `npm run format` (= `prettier --write .`), which writes its reformatting to the working tree AFTER the index snapshot. The commit ships the un-reformatted content; the prettier deltas remain as unstaged working-tree changes immediately post-commit.

Confirmed by reading `.husky/pre-commit` lines 4-9 and the recurrence pattern across the 14 commits enumerated in the Related section. The root cause is structural: an auto-writing hook cannot re-stage its own writes into the in-flight commit without explicit re-staging logic (which `prettier --write` does not provide).

### Investigation Tasks

- [x] Re-rate Priority and Effort at next `/wr-itil:review-problems` — kept at 10 (High) / S; matches the original assessment.
- [x] Decide on fix shape: lint-staged (re-stages formatted output) vs format:check (read-only abort) — chose `format:check` abort per ADR-0013 (zero new dependencies, one-line hook change, reversible).
- [x] Implement chosen shape in `.husky/pre-commit` — hook now runs `npm run format:check` and aborts with guidance on failure. CLAUDE.md required no update (the read-only convention is documented in ADR-0013).
- [x] Add a test that ensures the hook does not silently mutate the working tree — `test/husky-pre-commit.test.js` asserts the read-only contract by scanning the hook's command-execution lines for forbidden write-mode invocations.

## Fix Released

Implemented in this commit (folded fix + verification-pending transition per ADR-022 / ADR-014 commit-grain). The fix lands as part of the AFK-orchestrator's release cadence (Step 6.5); npm publication follows once the orchestrator drains the changeset queue.

**Verification trigger**: after the next substantive commit lands on this branch, `git status` should show a clean working tree (no unstaged prettier deltas). If `format:check` fails at commit time, the hook should print "Pre-commit aborted: prettier formatting check failed." to stderr and exit non-zero — the user runs `npm run format`, re-stages, and commits.

## Dependencies

- **Blocks**: (none — cosmetic / workflow-friction)
- **Blocked by**: (none)
- **Composes with**: ADR-0014 commit-grain (cleaner separation if `style:` follow-ups stop being routine)

## Related

- `.husky/pre-commit` lines 4-9 (the `npm run format` call).
- Observed across commits 6929c43, 87e0575, b115e4c, bbda58c, ff7bbac, 7e4c532, b4d9da2, c952617, e67dd01, 95209cc, 2efb60b, ab6731b, plus the explicit follow-ups 8ff6033 and d05aa4d.

(captured via retro Step 4b Stage 1; expand at next investigation)
