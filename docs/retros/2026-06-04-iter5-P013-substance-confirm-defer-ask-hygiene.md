# Ask Hygiene — 2026-06-04 iter 5 (P013 substance-confirm-defer)

AFK iter 5 of `/wr-itil:work-problems`. Per ADR-044 / ADR-013 Rule 6, the iter subprocess MUST NOT call `AskUserQuestion`; all direction-class observations queue to `.afk-run-state/outstanding-questions.jsonl` for orchestrator-main-turn Step 2.5 batched surfacing.

| Call # | Header | Classification | Citation |
| ------ | ------ | -------------- | -------- |
| —      | —      | —              | —        |

**Lazy count: 0**
**Direction count: 0** (queued to outstanding-questions.jsonl — not surfaced via AskUserQuestion per AFK contract)
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

Zero `AskUserQuestion` calls fired this iter. The ADR-074 substance-confirm-defer that drove the iter's outcome was queued as a `category: "direction"` entry in `.afk-run-state/outstanding-questions.jsonl` (P013 / three-class taxonomy substance + ADR-0018 lifecycle transition) for loop-end Step 2.5 batched surfacing — NOT asked mid-iter. This is the correct AFK behaviour per the iter-prompt constraint "NEVER call AskUserQuestion mid-loop in AFK".
