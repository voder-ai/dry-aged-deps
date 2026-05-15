# Problem Backlog

> Last reviewed: 2026-05-15 — P008 verification pending again (layer-2 fix). Push branch step swapped from `git -c http.extraheader=bearer` to URL-embedded `x-access-token` basic auth (P008 candidate 3) — the GitHub-documented auth scheme for App installation tokens over git transport. v2.7.2's `persist-credentials: false` stays on the Checkout step. Awaiting one more `gh workflow run auto-update.yml` dispatch to confirm Push branch succeeds end-to-end.
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

| ID   | Title                                                                 | Released   | Likely verified? | Verification trigger                                                                                                                                                                                                                                                                                                                               |
| ---- | --------------------------------------------------------------------- | ---------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P002 | push:watch's release-trigger heuristic is empty post-push             | 2026-05-13 | no (2 days)      | Next `npm run push:watch` that includes a `feat:` / `fix:` / `BREAKING CHANGE:` commit prints "Commits include release-triggering types" (not the false miss). _Observed verified during v2.7.1 drain — final confirmation on next release-triggering push._                                                                                       |
| P008 | auto-update workflow push fails with duplicate `Authorization` header | 2026-05-15 | no (0 days)      | Single `gh workflow run auto-update.yml` dispatch on a state with at least one safe update: Push branch succeeds (no auth error), Open pull request runs, a PR appears authored by the Claude Code GitHub App identity (not `github-actions[bot]`), and the PR triggers `ci-publish.yml`'s `pull_request` workflows (ADR-0009 §c4 + ADR-0012 §c4). |
