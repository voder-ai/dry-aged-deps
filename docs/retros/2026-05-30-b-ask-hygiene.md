# Ask Hygiene Trail — 2026-05-30-b (orchestrator main turn)

Per P135 Phase 5 / ADR-044. This file captures the AskUserQuestion calls made by the orchestrator's main turn during the second `/wr-retrospective:run-retro` invocation of 2026-05-30 (post-AFK-loop session-wrap retro that consumed the work of iters 1-5 + cron-arming + ADR-0020 supersession + JTBD ratification + intake scaffold + RFC-001 doc-hygiene). The earlier `2026-05-30-ask-hygiene.md` file captures iter-4-subprocess-specific calls; this file is the parent-session counterpart.

## Ask Hygiene

| Call # | Header                                   | Classification      | Citation                                                                                                                                                                                                                                                                                                                          |
| ------ | ---------------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | Persona / JTBD-103/104/106               | direction × 4       | `Gap: ratification of unconfirmed JTBDs/persona is a load-bearing direction question per ADR-074 substance-confirm-before-build — about to be built on by ci-automation-engineer cron-arming edit; framework cannot resolve user-intent for whether the auto-derived persona/JTBDs reflect real need.`                            |
| 2      | ADR-0015 / ADR-014 / Commit seq / Intake | direction × 4       | `Gap: loop-end Step 2.5 batched-accumulation surface for direction-class questions surfaced from AFK iters 1-4; framework-resolved deferral routes them here for user resolution before next AFK loop.`                                                                                                                           |
| 3      | Test placement (plain English re-ask)    | correction-followup | `Gap: prior call (loop-end batched) used internal-terminology shorthand ("third trigger forcing function") that the user could not parse — explicit correction "You need to explain more. I don't know what those ids mean." Re-ask in plain English is correction-followup per ADR-044 category 6 / P078 capture-on-correction.` |
| 4      | Move scope                               | direction           | `Gap: scope of test relocation is a substance-of-decision choice the framework cannot resolve (one-shot vs organic vs subdir-pattern); user owns the convention shift.`                                                                                                                                                           |
| 5      | ADR shape                                | direction           | `Gap: architect surfaced supersession-vs-amend as a substance decision needing user direction per ADR-011 lifecycle § proposed→superseded path (first transition of this kind in this repo); framework cannot resolve the ceremony-vs-categorical-inversion trade-off.`                                                           |

**Lazy count: 0**
**Direction count: 10**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 1**

## Notes

- Zero lazy AskUserQuestion calls — the framework-resolution boundary held across all 11 questions. Every call is grounded by an explicit `Gap:` citation per ADR-044 § Step 2d Ask Hygiene Pass.
- Call 3 (correction-followup) is a P078 / P132 inverse — the agent's first phrasing used internal jargon the user couldn't parse, and the user issued an authentic correction. The retro records the correction; future framing of similar choices should lead with plain-English context, not project shorthand.
- All 4 categorically distinct decision types fired (direction × 4 surfaces — JTBD ratification, ADR shape, relocation scope, doc hygiene; correction-followup × 1). No deviation-approval, override, silent-framework, or taste calls this retro — those classes were absent because no existing decision was contradicted, no rule-one-time-bent, no new territory unmapped (the framework had clear places for everything), and no novel-artefact taste decision arose.
