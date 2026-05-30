# Problem 017: work-problems Step 0 reconcile-readme halt-route can't handle unscored-ticket MISSING drift

**Status**: Open
**Reported**: 2026-05-30
**Priority**: 3 (Medium) — Impact: 3 x Likelihood: 1 (deferred — re-rate at next /wr-itil:review-problems)
**Origin**: external (`@windyroad/itil`)
**Effort**: M (deferred — re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

`/wr-itil:work-problems` Step 0 README reconciliation halt-route can't handle unscored-ticket MISSING drift — should route to `/wr-itil:review-problems` instead of `/wr-itil:reconcile-readme` when the drifting tickets lack stored WSJF.

Upstream-rooted (`@windyroad/itil` work-problems SKILL.md Step 0 README reconciliation preflight + classify-readme-drift contract).

Evidence: at Step 0 of this session's AFK loop, `wr-itil-reconcile-readme docs/problems` returned exit 1 with 3 MISSING entries (P013, P014, P015 — captured this week with deferred scoring). `wr-itil-classify-readme-drift` returned exit 1 (HALT_ROUTE_RECONCILE — no staged renames). Per the SKILL contract the orchestrator should invoke `/wr-itil:reconcile-readme`, but reconcile-readme's Step 3 explicitly disclaims re-rating — it expects each ticket to have `**WSJF**` populated. With WSJF absent, mechanical reconcile would either guess (wrong) or produce a junk commit that `/wr-itil:review-problems` would immediately overwrite. The pragmatic resolution: escalate to `/wr-itil:review-problems` as iter 1 (which scores + re-ranks + rewrites README in one pass, reconciling drift as a side effect).

Fix shape: extend the SKILL contract or classify-readme-drift script to detect "MISSING drift on tickets without stored WSJF" and route to `/wr-itil:review-problems` instead of reconcile-readme. Compose with the work-problems Edge Case "Review needed first" path that already documents this.

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

## Fix Strategy

**Kind**: improve. **Shape**: skill.

**Target file**: upstream `@windyroad/itil` — `packages/itil/skills/work-problems/SKILL.md` Step 0 README reconciliation preflight + drift classification carve-out (P149); composes with `packages/itil/scripts/classify-readme-drift.sh`.

**Observed flaw**: the HALT_ROUTE_RECONCILE classifier (exit 1) routes to `/wr-itil:reconcile-readme`, but reconcile-readme's Step 3 disclaims re-rating — it expects each ticket to have `**WSJF**` populated. With WSJF absent on the drifting MISSING tickets, mechanical reconcile would either guess (wrong) or produce a junk commit that `/wr-itil:review-problems` would immediately overwrite. The work-problems Edge Case "Review needed first" already documents that unscored tickets need review-problems first, but the Step 0 contract routes to reconcile-readme regardless.

**Edit summary**: extend `classify-readme-drift.sh` (or add a new tier) to detect "MISSING drift on tickets without stored `**WSJF**`" and emit a new exit-code class (e.g. `HALT_ROUTE_REVIEW`). Then the work-problems Step 0 contract routes that class to `/wr-itil:review-problems` as iter 1, which scores + re-ranks + rewrites README in one pass, reconciling drift as a side effect. Routing target: `/wr-itil:report-upstream` (`@windyroad/itil` repo); local marker via `## Related` section already appended below.

**Evidence**:

- Step 0 of this session's AFK loop: `wr-itil-reconcile-readme docs/problems` returned exit 1 with 3 MISSING entries (P013, P014, P015 — captured 2026-05-25 with deferred scoring).
- `wr-itil-classify-readme-drift` returned exit 1 (HALT_ROUTE_RECONCILE — no staged renames).
- Pragmatic resolution this session: orchestrator main-turn judgement escalated to `/wr-itil:review-problems` as iter 1 (commit `527c026`), which scored P013/P014/P015 and rewrote the README — drift reconciled as side effect. This is the correct behaviour the SKILL contract should formalise.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

(captured via /wr-itil:capture-problem; expand at next investigation)

- **Upstream report pending** — external dependency identified; invoke /wr-itil:report-upstream when ready
