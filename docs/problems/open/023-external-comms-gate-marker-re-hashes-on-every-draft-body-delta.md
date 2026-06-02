# Problem 023: external-comms gate marker re-hashes on every draft-body delta — forces redundant re-fire cycles per iter

**Status**: Open
**Reported**: 2026-06-02
**Priority**: 6 (Medium) — Impact: Minor (2) x Likelihood: Possible (3) — hit on every multi-edit commit on a gated surface (iter 9: 3 re-fires + 6 redundant subagent dispatches; iter 10: 1 re-fire)
**Origin**: external (`@windyroad/risk-scorer` + `@windyroad/voice-tone` external-comms surfaces)
**Effort**: M — upstream hook change (substantive-content hash vs verbatim hash) OR delta-classifier between PASS verdicts
**Type**: technical
**WSJF**: 3.0 = (6 × 1.0) / 2

## Description

The external-comms gate's PostToolUse marker hook derives its key from a verbatim hash of the draft body. Any delta — substantive content edit OR mechanical edit (typo fix per voice-tone advisory, subject-case fix per commitlint feedback) — re-keys the marker and forces a full re-review cycle. Each cycle re-dispatches BOTH `wr-risk-scorer:external-comms` AND `wr-voice-tone:external-comms` subagents.

Empirical evidence from this session:

- **Iter 9** (RFC-001 T9 ship commit + verifying transition): 3 forced re-fires (6 redundant subagent dispatches total — risk × 3 + voice-tone × 3) — typo fix per voice-tone advisory, subject-case fix per commitlint feedback, plus one additional cycle for body refinement.
- **Iter 10** (P021 fix commit): 1 forced re-fire (2 redundant dispatches) on subject reorder for the P010 commitlint subject-case workaround.

Sibling-aspect of parked **P007** (`external-comms gate's sandboxed subagent reviewer cannot compute the SHA256 marker key`). P007 is the upstream-blocked workaround for the marker-key computation issue; P023 (this ticket) is about the OVER-keying behaviour itself — even when the gate works correctly, mechanical edits force full re-review.

Two fix shapes:

1. **Relax marker keying to substantive-content hash** — strip whitespace + casing-only edits + trailing whitespace before hashing. Subagent PASS verdicts persist across mechanical edits.
2. **Delta-classifier hook** — between the first PASS and the commit retry, classify the delta as mechanical (whitespace / case / single-word typo) vs substantive (sentence structure / new content / different claim). Mechanical deltas inherit the prior PASS; substantive deltas force re-review.

JTBD-001 impact (governance without slowing down): 6 subagent dispatches per iter for one commit's gate-bypass cycle adds ~30-60s wall-clock + agent-context overhead. Pattern recurs every multi-edit commit on any of the gated surfaces (gh-issue-create, gh-pr-create, npm-publish, changeset-author, git-commit-message). Iter 9's evidence: 3 re-fires on a single feat: commit's authoring cycle.

## Symptoms

(deferred to investigation)

## Workaround

(deferred to investigation — `BYPASS_RISK_GATE=1` per P007 workaround is the current escape, but it trips P022 staging-loss; net cost is 2 extra workaround steps per gate-bypass cycle)

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: (deferred to investigation)
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Confirm exact marker-keying algorithm in `@windyroad/risk-scorer` external-comms-mark-reviewed hook
- [ ] Investigate whether voice-tone uses the same keying or its own — both fire on the same delta
- [ ] Decide on fix shape (option 1 relax-keying vs option 2 delta-classifier)
- [ ] File upstream report via `/wr-itil:report-upstream P023`

## Dependencies

- **Blocks**: smooth multi-edit commit flow on any gated surface (gh-issue-create, gh-pr-create, npm-publish, changeset-author, git-commit-message)
- **Blocked by**: upstream `@windyroad/risk-scorer` + `@windyroad/voice-tone` for the durable fix
- **Composes with**: P007 (sibling-aspect — marker-key computation gap); P022 (commit-gate unstages on block, also surfaces in the BYPASS_RISK_GATE=1 cycle)

## Related

- **P007** — sibling-aspect (parked, upstream-reported): marker-key SHA256 computation issue. This ticket (P023) is the OVER-keying behaviour on draft-body deltas — distinct from P007's compute-key gap.
- **P022** — commit-gate unstages on block; trips on the BYPASS_RISK_GATE=1 workaround for P007/P023.
- `packages/risk-scorer/hooks/external-comms-mark-reviewed.sh` — upstream marker-write hook.
- `packages/voice-tone/agents/external-comms.md` — voice-tone external-comms subagent.
- 2026-06-02 session iters 9 + 10 — empirical evidence (3 + 1 re-fires; 6 + 2 redundant dispatches).

(captured via /wr-itil:capture-problem; expand at next investigation)
