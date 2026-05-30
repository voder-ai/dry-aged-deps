# Problem 019: work-problems Step 5 subprocess JSON envelope's duration_ms can dramatically undercount — extend P089 Gap 2 authority hierarchy

**Status**: Open
**Reported**: 2026-05-30
**Priority**: 3 (Medium) — Impact: 3 x Likelihood: 1 (deferred — re-rate at next /wr-itil:review-problems)
**Origin**: external (`@windyroad/itil`)
**Effort**: M (deferred — re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

`/wr-itil:work-problems` Step 5 subprocess JSON envelope's `duration_ms` (not just `usage.*` tokens) can dramatically undercount when subprocess exits via background-task completion ack — extend P089 Gap 2 authority hierarchy to cover duration_ms.

Upstream-rooted (`@windyroad/itil` work-problems SKILL.md Step 5 "Authority hierarchy (P089 Gap 2)" paragraph).

Evidence: this session's iter 3 (manage-problem on P015) reported `duration_ms: 13445` (13.4s) and `num_turns: 1` with `stop_reason: end_turn` in the `claude -p --output-format json` envelope, but the orchestrator's Bash wall-clock timer showed wall=2105s (~35 min). Total cost authoritative ($5.00). The work-problems SKILL.md Step 5 documents the same shape for `usage.*` tokens (P089 Gap 2 — "subprocess exits via a background-task completion-notification ack, the fields reflect ONLY that final ack turn"). The duration_ms field exhibits identical behaviour but the SKILL.md only names tokens in the asymmetry.

Fix shape: extend the Authority hierarchy paragraph to name `duration_ms` alongside `usage.*` as best-effort under the same exit-mode caveat. Cost remains authoritative; wall-time should be measured from the Bash wrapper's own timer (already documented as the SIGTERM-decision signal).

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

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Investigate root cause
- [ ] Create reproduction test

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P017 — also targets @windyroad/itil work-problems SKILL.md, but distinct concern (Step 0 reconcile-readme route vs Step 5 P089 Gap 2 authority)

## Related

(captured via /wr-itil:capture-problem; expand at next investigation)

- **Upstream report pending** — external dependency identified; invoke /wr-itil:report-upstream when ready
