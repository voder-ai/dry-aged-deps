# Ask Hygiene — AFK iter 2 (work-problems/2026-06-04, P025 K→V transition)

**Date**: 2026-06-04
**Iter**: 2 (P025 selected by orchestrator main-turn Step 3 tier+tie-break: Tier 2, WSJF 6.0, Known Error, Effort M, Reported 2026-06-03, fix already shipped at 411fa71 — selected as highest-WSJF actionable after P010/P017/P023/P019/P024 upstream-blocked-skip)
**Scope**: mechanical ADR-022 lifecycle transition Known Error → Verification Pending; underlying fix already shipped 2026-06-03 in commit `411fa71` (8 v4→v6 action-version migrations across 3 workflow files), 13 days before the 2026-06-16 GitHub Actions Node 20 deprecation cutover.

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

- Mechanical ADR-022 transition: `git mv` from `known-error/` to `verifying/` (bare-name per per-state-subdir convention — corrected from iter 1's double-`.verifying.md` shape per orchestrator's explicit instruction), Status field flipped, `## Fix Released` section added documenting the 8 v4→v6 action-version migrations across `.github/workflows/auto-update.yml` + `ci-publish.yml` + `claude.yml`, the empirical evidence from 8+ green post-fix ci-publish runs (latest: workflow run 26929804300 from iter 1's `41c4b12` push at 2026-06-04 04:02 UTC), and the pending-trigger status of auto-update + claude workflows. All decisions framework-resolved — no direction-ask warranted.
- Commit-gate path fired three subagent invocations for a docs-only commit: `wr-risk-scorer:external-comms` (PASS), `wr-voice-tone:external-comms` (PASS), `wr-risk-scorer:pipeline` (2/25 Very Low, risk-reducing bypass). All three are existing-decision gates; no ambiguity warranting an ask. Same shape as iter 1 — known pattern covered by P023 (gate marker re-hashes on every draft-body delta) and P024 (cross-session marker dir mismatch); no new ticket.
- Retro itself required two extra gate round-trips (architect + JTBD) because `docs/retros/` is not in the architect-gate / JTBD-gate exclusion lists. Both returned PASS in one round each. Not ticket-worthy (single-shot gate fires, not a repeat-work pattern across iters). Same observation as iter 1.
- P025 itself is excluded from Step 4a verification candidates by the same-session exclusion (sub-step 8) — the verifying ticket was created THIS session, so cannot meaningfully be verified by this session.
- P021 (from iter 1) was NOT close-eligible from this iter's activity: no `vitest`, `npm test`, or src/ exercise occurred — only `git mv`, ticket Edit, and README edits ran. Sub-step 9 also does not apply: P021's `Likely verified?` cell reads `no — not observed`, not `yes — observed: …`.
