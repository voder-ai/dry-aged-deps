# Problem Backlog

> Last reviewed: 2026-05-14 **README reconciled** — 4 drift entries corrected: P004, P005, P006, P007. Reconciliation contract per P118 + ADR-014 amended ("Reconciliation as preflight robustness layer").
> Run `/wr-itil:review-problems` to refresh WSJF rankings.

## WSJF Rankings

Dev-work queue only. Verification Pending (`.verifying.md`, WSJF multiplier 0) and Parked (`.parked.md`, multiplier 0) tickets are excluded per ADR-022 — surfaced in their own sections below. Rows sort by `(WSJF desc, Known-Error-first, Effort-divisor asc, Reported-date asc, ID asc)` so top-to-bottom order matches `/wr-itil:work-problems` Step 3 tie-break selection 1:1 (P138). The `Reported` column MUST appear.

| WSJF | ID   | Title                                                                                                     | Severity   | Status | Effort | Reported   |
| ---- | ---- | --------------------------------------------------------------------------------------------------------- | ---------- | ------ | ------ | ---------- |
| 1.5  | P004 | `@windyroad/tdd` hook only recognises same-dir or `__tests__/` test associations                          | 3 (Medium) | Open   | M      | 2026-05-13 |
| 1.5  | P005 | `wr-voice-tone:agent` returns FAIL when `docs/VOICE-AND-TONE.md` is missing                               | 3 (Medium) | Open   | M      | 2026-05-13 |
| 1.5  | P006 | assistant defers actionable items to "next session" instead of acting when the user is observably present | 3 (Medium) | Open   | M      | 2026-05-13 |
| 1.5  | P007 | external-comms gate's sandboxed subagent reviewer cannot compute the SHA256 marker key                    | 3 (Medium) | Open   | M      | 2026-05-13 |

## Verification Queue

Fix released; awaiting user confirmation that the production behaviour matches the fix intent. Excluded from WSJF ranking per ADR-022. Sorted by `Released date ASC` (oldest at row 1; same-day releases tiebreak by ID ASC) per P150 — older entries are the most likely-verified candidates to close first.

| ID   | Title                                                     | Released   | Verification trigger                                                                                                                                                                                                                                                                                                                                     |
| ---- | --------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P002 | push:watch's release-trigger heuristic is empty post-push | 2026-05-13 | Next `npm run push:watch` that includes a `feat:` / `fix:` / `BREAKING CHANGE:` commit prints "Commits include release-triggering types" (not the false miss). _Observed verified during v2.7.1 drain — final confirmation on next release-triggering push._                                                                                             |
| P001 | dry-aged-deps --update skips exact-pinned dependencies    | 2026-05-13 | Next `node ./bin/dry-aged-deps.js --update --yes` against a project with an exact-pinned, mature, vulnerability-free dependency (e.g. lift the `globals` entry from `.dry-aged-deps.json` exclude list and re-run) writes the `latest` version into `package.json` (not `current`) and prints `${current} → ${latest}` in the preview (no `X → X` line). |
