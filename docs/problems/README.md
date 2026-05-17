# Problem Backlog

> Last reviewed: 2026-05-17 — P010 captured (manage-problem SKILL.md commit-message convention `docs(problems): P<NNN> <verb> — ...` fails `@commitlint/config-conventional` subject-case rule; working shape is `<verb> P<NNN>` confirmed 3x in today's AFK loop). Captured at deferred Priority/Effort placeholders; re-rate at next `/wr-itil:review-problems`. Upstream report pending. Dev-work queue top: P006 (WSJF 3.0). Verification Queue: 1 (P009). Parked: 3 (P004, P005, P007).
> Run `/wr-itil:review-problems` to refresh WSJF rankings.

## WSJF Rankings

Dev-work queue only. Verification Pending (`.verifying.md`, WSJF multiplier 0) and Parked (`.parked.md`, multiplier 0) tickets are excluded per ADR-022 — surfaced in their own sections below. Rows sort by `(WSJF desc, Known-Error-first, Effort-divisor asc, Reported-date asc, ID asc)` so top-to-bottom order matches `/wr-itil:work-problems` Step 3 tie-break selection 1:1 (P138). The `Reported` column MUST appear.

| WSJF | ID   | Title                                                                                                     | Severity   | Status | Effort | Reported   |
| ---- | ---- | --------------------------------------------------------------------------------------------------------- | ---------- | ------ | ------ | ---------- |
| 3.0  | P006 | assistant defers actionable items to "next session" instead of acting when the user is observably present | 6 (Medium) | Open   | M      | 2026-05-13 |
| 1.5  | P010 | manage-problem SKILL.md commit-message convention fails @commitlint/config-conventional subject-case rule | 3 (Low)    | Open   | M      | 2026-05-17 |

## Verification Queue

Fix released; awaiting user confirmation that the production behaviour matches the fix intent. Excluded from WSJF ranking per ADR-022. Sorted by `Released date ASC` (oldest at row 1; same-day releases tiebreak by ID ASC) per P150 — older entries are the most likely-verified candidates to close first. `Likely verified?` marks tickets ≥14 days old (P048 Candidate 4 default).

| ID   | Title                                                                  | Released   | Likely verified? |
| ---- | ---------------------------------------------------------------------- | ---------- | ---------------- |
| P009 | Edit-tool markdown writes skip prettier; pre-commit format:check fails | 2026-05-17 | no               |

## Parked

Excluded from WSJF ranking per the Parked policy in `/wr-itil:manage-problem` SKILL.md (multiplier 0). To un-park, `git mv` back to `.open.md` or `.known-error.md` once the un-park trigger fires.

| ID   | Title                                                                                  | Reason           | Parked since |
| ---- | -------------------------------------------------------------------------------------- | ---------------- | ------------ |
| P004 | `@windyroad/tdd` hook only recognises same-dir or `__tests__/` test associations       | upstream-blocked | 2026-05-16   |
| P005 | `wr-voice-tone:agent` returns FAIL when `docs/VOICE-AND-TONE.md` is missing            | upstream-blocked | 2026-05-16   |
| P007 | external-comms gate's sandboxed subagent reviewer cannot compute the SHA256 marker key | upstream-blocked | 2026-05-16   |
