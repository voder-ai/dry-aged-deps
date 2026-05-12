# Problem Backlog

> Last reviewed: 2026-05-13 — P003 transitioned Known Error → Verification Pending (fix landed: `.husky/pre-commit` now runs `format:check` per ADR-0013; awaiting user verification of clean post-commit working tree).
> Run `/wr-itil:review-problems` to refresh WSJF rankings.

## WSJF Rankings

Dev-work queue only. Verification Pending (`.verifying.md`, WSJF multiplier 0) and Parked (`.parked.md`, multiplier 0) tickets are excluded per ADR-022 — surfaced in their own sections below. Rows sort by `(WSJF desc, Known-Error-first, Effort-divisor asc, Reported-date asc, ID asc)` so top-to-bottom order matches `/wr-itil:work-problems` Step 3 tie-break selection 1:1 (P138). The `Reported` column MUST appear.

| WSJF | ID   | Title                                                     | Severity   | Status      | Effort | Reported   |
| ---- | ---- | --------------------------------------------------------- | ---------- | ----------- | ------ | ---------- |
| 16.0 | P002 | push:watch's release-trigger heuristic is empty post-push | 8 (Medium) | Known Error | S      | 2026-05-13 |
| 16.0 | P001 | dry-aged-deps --update skips exact-pinned dependencies    | 16 (High)  | Known Error | M      | 2026-05-12 |

## Verification Queue

Fix released; awaiting user confirmation that the production behaviour matches the fix intent. Excluded from WSJF ranking per ADR-022.

| ID   | Title                                                                   | Released   | Verification trigger                                                                            |
| ---- | ----------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------- |
| P003 | husky pre-commit `prettier --write` leaves unstaged working-tree deltas | 2026-05-13 | Next substantive commit on this branch leaves `git status` clean (no unstaged prettier deltas). |
