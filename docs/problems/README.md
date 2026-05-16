# Problem Backlog

> Last reviewed: 2026-05-16 — P008 **closed**. Verified end-to-end via workflow run 25953546547: Push branch succeeded, PR #8 opened by `app/claude`, auto-merge enabled, `Build & Test` passed, PR auto-merged to main (commit `d8d80b9`). ADR-0009 §Confirmation criterion 4 satisfied. Autonomous loop is now load-bearing — daily cron can be armed in a follow-up.
> Run `/wr-itil:review-problems` to refresh WSJF rankings.

## WSJF Rankings

Dev-work queue only. Verification Pending (`.verifying.md`, WSJF multiplier 0) and Parked (`.parked.md`, multiplier 0) tickets are excluded per ADR-022 — surfaced in their own sections below. Rows sort by `(WSJF desc, Known-Error-first, Effort-divisor asc, Reported-date asc, ID asc)` so top-to-bottom order matches `/wr-itil:work-problems` Step 3 tie-break selection 1:1 (P138). The `Reported` column MUST appear.

| WSJF | ID   | Title                                                                                                     | Severity     | Status      | Effort | Reported   |
| ---- | ---- | --------------------------------------------------------------------------------------------------------- | ------------ | ----------- | ------ | ---------- |
| 16.0 | P004 | `@windyroad/tdd` hook only recognises same-dir or `__tests__/` test associations                          | 8 (Medium)   | Known Error | S      | 2026-05-13 |
| 10.0 | P007 | external-comms gate's sandboxed subagent reviewer cannot compute the SHA256 marker key                    | 10 (High)    | Known Error | M      | 2026-05-13 |
| 4.0  | P005 | `wr-voice-tone:agent` returns FAIL when `docs/VOICE-AND-TONE.md` is missing                               | 2 (Very Low) | Known Error | S      | 2026-05-13 |
| 3.0  | P006 | assistant defers actionable items to "next session" instead of acting when the user is observably present | 6 (Medium)   | Open        | M      | 2026-05-13 |

## Verification Queue

Fix released; awaiting user confirmation that the production behaviour matches the fix intent. Excluded from WSJF ranking per ADR-022. Sorted by `Released date ASC` (oldest at row 1; same-day releases tiebreak by ID ASC) per P150 — older entries are the most likely-verified candidates to close first. `Likely verified?` marks tickets ≥14 days old (P048 Candidate 4 default).

| ID   | Title                                                     | Released   | Likely verified? | Verification trigger                                                                                                                                                                                                                                         |
| ---- | --------------------------------------------------------- | ---------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P002 | push:watch's release-trigger heuristic is empty post-push | 2026-05-13 | no (3 days)      | Next `npm run push:watch` that includes a `feat:` / `fix:` / `BREAKING CHANGE:` commit prints "Commits include release-triggering types" (not the false miss). _Observed verified during v2.7.1 drain — final confirmation on next release-triggering push._ |
