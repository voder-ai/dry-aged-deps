# Problem 006: assistant defers actionable items to "next session" instead of acting when the user is observably present

**Status**: Open
**Reported**: 2026-05-13
**Origin**: internal
**Priority**: 6 (Medium) — Impact: Minor (2) x Likelihood: Possible (3)
**Effort**: M — structural fix shape undecided (Step 2.5 pre-`ALL_DONE` audit vs reframe wrap-up vs default-to-action); may warrant an ADR; cross-cuts ADR-044 + P130 + P078
**WSJF**: 3.0 = (6 × 1.0) / 2
**Type**: technical

## Description

At the end of `/wr-itil:work-problems` Step 2.5 follow-up work on 2026-05-13, the assistant emitted a "Outstanding for next session (no action required tonight)" summary listing 4-5 follow-up items (push the 5 follow-up commits; `/wr-itil:report-upstream P004`; `/wr-itil:report-upstream P005`; verify P001/P002 in real use; optional architect ADR follow-up). The user was observably present at the keyboard (had just answered an `AskUserQuestion` round) and the items were each <5–10 min of mechanical work. The user pushed back: _"when is it going to happen if we don't do it now?"_

The pattern: assistant treats "loop is conceptually over" as license to defer remaining actionable items to a hypothetical future session, even when (a) the user is actively engaged, (b) the items are cheap, and (c) deferring loses the in-context state that would make the items quicker now than later.

