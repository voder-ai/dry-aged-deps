# Problem Backlog

> Last reviewed: 2026-05-30 — P018 fix released → Verification Pending (`.husky/pre-commit` `--diff-filter` widened from `ACM` to `ACMR`; renamed-with-edit files now pass through auto-write; ADR-0016 Confirmation criterion #2 updated to lock new literal; 5 / 5 REQ-PRECOMMIT-AUTO-WRITE-RESTAGE tests passing GREEN). Dev-work queue top non-upstream-blocked: P012 (WSJF 4.0, Known Error, S — zsh migrate-problems-layout bashism). Verification Queue: 3 (P015, P016, P018 — all `no — not observed`). Parked: 3 (P004, P005, P007).
> Run `/wr-itil:review-problems` to refresh WSJF rankings.

## WSJF Rankings

Dev-work queue only. Verification Pending (`.verifying.md`, WSJF multiplier 0) and Parked (`.parked.md`, multiplier 0) tickets are excluded per ADR-022 — surfaced in their own sections below. Rows sort by `(WSJF desc, Known-Error-first, Effort-divisor asc, Reported-date asc, ID asc)` so top-to-bottom order matches `/wr-itil:work-problems` Step 3 tie-break selection 1:1 (P138). The `Reported` column MUST appear.

| WSJF | ID   | Title                                                                                                                                       | Severity     | Status      | Effort | Reported   |
| ---- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ----------- | ------ | ---------- |
| 6.0  | P010 | manage-problem SKILL.md commit-message convention fails @commitlint/config-conventional subject-case rule                                   | 6 (Medium)   | Known Error | M      | 2026-05-17 |
| 6.0  | P011 | P165 README-refresh PreCommit hook overrides /wr-itil:capture-problem's deferred-README contract                                            | 6 (Medium)   | Known Error | M      | 2026-05-17 |
| 4.0  | P012 | migrate-problems-layout.sh helper uses bashisms but /wr-itil:work-problems Step 0a SKILL.md doesn't specify bash — sourcing fails under zsh | 2 (Very Low) | Known Error | S      | 2026-05-17 |
| 3.0  | P006 | assistant defers actionable items to "next session" instead of acting when the user is observably present                                   | 6 (Medium)   | Open        | M      | 2026-05-13 |
| 3.0  | P017 | work-problems Step 0 reconcile-readme halt-route can't handle unscored-ticket MISSING drift                                                 | 6 (Medium)   | Open        | M      | 2026-05-30 |
| 2.25 | P013 | dry-aged-deps ignores the package.json overrides block — stale/vulnerable pins go undetected, override-fixable vulns mislabeled "unfixable" | 9 (Medium)   | Open        | L      | 2026-05-25 |
| 2.25 | P014 | the age soak is unconditional — it ignores the severity of the vulnerability the project is currently exposed to                            | 9 (Medium)   | Open        | L      | 2026-05-25 |
| 2.0  | P019 | work-problems Step 5 subprocess JSON envelope's duration_ms can dramatically undercount — extend P089 Gap 2 authority hierarchy             | 4 (Low)      | Open        | M      | 2026-05-30 |

## Verification Queue

Fix released; awaiting user confirmation that the production behaviour matches the fix intent. Excluded from WSJF ranking per ADR-022. Sorted by `Released date ASC` (oldest at row 1; same-day releases tiebreak by ID ASC) per P150 — older entries are the most likely-verified candidates to close first. `Likely verified?` carries the evidence-first cell per P186 (`yes — observed: <evidence>` / `no — not observed` / `no — observed regression`).

| ID   | Title                                                                              | Released   | Likely verified?  |
| ---- | ---------------------------------------------------------------------------------- | ---------- | ----------------- |
| P015 | test script has no wall-clock timeout — hung runner runs unbounded                 | 2026-05-30 | no — not observed |
| P016 | push:watch declares CI failure on network timeout — should verify with gh run view | 2026-05-30 | no — not observed |
| P018 | .husky/pre-commit auto-write hook's `--diff-filter=ACM` excludes R (renamed)       | 2026-05-30 | no — not observed |

## Parked

Excluded from WSJF ranking per the Parked policy in `/wr-itil:manage-problem` SKILL.md (multiplier 0). To un-park, `git mv` back to `.open.md` or `.known-error.md` once the un-park trigger fires.

| ID   | Title                                                                                  | Reason           | Parked since |
| ---- | -------------------------------------------------------------------------------------- | ---------------- | ------------ |
| P004 | `@windyroad/tdd` hook only recognises same-dir or `__tests__/` test associations       | upstream-blocked | 2026-05-16   |
| P005 | `wr-voice-tone:agent` returns FAIL when `docs/VOICE-AND-TONE.md` is missing            | upstream-blocked | 2026-05-16   |
| P007 | external-comms gate's sandboxed subagent reviewer cannot compute the SHA256 marker key | upstream-blocked | 2026-05-16   |
