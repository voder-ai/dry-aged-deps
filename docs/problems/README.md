# Problem Backlog

> Last reviewed: 2026-05-16 — P009 captured (Edit-tool markdown writes skip prettier; pre-commit format:check fails — observed ≥5 times in this retro's parent session). Captured at deferred Priority/Effort placeholders; re-rate at next `/wr-itil:review-problems`. Dev-work queue top: P004 (WSJF 16.0). Verification Queue empty.
> Run `/wr-itil:review-problems` to refresh WSJF rankings.

## WSJF Rankings

Dev-work queue only. Verification Pending (`.verifying.md`, WSJF multiplier 0) and Parked (`.parked.md`, multiplier 0) tickets are excluded per ADR-022 — surfaced in their own sections below. Rows sort by `(WSJF desc, Known-Error-first, Effort-divisor asc, Reported-date asc, ID asc)` so top-to-bottom order matches `/wr-itil:work-problems` Step 3 tie-break selection 1:1 (P138). The `Reported` column MUST appear.

| WSJF | ID   | Title                                                                                                     | Severity     | Status      | Effort | Reported   |
| ---- | ---- | --------------------------------------------------------------------------------------------------------- | ------------ | ----------- | ------ | ---------- |
| 16.0 | P004 | `@windyroad/tdd` hook only recognises same-dir or `__tests__/` test associations                          | 8 (Medium)   | Known Error | S      | 2026-05-13 |
| 10.0 | P007 | external-comms gate's sandboxed subagent reviewer cannot compute the SHA256 marker key                    | 10 (High)    | Known Error | M      | 2026-05-13 |
| 4.0  | P005 | `wr-voice-tone:agent` returns FAIL when `docs/VOICE-AND-TONE.md` is missing                               | 2 (Very Low) | Known Error | S      | 2026-05-13 |
| 3.0  | P006 | assistant defers actionable items to "next session" instead of acting when the user is observably present | 6 (Medium)   | Open        | M      | 2026-05-13 |
| 1.5  | P009 | Edit-tool markdown writes skip prettier; pre-commit format:check fails                                    | 3 (Low)      | Open        | M      | 2026-05-16 |

## Verification Queue

Fix released; awaiting user confirmation that the production behaviour matches the fix intent. Excluded from WSJF ranking per ADR-022. Sorted by `Released date ASC` (oldest at row 1; same-day releases tiebreak by ID ASC) per P150 — older entries are the most likely-verified candidates to close first. `Likely verified?` marks tickets ≥14 days old (P048 Candidate 4 default).

_Verification Queue is empty._
