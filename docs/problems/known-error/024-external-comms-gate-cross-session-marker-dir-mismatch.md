# Problem 024: external-comms gate cross-session marker dir mismatch — subagent PASS verdicts land in agent's own dir, main session's gate can't find them

**Status**: Known Error
**Reported**: 2026-06-02
**Origin**: external (`@windyroad/risk-scorer` external-comms gate PostToolUse marker hook)
**Priority**: 4 (Low) — Impact: Minor (2) x Likelihood: Unlikely (2) — fires every time a subagent is dispatched for the gate; BYPASS workaround exists per P007 precedent
**Effort**: M — shared-dir marker write OR parent-session-id propagation through the subagent dispatch contract
**Type**: technical
**WSJF**: 4.0 = (4 × 2.0) / 2

## Description

When the orchestrator's main turn dispatches `wr-risk-scorer:external-comms` via the Agent tool to satisfy the external-comms gate, the subagent's PostToolUse marker hook writes the PASS marker into the **subagent's own session marker directory** (`/tmp/claude-risk-<subagent-session-id>/` or similar). The orchestrator's main session's gate then looks for the marker under the **main session's** marker directory and fails to find it — even though the subagent emitted `EXTERNAL_COMMS_RISK_VERDICT: PASS`.

Empirical evidence (iter 7, 2026-06-02 session):

1. Main turn delegated to `wr-risk-scorer:external-comms` for a `git-commit-message` draft.
2. Subagent emitted `EXTERNAL_COMMS_RISK_VERDICT: PASS`.
3. Main turn retried `git commit` — still blocked with "git-commit-message draft has not been reviewed".
4. Recovery: `BYPASS_RISK_GATE=1` per P007 documented workaround.

This is the **second** aspect of the broader external-comms-gate-marker class of issues:

- **P007** (parked, upstream-reported): the SANDBOXED subagent cannot compute the canonical SHA256 marker key because the subagent sandbox lacks Bash for the hash computation. Distinct surface: compute-side gap.
- **P023** (just captured): marker re-hashes on every draft-body delta, forcing redundant re-fire cycles. Distinct surface: keying-granularity gap.
- **P024 (this ticket)**: PASS marker lands in the wrong directory entirely on cross-session subagent dispatch — main session never sees it. Distinct surface: marker-location gap.

All three combine into a "BYPASS_RISK_GATE=1 is the only reliable escape" pattern that surfaces every iter that needs to commit a gated message.

Two fix shapes:

1. **Shared-dir marker write** — subagent's marker hook writes to a shared root (`/tmp/claude-risk-shared/`) rather than its own session dir. Main session's gate reads from the same shared root. Trade-off: cross-session bleed if multiple parent sessions delegate concurrently.
2. **Parent-session-id propagation** — subagent receives the parent session's marker dir as a SURFACE prompt argument or env var, writes the marker there. Main session's gate finds it. Trade-off: requires subagent dispatch contract change.

## Symptoms

(deferred to investigation)

## Workaround

`BYPASS_RISK_GATE=1` per P007 (combined with the PASS verdict in hand) is the documented escape. Cost: 1 extra command per gated commit + trips P022 staging-loss if commit-gate also blocks.

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: (deferred to investigation)
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Confirm exact marker-write path used by `@windyroad/risk-scorer`'s external-comms PostToolUse hook
- [ ] Confirm main session's gate reads from a different path than subagent writes
- [ ] Decide on fix shape (shared-dir vs parent-session-id propagation)
- [ ] File upstream report via `/wr-itil:report-upstream P024` — or consolidate with P007 / P023 as a single "external-comms gate marker contract" upstream amendment

## Dependencies

- **Blocks**: smooth external-comms gate satisfaction via the documented `wr-risk-scorer:external-comms` subagent dispatch path
- **Blocked by**: upstream `@windyroad/risk-scorer` for the durable fix
- **Composes with**: P007 (sibling — compute-key gap, upstream-reported); P023 (sibling — keying-granularity gap, just captured); P022 (commit-gate unstages on block, trips on the BYPASS workaround cycle)

## Related

- **P007** — sibling-aspect (parked, upstream-reported #SECURITY.md): marker-key SHA256 compute gap.
- **P023** — sibling-aspect (just captured): marker re-hash on every draft-body delta.
- **P022** — orchestrator-side staging-loss trip that compounds with the BYPASS_RISK_GATE workaround.
- `packages/risk-scorer/hooks/external-comms-mark-reviewed.sh` — upstream marker-write hook.
- 2026-06-02 session iter 7 — first empirical observation in this session (orchestrator main turn delegated to subagent; got PASS; gate still blocked; recovered via BYPASS).
- **Upstream report pending** — external dependency identified; invoke /wr-itil:report-upstream when ready

(captured via /wr-itil:capture-problem; expand at next investigation)
