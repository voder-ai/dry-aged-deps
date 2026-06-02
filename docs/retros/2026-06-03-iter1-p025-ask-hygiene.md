# Ask Hygiene Trail — 2026-06-03 iter 1 (P025 v4→v6 workflow migration)

Persisted by `/wr-retrospective:run-retro` Step 2d per P135 Phase 5 / ADR-044. Consumed by `packages/retrospective/scripts/check-ask-hygiene.sh` for cross-session trend.

## AskUserQuestion calls this session

| Call # | Header | Classification | Citation |
| ------ | ------ | -------------- | -------- |

(no calls — AFK mode forbids AskUserQuestion mid-iter per P135 / ADR-044; orchestrator's instructions specified queueing per the 6-class taxonomy at `ITERATION_SUMMARY.outstanding_questions` instead)

**Lazy count: 0**
**Direction count: 0**
**Deviation-approval count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

## Framework-resolved decisions made silently in this iter (audit trail)

Per ADR-044 framework-resolution boundary — decisions that COULD have been asked but were framework-resolved instead. Each cites the resolving artefact.

| Decision                                        | Resolution                                                  | Framework citation                                                                                                                                                                                  |
| ----------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `v5` vs `v6` migration target                   | Picked `v6` (latest stable major; `v5` upstream-superseded) | `gh api /repos/actions/{checkout,setup-node}/releases/latest` — v6.0.3 + v6.4.0 both non-prerelease; CLAUDE.md "Pick one, don't ask when order doesn't matter" memory; architect APPROVE 2026-06-03 |
| Amend vs new commit after P022 unstaging        | Amended (4 files in single commit per ADR-014)              | ADR-014 single-commit grain; commit 3f881da had not been pushed; P022 unstaging is the only reason workflow files weren't in the original commit                                                    |
| Codeql-action / claude-code-action out of scope | Deferred to separate tickets if Node-20-affected            | P025 ticket scope explicitly enumerated 7 (actual 8) checkout + setup-node refs; codeql-action + third-party action not in scope                                                                    |
| Subject-case workaround for transition commit   | Verb-first "transition P025 open → known error"             | P010 commitlint subject-case rule; orchestrator's "verb-first per P010 commitlint workaround" instruction                                                                                           |
| Append P063 marker on non-actionable upstream   | Wrote framework-default marker per skill SKILL.md           | transition-problem SKILL.md Step 5 "AFK and interactive modes use identical behaviour — silent-default-with-recovery-path"; ADR-044 framework-resolution boundary                                   |
| Update WSJF on transition or trust existing     | Left WSJF unchanged at 6.0                                  | transition-problem SKILL.md Step 7 "render, not re-rank" doctrine; precedent P021 (KE S WSJF 3.0 — same Open-formula value carried after KE transition)                                             |

All decisions are reversible via the documented recovery paths (problem-ticket re-edit, `/wr-itil:transition-problem` flip-back, manual subject-line edit).
