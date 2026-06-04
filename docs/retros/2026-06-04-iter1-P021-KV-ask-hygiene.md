# Ask Hygiene — AFK iter 1 (work-problems/2026-06-04, P021 K→V transition)

**Date**: 2026-06-04
**Iter**: 1 (P021 selected by orchestrator main-turn Step 3 tier+tie-break: Tier 2, WSJF 6.0, Known Error, Effort S, Reported 2026-05-30)
**Scope**: mechanical ADR-022 lifecycle transition Known Error → Verification Pending; underlying fix already shipped 2026-06-02 in commit `dc64c44`.

## Calls

| Call # | Header | Classification | Citation |
| ------ | ------ | -------------- | -------- |

(no AskUserQuestion calls this iter — AFK discipline preserved per P135 / ADR-044. Orchestrator hard-banned AskUserQuestion mid-iter in the iter prompt.)

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

## Notes

- Mechanical ADR-022 transition: `git mv` from `known-error/` to `verifying/`, Status field flipped, `## Fix Released` section added with the three coordinated changes documented (`calculateAgeInDays` signature extension, overrides-hygiene swap-back, JSDoc divergence comment removal). All three are concrete, citable changes shipped in commit `dc64c44` — no framework gap requiring a direction-ask.
- Commit-gate path fired three subagent invocations for a docs-only commit: `wr-risk-scorer:external-comms` (PASS), `wr-voice-tone:external-comms` (PASS), `wr-risk-scorer:pipeline` (1/25 Very Low, risk-reducing bypass). All three are existing-decision gates; no ambiguity warranting an ask. Known pattern — covered by P023 (gate marker re-hashes on every draft-body delta) and P024 (cross-session marker dir mismatch); no new ticket.
- Retro itself required two extra gate round-trips (architect + JTBD) because `docs/retros/` is not in the architect-gate / JTBD-gate exclusion lists (unlike `docs/problems/` and `docs/briefing/`). Both returned PASS in one round each. Not ticket-worthy (single-shot gate fires, not a repeat-work pattern across iters).
- P021 itself is filtered out of Step 4a verification candidates by the same-session exclusion (sub-step 8) — a session cannot verify its own fix beyond "gates passed at commit time".
