# Ask Hygiene — AFK iter 9 (RFC-002 T9 ship-signal + verifying transition)

**Date**: 2026-06-03
**Iter**: 9 (final RFC-002 work-unit — Work-unit 1 = `feat:` ship-signal commit `07311a1`; Work-unit 2 = `docs(rfcs):` in-progress → verifying transition `d5ff125`)

## Calls

| Call # | Header | Classification | Citation |
| ------ | ------ | -------------- | -------- |

(no AskUserQuestion calls this iter — AFK discipline preserved per P135 / ADR-044.)

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

## Notes

- Work-unit 1 was the second-half of the RFC-002 ship-signal pattern: T6 (`a83ccf3`) had already documented `--exposure-aware-soak` in the README under `docs:`, so the iter 9 `feat:` commit needed an alternative discoverability surface. The architect gate confirmed the shape (i) recommendation from the task brief ("What's new" pointer near top of README) was within CLAUDE.md §"Multi-iter feature ship-signal"'s "equivalent user-facing surface" language. No ambiguity that warranted an ask — the framework resolved the question.
- Work-unit 2 was a mechanical lifecycle transition via `/wr-itil:manage-rfc` — no decisions to ask about. The skill's I1 hard-block (P014 trace resolves) + per-transition pre-flight (all tasks `[x]`, `## Verification` section drafted) ran cleanly.
- Both commits cleared the full gate stack (architect / JTBD / voice-tone / external-comms risk + voice-tone / pipeline-risk) without firing any gate-driven question — every gate returned PASS or PASS-WITH-NOTES.
