# Problem Backlog

> Last reviewed: 2026-05-13 — P002 transitioned Known Error → Verification Pending (fix landed: `scripts/push-watch.sh` now captures `PRE_PUSH_REMOTE=$(git rev-parse @{push})` before push so the release-trigger heuristic uses `${PRE_PUSH_REMOTE}..HEAD` instead of the post-push-empty `@{push}..` range; awaiting user verification on the next release-triggering push).
> Run `/wr-itil:review-problems` to refresh WSJF rankings.

## WSJF Rankings

Dev-work queue only. Verification Pending (`.verifying.md`, WSJF multiplier 0) and Parked (`.parked.md`, multiplier 0) tickets are excluded per ADR-022 — surfaced in their own sections below. Rows sort by `(WSJF desc, Known-Error-first, Effort-divisor asc, Reported-date asc, ID asc)` so top-to-bottom order matches `/wr-itil:work-problems` Step 3 tie-break selection 1:1 (P138). The `Reported` column MUST appear.

| WSJF | ID   | Title                                                  | Severity  | Status      | Effort | Reported   |
| ---- | ---- | ------------------------------------------------------ | --------- | ----------- | ------ | ---------- |
| 16.0 | P001 | dry-aged-deps --update skips exact-pinned dependencies | 16 (High) | Known Error | M      | 2026-05-12 |

## Verification Queue

Fix released; awaiting user confirmation that the production behaviour matches the fix intent. Excluded from WSJF ranking per ADR-022. Sorted by `Released date ASC` (oldest at row 1; same-day releases tiebreak by ID ASC) per P150 — older entries are the most likely-verified candidates to close first.

| ID   | Title                                                                   | Released   | Verification trigger                                                                                                                                           |
| ---- | ----------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P002 | push:watch's release-trigger heuristic is empty post-push               | 2026-05-13 | Next `npm run push:watch` that includes a `feat:` / `fix:` / `BREAKING CHANGE:` commit prints "Commits include release-triggering types" (not the false miss). |
| P003 | husky pre-commit `prettier --write` leaves unstaged working-tree deltas | 2026-05-13 | Next substantive commit on this branch leaves `git status` clean (no unstaged prettier deltas).                                                                |
