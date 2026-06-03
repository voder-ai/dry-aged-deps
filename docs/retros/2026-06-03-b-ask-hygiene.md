# Ask Hygiene Trail — 2026-06-03-b (orchestrator main turn)

Per P135 Phase 5 / ADR-044. Today's `2026-06-03-ask-hygiene.md` captures AFK iter-subprocess retros (each emitted zero calls). This `-b` file captures the orchestrator main-turn calls.

## Ask Hygiene

| Call # | Header                                     | Classification      | Citation                                                                                                                                                                                                                       |
| ------ | ------------------------------------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1      | P011 close / P012 close (batched)          | direction × 2       | `Gap: Step 4.6 relevance-close pass CLOSE-CANDIDATE-WITH-CAVEAT verdicts; framework cannot resolve user intent on close-vs-keep without evidence review per ADR-079 Phase 2 surface-batch-confirm flow.`                       |
| 2      | P011 close (re-ask with upstream evidence) | correction-followup | `Gap: user answered "Tell me more about this" on call 1 → re-ask with cite of upstream-fix evidence (hook renamed; 6 capture commits via RISK_BYPASS trailer). Re-ask shape is correction-followup per ADR-044 cat. 6 / P078.` |

**Lazy count: 0**
**Direction count: 2**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 1**

## Notes

- Zero lazy AskUserQuestion calls — framework-resolution boundary held cleanly.
- Call 1 (batched P011 + P012) was the relevance-close pass's user-confirmation surface per ADR-079 Phase 2.
- Call 2 (P011 re-ask) was the correction-followup after the user requested more context.
- The 9 AFK iters dispatched via `claude -p` subprocess made ZERO `AskUserQuestion` calls (AFK contract).

## Trend

- 2026-06-02: lazy=0 (RFC-001 ship + JTBD ratification)
- 2026-06-02 (b): lazy=0 (orchestrator-main-turn retro)
- 2026-06-03 (this file): lazy=0 (RFC-002 ship + P011/P012 close)

R6 numeric gate (≥2 lazy across 3 consecutive retros): NOT FIRED. Streak: 3 consecutive retros at lazy=0.
