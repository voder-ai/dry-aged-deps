# Ask Hygiene — iter 6 P006 K→V (2026-06-04)

Per ADR-044 (Decision-Delegation Contract — framework-resolution boundary) + Step 2d of `/wr-retrospective:run-retro`. Per-session classification of agent `AskUserQuestion` calls; lazy-count is the regression metric.

## Classifications

| Call # | Header                               | Classification | Citation                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------ | ------------------------------------ | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| —      | (no AskUserQuestion calls this iter) | —              | iter ran as AFK `/wr-itil:work-problems` subprocess per `claude -p` — orchestrator prompt explicitly forbade AskUserQuestion mid-loop (P130 / P135 / ADR-044 AFK carve-out). `/wr-risk-scorer:assess-release` skill internally had an AskUserQuestion branch but it did NOT fire because all three pipeline-risk layers scored within appetite (commit=2, push=1, release=1 — well below the ≥ 5 above-appetite threshold). |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

## Trend context

Iter 6 of the 2026-06-04 AFK session. Prior iters' lazy counts are recorded in sibling `2026-06-04-iter<N>-*-ask-hygiene.md` files. R6 numeric gate fires when ≥ 2 lazy calls observed across 3 consecutive retros — this iter contributes 0 to that window. The `packages/retrospective/scripts/check-ask-hygiene.sh` script (when adopter-available) consumes these files for cross-session trend.
