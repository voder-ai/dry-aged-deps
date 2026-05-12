# Problem 003: husky pre-commit `prettier --write` leaves unstaged working-tree deltas

**Status**: Open
**Reported**: 2026-05-13
**Priority**: 3 (Medium) — Impact: 2 x Likelihood: 2 (deferred — re-rate at next /wr-itil:review-problems)
**Effort**: S (deferred — re-rate at next /wr-itil:review-problems)
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

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next `/wr-itil:review-problems`
- [ ] Decide on fix shape: lint-staged (re-stages formatted output) vs format:check (read-only abort)
- [ ] Implement chosen shape in `.husky/pre-commit` and update CLAUDE.md if conventions change
- [ ] Add a test that ensures a clean working tree post-commit on a file that prettier would reformat

## Dependencies

- **Blocks**: (none — cosmetic / workflow-friction)
- **Blocked by**: (none)
- **Composes with**: ADR-0014 commit-grain (cleaner separation if `style:` follow-ups stop being routine)

## Related

- `.husky/pre-commit` lines 4-9 (the `npm run format` call).
- Observed across commits 6929c43, 87e0575, b115e4c, bbda58c, ff7bbac, 7e4c532, b4d9da2, c952617, e67dd01, 95209cc, 2efb60b, ab6731b, plus the explicit follow-ups 8ff6033 and d05aa4d.

(captured via retro Step 4b Stage 1; expand at next investigation)