This is **lazy deferral** in the ADR-044 sense — sub-contracting decisions or actions to a future surface that may never materialise. It composes with P130's "treat the user as transient" framing but inverts the failure mode: P130 corrects the AFK case (user not present → don't ask), this ticket captures the interactive case (user present → don't defer).

The correction signal hook detected the user's pushback ("DON'T") and routed the offer-ticket-capture-first response correctly per P078, which is how this ticket came to be captured.

## Symptoms

- After completing a multi-iter `/wr-itil:work-problems` session OR a substantive piece of work, assistant emits a wrap-up summary listing 3-5+ follow-up items as "for next session".
- The items are mechanical and individually short (push, file an upstream issue, run a verification command).
- The user is observably present (just answered a question, just clarified scope, just gave direction).
- Assistant does NOT offer to do the items now; assistant does NOT ask via `AskUserQuestion` "want me to do these now or defer?".
- User has to explicitly push back to get the items actioned.

## Workaround

User explicitly says "do it now" / "don't defer" / equivalent. The correction-signal hook then catches the pushback and routes the assistant to act.

This is exactly the manual-policing-AI-output friction P078 closes for one class of correction (capture-on-correction); this ticket extends the framing to the "defer-vs-act-now" axis.

## Impact Assessment

(deferred to investigation)

## Root Cause Analysis

### Initial hypothesis

The assistant's wrap-up framing ("ALL_DONE", "Session Wrap") treats the orchestrator's conceptual stop point as the same as the user's session end. The two are different: the orchestrator may have a stop-condition fire (no actionable backlog), but the user may still want to clear adjacent cleanup work while the in-context state is hot.

Possible structural fixes:

1. **Pre-`ALL_DONE` action audit**: before emitting `ALL_DONE`, scan the "Outstanding for next session" list and `AskUserQuestion` whether to action items now vs defer. The cap of 4 questions per call means only the top-priority items surface; the rest stay deferred.
2. **Reframe the wrap-up**: emit the wrap-up summary AS A QUESTION ("Loop is complete; 4 follow-up items remain — action which now?") rather than as a statement.
3. **Default to action**: when the in-session state still has the relevant skills loaded and the user is observably present, default to action; emit "Defer" only when the user explicitly declines or when items genuinely require external context (a release window the user wants to control, a scheduled maintenance period).

## Decision (2026-06-04)

User direction at `/wr-itil:work-problems` iter 5 loop-end Step 2.4 gate (a) — clarifies the framing this ticket was missing:

> "At the AFK loop and the assistance stops then eventually I'm gonna come back and be at the keyboard ready to answer. The whole purpose of the [AFK loop] is to complete all the work that we can while I'm away and then surface the question so that when I come back, I can answer those questions and you can proceed."

**Resolved shape**: Option 3 "Default to action" — combined with Step 2.4 / 2.5 / 2.5b loop-end surfacing (already structurally in place per P341 — UNCONDITIONAL pre-`ALL_DONE` gate sequence).

**The composition**:

- **Inside an iter subprocess** (AFK by construction per ADR-032 subprocess-boundary) — do every mechanical follow-up item INLINE. Do NOT defer to "next session". P130 "treat user as transient" applies HERE (no AskUserQuestion mid-iter) — but mechanical work is not user-input; just do it.
- **At orchestrator-main-turn between iters** — same default-to-action discipline for mechanical orchestration overhead (push:watch, release:watch, README rotation). No defer.
- **At orchestrator-main-turn loop-end Step 2.4 gate (a)** — the documented framework-prescribed user-interaction surface. Accumulated user-answerable items from `outstanding_questions` queue surface as `AskUserQuestion` batch. The user is presumed at the keyboard at this gate.

**What this DOESN'T change**: the existing AFK iter prompt's "Do not call AskUserQuestion mid-iter" rule (P130). That rule is correct for iter subprocesses where the user genuinely IS away. The bug this ticket captures was that the SAME defer-everything framing was being applied at the wrap-up surface where the user IS coming back.

**Composes with**:

- **P341 / Step 2.4** — the unconditional pre-`ALL_DONE` gate that surfaces accumulated `outstanding_questions`. This is the structural answer to "where do user-input items go" — the queue, surfaced at gate (a).
- **P130** — applies INSIDE iter subprocesses (AFK by construction). Does NOT apply at orchestrator-main-turn loop-end where the user IS presumed back.
- **P078** — capture-on-correction signal hook; the same mechanism caught the original 2026-05-13 pushback. Orchestrator-level extension: if mechanical items are present at wrap-up time AND iter context is hot, route to action rather than defer.
- **ADR-044** — framework-resolution boundary already authorises the orchestrator to default-to-action for mechanical items between iters; this decision makes explicit that the same rule applies to WRAP-UP framing.

**Closing condition**: this ticket transitions to Verifying when the next AFK orchestrator iter's wrap-up framing emits "Completed N follow-ups" (or equivalent action-first language) rather than "Outstanding for next session" for mechanical items. The Step 2.4 gate (a) prose itself already implements the user-input surfacing half; the remaining gap is documentation hygiene in the wrap-up summary's framing words.

**Next iter should**: surface this resolution in a small SKILL.md edit to `/wr-itil:work-problems` Step 6 progress-report wording (or Step 2.4 final-summary wording) — flip "Outstanding for next session" → "Completed N follow-ups" for mechanical-action items; preserve "Outstanding for next session" only for user-answerable items that are about to surface at Step 2.4 gate (a).

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Decide on structural fix shape (Step 2.5 pre-`ALL_DONE` action audit vs reframe wrap-up vs default-to-action). May warrant an ADR.
- [ ] Compose with P130 (treat-user-as-transient) — the rules are inverses, not contradictions, and must compose cleanly.
- [ ] Compose with P078 (capture-on-correction OFFER) — the correction-signal pattern that surfaced THIS ticket is the same mechanism that should ideally surface the "defer vs act now" question proactively.

## Dependencies

- **Blocks**: (none direct; cleaner user experience for any post-loop work)
- **Blocked by**: (none)
- **Composes with**: P078 (correction-signal OFFER pattern), P130 (user-transience in AFK), ADR-044 (framework-resolution boundary; lazy deferral classification)

## Related

- **P078** (`docs/problems/078-assistant-does-not-offer-problem-ticket-on-user-correction.*.md`) — sibling pattern; this ticket is the "defer-vs-act-now" axis to P078's "capture-on-correction" axis.
- **P130** — "treat the user as transient" (AFK rule); inverse case applies in interactive context.
- **ADR-044** — framework-resolution boundary; lazy deferral is a category-3 failure (sub-contracting framework-resolvable actions back to a hypothetical future session).
- User pushback on 2026-05-13: "when is it going to happen if we don't do it now?" — the originating correction signal that triggered this capture.
- **Reported upstream**: [windyroad/agent-plugins#138](https://github.com/windyroad/agent-plugins/issues/138) (2026-05-17)

(captured via /wr-itil:capture-problem during /wr-itil:work-problems Step 2.5 follow-up work; expand at next investigation)

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/138
- **Reported**: 2026-05-17
- **Template used**: problem-report.yml (problem-first shape)
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes — upstream issue body includes `Downstream tracking: dry-aged-deps problem ticket P006 ... at commit 1eb7e98` and the adopter repo URL.
- **Gate audit trail**: `wr-voice-tone:external-comms` PASS (Surface-3 register match, no banned terms, sober register); `wr-risk-scorer:external-comms` PASS (no Confidential Information class matched). `gh issue create` invoked with `BYPASS_RISK_GATE=1` per P007's documented workaround (subagent sandbox lacks Bash to compute canonical SHA256 marker key). Both subagent PASS verdicts pre-dated the bypass.
