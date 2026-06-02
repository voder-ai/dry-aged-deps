# Problem 022: commit-gate hook unstages files on "Pipeline state drift" block — manual re-stage needed after rescore

**Status**: Open
**Reported**: 2026-05-30
**Priority**: 6 (Medium) — Impact: Minor (2) x Likelihood: Possible (3) — hit 4× across this session (cron-arming, test-relocation, P023 capture cycle, P024 capture cycle) and iter 10 dispatch
**Origin**: internal
**Effort**: S — block message could add a "Recovery: git add <file> + retry" line; root cause investigation is the harder half
**Type**: technical
**WSJF**: 6.0 = (6 × 1.0) / 1

## Description

The risk-scorer commit-gate hook (PreToolUse:Bash on `git commit`) blocks commits when "Pipeline state drift" is detected (working tree changed since the last commit risk assessment). Observed behaviour during the 2026-05-30 session: after the block, the previously-staged file appears as `Changes not staged for commit` rather than remaining staged. Recovery requires `git add` + retry.

Empirical evidence — hit twice in this session:

1. Cron-arming commit attempt — `git add .github/workflows/auto-update.yml` → `git commit` blocked → delegate to `wr-risk-scorer:pipeline` → retry commit failed with "no changes added to commit"; file showed as `modified` not staged. Re-`git add` + retry succeeded (commit `85fad8f`).
2. Test-relocation commit attempt — same pattern with 60 staged files. Re-`git add -A` + retry succeeded (commit `a34aebe`).

Not deterministically reproducible — sometimes the staging persists across the block + rescore. Either the commit-gate hook itself unstages OR a downstream PreCommit hook mishandles a partially-blocked state.

## Symptoms

(deferred to investigation)

## Workaround

(deferred to investigation — `git add` + retry works; the block message could mention this in recovery steps)

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: (deferred to investigation)
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Reproduce: stage file → induce drift → rescore → snapshot `git status --porcelain` at each step
- [ ] Determine source: commit-gate hook OR `.husky/pre-commit` OR shell timing
- [ ] If commit-gate: suppress unstage OR document `git add` recovery step in block message
- [ ] Consider enhancement: block message could include `Recovery: \`git add <file>\` + retry` as standard text

## Dependencies

- **Blocks**: smooth retry experience after commit-gate "Pipeline state drift" block
- **Blocked by**: investigation (root cause not yet confirmed)

## Related

- `wr-risk-scorer:pipeline` — subagent type the block message points at for rescoring.
- `packages/risk-scorer` — likely owner of the commit-gate hook.
- `.husky/pre-commit` — post-block hook chain that might be involved.
- 2026-05-30 session — empirical evidence (`85fad8f` cron-arming + `a34aebe` test-relocation).

(captured via /wr-itil:capture-problem; expand at next investigation)
