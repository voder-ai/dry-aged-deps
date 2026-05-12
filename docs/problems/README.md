# Problem Backlog

> Last reviewed: 2026-05-13 — P001 transitioned Known Error → Verification Pending (fix landed: `src/update-packages.js applyUpdates()` now writes the 4th tuple element `latest` instead of the 3rd `wanted` per ADR-0014; preview line shows `${current} → ${latest}`; reproduction test at `src/update-packages.test.js`; spec language in `prompts/011.0-DEV-AUTO-UPDATE.md` REQ-SAFE-ONLY clarified). Dev-work queue is now empty.
> Run `/wr-itil:review-problems` to refresh WSJF rankings.

## WSJF Rankings

Dev-work queue only. Verification Pending (`.verifying.md`, WSJF multiplier 0) and Parked (`.parked.md`, multiplier 0) tickets are excluded per ADR-022 — surfaced in their own sections below. Rows sort by `(WSJF desc, Known-Error-first, Effort-divisor asc, Reported-date asc, ID asc)` so top-to-bottom order matches `/wr-itil:work-problems` Step 3 tie-break selection 1:1 (P138). The `Reported` column MUST appear.

_No open or known-error tickets._

## Verification Queue

Fix released; awaiting user confirmation that the production behaviour matches the fix intent. Excluded from WSJF ranking per ADR-022. Sorted by `Released date ASC` (oldest at row 1; same-day releases tiebreak by ID ASC) per P150 — older entries are the most likely-verified candidates to close first.

| ID   | Title                                                                   | Released   | Verification trigger                                                                                                                                                                                                                                                                                                                                     |
| ---- | ----------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P002 | push:watch's release-trigger heuristic is empty post-push               | 2026-05-13 | Next `npm run push:watch` that includes a `feat:` / `fix:` / `BREAKING CHANGE:` commit prints "Commits include release-triggering types" (not the false miss).                                                                                                                                                                                           |
| P003 | husky pre-commit `prettier --write` leaves unstaged working-tree deltas | 2026-05-13 | Next substantive commit on this branch leaves `git status` clean (no unstaged prettier deltas).                                                                                                                                                                                                                                                          |
| P001 | dry-aged-deps --update skips exact-pinned dependencies                  | 2026-05-13 | Next `node ./bin/dry-aged-deps.js --update --yes` against a project with an exact-pinned, mature, vulnerability-free dependency (e.g. lift the `globals` entry from `.dry-aged-deps.json` exclude list and re-run) writes the `latest` version into `package.json` (not `current`) and prints `${current} → ${latest}` in the preview (no `X → X` line). |
