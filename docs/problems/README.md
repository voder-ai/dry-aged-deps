# Problem Backlog

> Last reviewed: 2026-06-04 — P014 transitioned Known Error → Verification Pending (`--exposure-aware-soak` flag implementing the locked Critical→0 / High→½ / Moderate-Low-None→default policy shipped in dry-aged-deps@2.12.0 today via the RFC-002 ship-train). WSJF top of queue: P022 / P010 / P017 / P023 tied at 6.0 (P014 dropped out per ADR-022 verifying-multiplier-0). Verification Queue: 3 (P021 — `no — not observed`; P025 — `yes — observed: ci-publish surface only`; P014 — `no — not observed`); P013 fix shipped but still awaits K→V flip.
> Run `/wr-itil:review-problems` to refresh WSJF rankings.

## WSJF Rankings

Dev-work queue only. Verification Pending (`.verifying.md`, WSJF multiplier 0) and Parked (`.parked.md`, multiplier 0) tickets are excluded per ADR-022 — surfaced in their own sections below. Rows render tier-first (Tier 0 Critical-bypass [Severity Very High ≥17 OR security-classified OR incident-linked] → Tier 1 Inbound-reported [`**Origin**: inbound-reported`] → Tier 2 Internal), then within each tier by `(WSJF desc, Known-Error-first, Effort-divisor asc, Reported-date asc, ID asc)` so top-to-bottom order matches `/wr-itil:work-problems` Step 3 selection 1:1 (P138 + ADR-076). The `Reported` and `Origin` columns MUST appear. <!-- REPORTED-FIRST-TIER-SOURCE: /wr-itil:work-problems SKILL.md Step 3 (ADR-076) -->

| WSJF | ID   | Title                                                                                                                                       | Severity   | Status      | Effort | Reported   | Origin                                                        |
| ---- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------- | ------ | ---------- | ------------------------------------------------------------- |
| 6.0  | P022 | commit-gate hook unstages files on "Pipeline state drift" block — manual re-stage needed after rescore                                      | 6 (Medium) | Open        | S      | 2026-05-30 | internal                                                      |
| 6.0  | P010 | manage-problem SKILL.md commit-message convention fails @commitlint/config-conventional subject-case rule                                   | 6 (Medium) | Known Error | M      | 2026-05-17 | internal                                                      |
| 6.0  | P017 | work-problems Step 0 reconcile-readme halt-route can't handle unscored-ticket MISSING drift                                                 | 6 (Medium) | Known Error | M      | 2026-05-30 | external (`@windyroad/itil`)                                  |
| 6.0  | P023 | external-comms gate marker re-hashes on every draft-body delta — forces redundant re-fire cycles per iter                                   | 6 (Medium) | Known Error | M      | 2026-06-02 | external (`@windyroad/risk-scorer` + `@windyroad/voice-tone`) |
| 4.5  | P013 | dry-aged-deps ignores the package.json overrides block — stale/vulnerable pins go undetected, override-fixable vulns mislabeled "unfixable" | 9 (Medium) | Known Error | L      | 2026-05-25 | internal                                                      |
| 4.0  | P019 | work-problems Step 5 subprocess JSON envelope's duration_ms can dramatically undercount — extend P089 Gap 2 authority hierarchy             | 4 (Low)    | Known Error | M      | 2026-05-30 | external (`@windyroad/itil`)                                  |
| 4.0  | P024 | external-comms gate cross-session marker dir mismatch — subagent PASS verdicts land in agent's own dir, main session's gate can't find them | 4 (Low)    | Known Error | M      | 2026-06-02 | external (`@windyroad/risk-scorer`)                           |
| 3.0  | P006 | assistant defers actionable items to "next session" instead of acting when the user is observably present                                   | 6 (Medium) | Open        | M      | 2026-05-13 | internal                                                      |
| 1.5  | P020 | `@windyroad/tdd` hook stem-match strict matching causes variant-named tests to fail to pair with their source modules                       | 3 (Low)    | Open        | M      | 2026-05-30 | external (`@windyroad/tdd`)                                   |

## Verification Queue

Fix released; awaiting user confirmation that the production behaviour matches the fix intent. Excluded from WSJF ranking per ADR-022. Sorted by `Released date ASC` (oldest at row 1; same-day releases tiebreak by ID ASC). `Likely verified?` carries the evidence-first cell per P186 (`yes — observed: <evidence>` / `no — not observed` / `no — observed regression`).

| ID   | Title                                                                                                                      | Released   | Likely verified?                                                                                                                                   |
| ---- | -------------------------------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| P021 | `calculateAgeInDays` hardcodes `Date.now()` — not injectable for testability                                               | 2026-06-02 | no — not observed                                                                                                                                  |
| P025 | GitHub Actions deprecating Node.js 20 on 2026-06-16 — v4 actions across all workflows will be force-migrated to Node.js 24 | 2026-06-03 | yes — observed: ci-publish exercised under v6 across 8+ pushes since fix shipped — all green; auto-update + claude workflows await natural trigger |
| P014 | the age soak is unconditional — it ignores the severity of the vulnerability the project is currently exposed to           | 2026-06-04 | no — not observed                                                                                                                                  |

P013 fix has also shipped but the ticket remains in `.known-error.md` pending an explicit `/wr-itil:transition-problems` K→V flip — that flip is sequenced across subsequent `/wr-itil:work-problems` iters per ADR-010 amended Skill Granularity rule.

## Parked

Excluded from WSJF ranking per the Parked policy in `/wr-itil:manage-problem` SKILL.md (multiplier 0). To un-park, `git mv` back to `.open.md` or `.known-error.md` once the un-park trigger fires.

| ID   | Title                                                                                  | Reason           | Parked since |
| ---- | -------------------------------------------------------------------------------------- | ---------------- | ------------ |
| P004 | `@windyroad/tdd` hook only recognises same-dir or `__tests__/` test associations       | upstream-blocked | 2026-05-16   |
| P005 | `wr-voice-tone:agent` returns FAIL when `docs/VOICE-AND-TONE.md` is missing            | upstream-blocked | 2026-05-16   |
| P007 | external-comms gate's sandboxed subagent reviewer cannot compute the SHA256 marker key | upstream-blocked | 2026-05-16   |
