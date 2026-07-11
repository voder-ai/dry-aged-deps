# Problem Backlog

> Last reviewed: 2026-07-11 **P027 known error** — confirmed external root cause (`@windyroad/itil` work-problems SKILL Step 5 P147 halt-contract prose, still present in installed 0.57.2); Origin corrected internal→external, transitioned Open→Known Error (WSJF 6.0), upstream report pending. Fix-shape choice (candidates 1/2/3) queued as a direction-setting question for the user.
> Run `/wr-itil:review-problems` to refresh WSJF rankings.

## WSJF Rankings

Dev-work queue only. Verification Pending (`.verifying.md`, WSJF multiplier 0) and Parked (`.parked.md`, multiplier 0) tickets are excluded per ADR-022 — surfaced in their own sections below. Rows render tier-first (Tier 0 Critical-bypass [Severity Very High ≥17 OR security-classified OR incident-linked] → Tier 1 Inbound-reported [`**Origin**: inbound-reported`] → Tier 2 Internal), then within each tier by `(WSJF desc, Known-Error-first, Effort-divisor asc, Reported-date asc, ID asc)` so top-to-bottom order matches `/wr-itil:work-problems` Step 3 selection 1:1 (P138 + ADR-076). The `Reported` and `Origin` columns MUST appear. <!-- REPORTED-FIRST-TIER-SOURCE: /wr-itil:work-problems SKILL.md Step 3 (ADR-076) -->

| WSJF | ID   | Title                                                                                                                                       | Severity   | Status      | Effort | Reported   | Origin                                                        |
| ---- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------- | ------ | ---------- | ------------------------------------------------------------- |
| 6.0  | P017 | work-problems Step 0 reconcile-readme halt-route can't handle unscored-ticket MISSING drift                                                 | 6 (Medium) | Known Error | M      | 2026-05-30 | external (`@windyroad/itil`)                                  |
| 6.0  | P023 | external-comms gate marker re-hashes on every draft-body delta — forces redundant re-fire cycles per iter                                   | 6 (Medium) | Known Error | M      | 2026-06-02 | external (`@windyroad/risk-scorer` + `@windyroad/voice-tone`) |
| 6.0  | P027 | orchestrator halts AFK work-problems loop at P147 stuck-before-emit despite verified work integrity                                         | 6 (Medium) | Known Error | M      | 2026-06-05 | external (`@windyroad/itil`)                                  |
| 4.0  | P019 | work-problems Step 5 subprocess JSON envelope's duration_ms can dramatically undercount — extend P089 Gap 2 authority hierarchy             | 4 (Low)    | Known Error | M      | 2026-05-30 | external (`@windyroad/itil`)                                  |
| 4.0  | P024 | external-comms gate cross-session marker dir mismatch — subagent PASS verdicts land in agent's own dir, main session's gate can't find them | 4 (Low)    | Known Error | M      | 2026-06-02 | external (`@windyroad/risk-scorer`)                           |
| 4.0  | P022 | commit-gate hook unstages files on "Pipeline state drift" block — manual re-stage needed after rescore                                      | 4 (Low)    | Open        | S      | 2026-05-30 | internal                                                      |
| 3.0  | P032 | oversight-marker helper's 24h SID window blocks born-confirmed ADR/JTBD writes on long sessions                                             | 6 (Medium) | Open        | M      | 2026-07-11 | external (`@windyroad/wr-architect` + `@windyroad/wr-jtbd`)   |
| 1.5  | P020 | `@windyroad/tdd` hook stem-match strict matching causes variant-named tests to fail to pair with their source modules                       | 3 (Low)    | Open        | M      | 2026-05-30 | external (`@windyroad/tdd`)                                   |
| 1.5  | P026 | `@windyroad/tdd` hook per-session IDLE state blocks multi-session RED→GREEN impl edits                                                      | 3 (Medium) | Open        | M      | 2026-06-05 | external (`@windyroad/tdd` hook contract)                     |
| 1.5  | P029 | dry-aged-deps should detect deprecated dependencies and surface them loudly (verbatim message, no auto-remediation)                         | 3 (Medium) | Open        | M      | 2026-06-17 | internal                                                      |

## Verification Queue

Fix released; awaiting user confirmation that the production behaviour matches the fix intent. Excluded from WSJF ranking per ADR-022. Sorted by `Released date ASC` (oldest at row 1; same-day releases tiebreak by ID ASC). `Likely verified?` carries the evidence-first cell per P186 (`yes — observed: <evidence>` / `no — not observed` / `no — observed regression`).

| ID   | Title                                                                                                                                    | Released   | Likely verified?                                                               |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------ |
| P006 | assistant defers actionable items to "next session" instead of acting when the user is observably present                                | 2026-06-04 | yes — observed: this iter's action-first orchestration (upstream itil@0.47.9)  |
| P014 | the age soak is unconditional — it ignores the severity of the vulnerability the project is currently exposed to                         | 2026-06-04 | no — not observed                                                              |
| P013 | dry-aged-deps ignores the package.json overrides block — stale/vulnerable pins undetected, override-fixable vulns mislabeled "unfixable" | 2026-07-08 | no — not observed                                                              |
| P030 | `dry-aged-deps --update` leaves package-lock.json stale, breaking `npm ci` for adopters                                                  | 2026-07-08 | no — not observed                                                              |
| P028 | dry-aged-deps --update should flag and skip un-landable updates (incompatible peer deps / ERESOLVE)                                      | 2026-07-10 | no — not observed                                                              |
| P031 | JSON/XML `recommended` field reports `wanted`, not the safe update target                                                                | 2026-07-11 | yes — observed: RED→GREEN test on exact-pin fixture, full 387-test suite green |

## Parked

Excluded from WSJF ranking per the Parked policy in `/wr-itil:manage-problem` SKILL.md (multiplier 0). To un-park, `git mv` back to `.open.md` or `.known-error.md` once the un-park trigger fires.

| ID   | Title                                                                                  | Reason           | Parked since |
| ---- | -------------------------------------------------------------------------------------- | ---------------- | ------------ |
| P004 | `@windyroad/tdd` hook only recognises same-dir or `__tests__/` test associations       | upstream-blocked | 2026-05-16   |
| P005 | `wr-voice-tone:agent` returns FAIL when `docs/VOICE-AND-TONE.md` is missing            | upstream-blocked | 2026-05-16   |
| P007 | external-comms gate's sandboxed subagent reviewer cannot compute the SHA256 marker key | upstream-blocked | 2026-05-16   |
| P010 | manage-problem SKILL.md commit-message convention fails commitlint subject-case rule   | upstream-blocked | 2026-07-11   |
