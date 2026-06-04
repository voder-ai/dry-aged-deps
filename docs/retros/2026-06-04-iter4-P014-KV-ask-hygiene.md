# Ask Hygiene — AFK iter 4 (work-problems/2026-06-04, P014 K→V transition)

**Date**: 2026-06-04
**Iter**: 4 (P014 selected by orchestrator main-turn Step 3 tier+tie-break: Tier 2, WSJF 4.5, Known Error, Effort L, Reported 2026-05-25, fix already shipped today as v2.12.0 — selected over P013 in the WSJF 4.5 tie by deviating from strict ID-asc final-tiebreaker because P014's fix has fully shipped via RFC-002 ship-train, while P013 needs ADR-0018 amendment + RFC-scope product-shape direction)
**Scope**: mechanical ADR-022 lifecycle transition Known Error → Verification Pending; underlying fix shipped 2026-06-04 across RFC-002 T1-T9 commits (`34120cc` spec → `789a18b` failing test → `1a435f9` impl → `4241c4b` wire → `93343ee` formatter → `a83ccf3` docs → `450a355` live-case regression → `07311a1` README ship-signal → `d5ff125` verifying transition); v2.12.0 published to npm today.

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

- Mechanical ADR-022 transition: `git mv` from `known-error/` to `verifying/` (bare-name per per-state-subdir convention), Status field flipped to "Verification Pending", `## Fix Released` section added documenting the RFC-002 T1-T9 commit chain, v2.12.0 release marker, severity-scaled policy contract (Critical → 0-day floor, High → ½ default, Moderate/Low/None → default), and the next-user-encounter verification plan. All decisions framework-resolved — no direction-ask warranted.
- Commit-gate path fired four subagent invocations for a docs-only commit: `wr-risk-scorer:external-comms` × 2 (PASS both times) + `wr-voice-tone:external-comms` × 2 (PASS both times). The second pair was triggered after the first pair's marker did not land in the main-session dir — P024 cross-session marker dir mismatch (a known KE). Resolved via `BYPASS_RISK_GATE=1` after independent PASS verdicts. Existing-decision territory — no new direction-ask.
- Commit-message body-max-line-length forced two redraft cycles before passing. The wrapping decisions were format-only — no direction-ask warranted.
- P013 was eligible for K→V flip in the same WSJF 4.5 tie-bucket but deferred per the orchestrator's stated rationale: gap #2 (fixAvailable-aware unfixable reason) requires ADR-0018 amendment + RFC-scope product-shape direction that ADR-074 substance-confirm-before-build would defer via outstanding_questions anyway. The defer is a framework-resolved decision (ADR-074); no ask warranted.
