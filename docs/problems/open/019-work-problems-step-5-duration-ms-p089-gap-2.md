# Problem 019: work-problems Step 5 subprocess JSON envelope's duration_ms can dramatically undercount — extend P089 Gap 2 authority hierarchy

**Status**: Open
**Reported**: 2026-05-30
**Priority**: 4 (Low) — Impact: Minor (2) x Likelihood: Unlikely (2)
**Origin**: external (`@windyroad/itil`)
**Effort**: M — upstream `@windyroad/itil` SKILL.md Step 5 Authority hierarchy paragraph amend + upstream report
**WSJF**: 2.0 = (4 × 1.0) / 2
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

- [x] Re-rate Priority and Effort at next /wr-itil:review-problems (2026-05-30: Impact 2 × Likelihood 2 = 4 (Low), Effort M — upstream report + skill spec amend; Likelihood lower than sibling P017 because the exit-mode shape that triggers the undercount is narrower)
- [ ] Investigate root cause
- [ ] Create reproduction test

## Fix Strategy

**Kind**: improve. **Shape**: skill.

**Target file**: upstream `@windyroad/itil` — `packages/itil/skills/work-problems/SKILL.md` Step 5 "Authority hierarchy (P089 Gap 2)" paragraph.

**Observed flaw**: the SKILL documents `usage.*` tokens as best-effort under the "subprocess exits via background-task completion-notification ack" caveat, but does not name `duration_ms` even though it exhibits identical behaviour. An orchestrator that aggregates duration_ms believing it cumulative under-counts wall-clock by orders of magnitude when an iter's exit path is the background-task ack shape.

**Edit summary**: extend the Authority hierarchy paragraph in work-problems SKILL.md Step 5 to name `duration_ms` alongside `usage.*` as best-effort under the same exit-mode caveat. Cost (`total_cost_usd`) remains authoritative; wall-time should be measured from the Bash wrapper's own timer (already documented as the SIGTERM-decision signal). Routing target: `/wr-itil:report-upstream` (`@windyroad/itil` repo); local marker via `## Related` section already appended below.

**Evidence**:

- This session iter 3 (manage-problem on P015): `duration_ms: 13445` (13.4 s) and `num_turns: 1` with `stop_reason: end_turn` in the `claude -p --output-format json` envelope.
- Orchestrator's Bash wall-clock timer showed `wall=2105s` (~35 min). Total cost authoritative (`total_cost_usd: 5.003`).
- The same exit-mode shape that P089 Gap 2 documents for tokens also produced the duration_ms undercount — the asymmetry is real but the SKILL only names tokens.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P017 — also targets @windyroad/itil work-problems SKILL.md, but distinct concern (Step 0 reconcile-readme route vs Step 5 P089 Gap 2 authority)

## Related

(captured via /wr-itil:capture-problem; expand at next investigation)

- **Upstream report pending** — external dependency identified; invoke /wr-itil:report-upstream when ready
