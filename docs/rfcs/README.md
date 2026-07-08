# RFC Backlog

> Last reviewed: 2026-07-08 **RFC-003 verifying** — `--update` reconciles package-lock.json (P030 / ADR-0021); implementation shipped via `feat(update)`, awaiting release + downstream verification.
> Run `/wr-itil:manage-rfc review` to refresh WSJF rankings.

## WSJF Rankings

Dev-work queue only. Verifying (`.verifying.md`, WSJF multiplier 0) and Closed (`.closed.md`, multiplier 0) RFCs are excluded per ADR-060 — surfaced in their own sections below. Rows sort by `(WSJF desc, Status-priority, Reported-date asc, ID asc)` so top-to-bottom order matches the work-RFC selection contract per P138.

| WSJF | ID  | Title | Severity | Status | Effort | Reported |
| ---- | --- | ----- | -------- | ------ | ------ | -------- |

(none — all currently-tracked RFCs are in Verifying.)

## Verification Queue

Work shipped; awaiting user confirmation that the production behaviour matches the RFC intent. Excluded from WSJF ranking per ADR-060. Sorted by `Released date ASC` (oldest at row 1; same-day releases tiebreak by ID ASC) per P150 — older entries are the most likely-verified candidates to close first.

| ID      | Title                                   | Released   | Likely verified?                              |
| ------- | --------------------------------------- | ---------- | --------------------------------------------- |
| RFC-001 | Overrides Hygiene Module                | 2026-06-02 | no — not yet observed in a downstream project |
| RFC-002 | Exposure-Aware Severity-Scaled Age Soak | 2026-06-03 | no — not yet observed in a downstream project |
| RFC-003 | `--update` reconciles package-lock.json | 2026-07-08 | no — not yet observed in a downstream project |

## Closed

(none yet.)
