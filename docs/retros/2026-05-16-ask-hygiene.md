# Ask Hygiene Trail — 2026-05-16

Session retrospective per ADR-044. AskUserQuestion calls classified by authority taxonomy. Lazy count is the regression metric (target 0).

This file aggregates retros across the 2026-05-16 day. Each iteration appends a section under its own `## Iteration retro` heading.

---

## Iteration retro — AFK `/wr-itil:work-problems` (P004 park)

Scope: single AFK iteration that worked P004 (`@windyroad/tdd` hook only recognises same-dir or `__tests__/` test associations). The iter parked P004 as `upstream-blocked` because all local work is complete (upstream report filed at windyroad/agent-plugins#123 on 2026-05-13; ADR-0015 records the narrow co-location exception keeping the project unblocked) and the remaining investigation task is conditional on upstream shipping the test-mapping fix. Iteration explicitly forbids mid-loop `AskUserQuestion` (P135 / ADR-044); observations queue to `ITERATION_SUMMARY.outstanding_questions` instead.

| Call # | Header | Classification | Citation                                                                                                                                                   |
| ------ | ------ | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (none) | n/a    | n/a            | n/a — zero AskUserQuestion calls fired in this iteration per the AFK mid-loop prohibition (dispatch prompt: "NEVER call AskUserQuestion mid-loop in AFK"). |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

**Total: 0 calls**

Cross-session trend across all retros captured to date: interactive ~3 (2026-05-13 first half) → P003 AFK 0 → P002 AFK 0 → P001 AFK 0 → 2026-05-13 second half AFK ~6 with lazy=0 → P004 AFK 0 (this iter). R6 gate (≥2 lazy across 3 consecutive retros) NOT fired — five consecutive AFK iters with lazy=0.

### Session Retrospective — P004 iter

#### Briefing Changes

- No new entries added. Existing topic files already cover the gates exercised this iter (manage-problem Step 7 transition, P062 README refresh, P134 line-3 rotation, commit-gate via wr-risk-scorer:pipeline). Nothing new surfaced.
- Per-entry signal scoring deferred to next interactive retro per the same rationale as prior AFK iters (cited entries carry signal evidence; decay + cited-this-iter updates batch better in interactive mode).

#### Problems Created/Updated

- **P004** — transitioned `.known-error.md` → `.parked.md` per the Parked lifecycle entry in manage-problem SKILL.md (reason `upstream-blocked`). Status field updated to "Parked"; investigation checkbox for "File the upstream report" ticked (already complete via the pre-existing `## Reported Upstream` section); `## Parked` section appended with reason / un-park trigger / parked-since date. External-root-cause detection (P063) already-noted check passed via the pre-existing `## Reported Upstream` section — no prompt re-fire needed. README refresh per P062 removed P004 from WSJF Rankings (new dev-work queue top: P007 at WSJF 10.0); added Parked section listing P004; line 3 rotated per P134 single-fragment discipline (new line 339 bytes, well under 1024-byte soft cap). Commit `b107ce1`. Risk scored 1/1/0 per /wr-risk-scorer:pipeline.

#### Verification Candidates

(None this iter — no `.verifying.md` files exist in the corpus. The only `.verifying.md` candidates from prior iters all closed earlier this 2026-05-16 session.)

#### Pipeline Instability

| Signal                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Category                             | Citations                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Decision                                                                                                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Edit-tool markdown writes skip prettier; first `git commit` attempt blocked by pre-commit `format:check` failure on `docs/problems/README.md` (P009 verbatim). Applied known workaround: `npm run format` + `git add docs/problems/README.md` + retry commit. Second attempt succeeded clean.                                                                                                                                                                                                                                                   | Hook-protocol friction (repeat-work) | First commit attempt at `git commit -m "..."` → pre-commit exit 1 with `[warn] docs/problems/README.md`. Resolution: `npm run format` (re-formatted README.md trailing whitespace from manual table alignment), `git add docs/problems/README.md`, re-commit → succeeded as `b107ce1`.                                                                                                                                                                                                                                                                                                                                                                                       | appended to P009 (pending) — recorded in retro only this iter; user can fold the new evidence into the next P009 work iter. Existing ticket already names this exact symptom; this iter adds one more in-session occurrence. |
| commitlint `subject-case` rule rejects the manage-problem SKILL's documented `docs(problems): P<NNN> <status> — <summary>` convention because `P` is uppercase. First commit subject `docs(problems): P004 parked — ...` failed with `subject must not be sentence-case, start-case, pascal-case, upper-case`. Reworded to `docs(problems): park P004 — ...` (lowercase verb first) and succeeded. The SKILL example pattern (`P<NNN> known error`, `P<NNN> verification pending`) does not survive `@commitlint/config-conventional` defaults. | Skill-contract violations            | First commit attempt: subject `docs(problems): P004 parked — upstream-blocked on windyroad/agent-plugins#123` → commitlint exit 1, error `subject-case`. Reworded to `docs(problems): park P004 — upstream-blocked on windyroad/agent-plugins#123` → commitlint warning only (`footer-leading-blank`), commit succeeded. SKILL.md citation: `~/.claude/plugins/marketplaces/windyroad/packages/itil/skills/manage-problem/SKILL.md` lines 858-865 (commit message convention examples). Existing project commits use the `<verb> P<NNN>` shape successfully (`close P008`, `capture P009`, `park P004`); the SKILL's documented `P<NNN> <verb>` shape would fail every time. | flagged (non-interactive) — queue at outstanding_questions for ticket creation on return. Either upstream SKILL needs to flip examples to `<verb> P<NNN>` shape OR projects document the override.                           |
| JTBD currency advisory: clean — no `packages/` directory in this adopter-tree project (detector is plugin-suite-scoped; emits no output for adopter trees).                                                                                                                                                                                                                                                                                                                                                                                     | n/a                                  | `wr-retrospective-check-readme-jtbd-currency` exit 0, empty stdout.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | n/a — detector not applicable to this surface.                                                                                                                                                                               |

#### Context Usage (Cheap Layer)

| Bucket             | Bytes   | % of total | Δ vs prior                                           |
| ------------------ | ------- | ---------- | ---------------------------------------------------- |
| memory             | 217,269 | 41.4%      | +8,800 vs prior snapshot (208,469 → 217,269)         |
| decisions          | 174,722 | 33.3%      | +27,266 vs prior (147,456 → 174,722)                 |
| problems           | 62,322  | 11.9%      | +44,708 vs prior (17,614 → 62,322)                   |
| jtbd               | 34,853  | 6.6%       | 0 (unchanged)                                        |
| briefing           | 21,387  | 4.1%       | +6,633 vs prior (14,754 → 21,387)                    |
| project-claude-md  | 5,786   | 1.1%       | +429 vs prior (5,357 → 5,786)                        |
| hooks              | 0       | 0.0%       | unchanged                                            |
| skills             | 0       | 0.0%       | unchanged                                            |
| framework-injected | n/a     | n/a        | not measured — framework-injected, no on-disk source |

Threshold: 10,240 bytes per bucket (ADR-040 Tier 3 envelope). Top-5 offenders (bytes desc):

1. `memory` — 217,269 bytes (script-emitted). 21× threshold. +4% since prior snapshot.
2. `decisions` — 174,722 bytes (script-emitted). 17× threshold. +18% since prior — large delta, deep analysis recommended.
3. `problems` — 62,322 bytes (script-emitted). 6× threshold. +254% since prior — driven by retros being committed as bodies plus problem-ticket bodies growing this session. Above the +20% delta threshold; deep analysis recommended.
4. `jtbd` — 34,853 bytes. 3× threshold. No change.
5. `briefing` — 21,387 bytes. 2× threshold. +45% since prior.

Per-plugin breakdown available in `/wr-retrospective:analyze-context` (deep layer). Deep analysis recommended — invoke `/wr-retrospective:analyze-context` (decisions + problems + briefing buckets all over the +20% delta threshold).

#### Topic File Rotation Candidates

| Topic file                                | Bytes | Threshold | Proposed rotation                                                                                                               | Decision              |
| ----------------------------------------- | ----- | --------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `docs/briefing/autonomous-dep-updates.md` | 5,629 | 5,120     | leave-as-is (Branch B, ratio 1.10× — well under 2.0× MUST_SPLIT trigger; no strong sub-topic boundary observed; defer eligible) | applied (leave-as-is) |

#### Codification Candidates

| Kind    | Shape | Suggested name / Target file                                                                      | Scope / Flaw                                                                                                                                                                                                                                                                       | Triggers / Evidence                                                                               | Decision                                                                                                                                                                                   |
| ------- | ----- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| improve | skill | `packages/itil/skills/manage-problem/SKILL.md` (lines 858-865 commit-message convention examples) | Documented commit convention `docs(problems): P<NNN> <status> — <summary>` starts with uppercase `P` and fails `@commitlint/config-conventional`'s `subject-case` rule. Existing successful project commits use `<verb> P<NNN>` shape (`close P008`, `capture P009`, `park P004`). | First commit attempt this iter rejected by commitlint; reworded subject to `park P004` succeeded. | flagged (non-interactive) — queue at outstanding_questions for ticket creation on return. Either upstream SKILL flips examples to `<verb> P<NNN>` shape OR projects document the override. |

#### No Action Needed

- TDD state IDLE: no implementation files touched this iter (docs-only). TDD gate did not block — markdown writes are unrestricted.
- Architect / JTBD / voice-tone / style-guide gates: all three problem files touched (`docs/problems/004-...parked.md`, `docs/problems/README.md`, `docs/problems/README-history.md`) are under the explicit `Does NOT apply to:` carve-out for all four gate hooks. The retro file itself (`docs/retros/2026-05-16-ask-hygiene.md`) is NOT in the carve-out, so architect + JTBD subagents were invoked and both returned PASS.
- Reconciliation preflight (`wr-itil-reconcile-readme docs/problems`): exit 0, no drift. README was already in sync from prior iters.
- Risk gate: commit/push/release scored 1/1/0 (Very Low) per `wr-risk-scorer:pipeline`. Within appetite (≤4/25). Commit gate satisfied first attempt.
- Line-3 budget: new fragment 339 bytes, well under 1024-byte soft cap (P134). Budget script exit 0.

---

## Iteration retro — AFK `/wr-itil:work-problems` (P007 park)

Scope: iter 2 of the 2026-05-16 AFK loop. Worked P007 (`external-comms gate's sandboxed subagent reviewer cannot compute the SHA256 marker key`). Parked as `upstream-blocked` after direct read of upstream files confirmed both fix paths land in `~/.claude/plugins/marketplaces/windyroad/packages/risk-scorer/`. Recorded recommended fix path (Option 2 — grant the `wr-risk-scorer:external-comms` subagent Bash access for `shasum -a 256`) with evidence-cited rationale; Option 1 (hook recomputes key from draft + surface) preserved as the structurally-cleaner follow-up refactor. Same AFK constraints as iter 1: no mid-loop `AskUserQuestion`; observations queue to `ITERATION_SUMMARY.outstanding_questions`.

| Call # | Header | Classification | Citation                                                                                                                                                   |
| ------ | ------ | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (none) | n/a    | n/a            | n/a — zero AskUserQuestion calls fired in this iteration per the AFK mid-loop prohibition (dispatch prompt: "NEVER call AskUserQuestion mid-loop in AFK"). |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

**Total: 0 calls**

Cross-session trend: prior P004-park iter same day landed lazy=0; this iter same. R6 gate (≥2 lazy across 3 consecutive retros) NOT fired — six consecutive AFK iters with lazy=0.

### Session Retrospective — P007 iter

#### Briefing Changes

- No new entries added. The pattern this iter exercised — manage-problem Step 7 Open/Known Error → Parked transition with P063 already-noted carve-out, P062 README refresh, P134 line-3 rotation, commit-gate via `wr-risk-scorer:pipeline` — is already covered by existing topic files. The fix-path-decision section in P007 was new content, but it's ticket-body domain knowledge, not durable session-start signal.
- Per-entry signal scoring deferred to next interactive retro for the same reason as iter 1 (cited entries already carry signal evidence; decay + cited-this-iter updates batch better in interactive mode).

#### Problems Created/Updated

- **P007** — transitioned `.known-error.md` → `.parked.md` per the Parked lifecycle entry (reason `upstream-blocked`). Status field updated to "Parked". Added an `### Initial decision` subsection to Root Cause Analysis recording the recommended fix path (Option 2 — grant Bash to the subagent) with cited evidence from upstream files (`agents/external-comms.md` lines 4–7, `hooks/risk-score-mark.sh` lines 214–227). Three investigation tasks marked complete (read hook, read agent definition, decide fix path); one open task reframed (upstream report deferred to next interactive session — Step 6 security-path branch of `/wr-itil:report-upstream` is interactive per ADR-024 Consequences). `## Parked` section appended with reason / un-park trigger (upstream ships either fix path; detection signal is a real sha256-hex marker file appearing after a `wr-risk-scorer:external-comms` invocation without `BYPASS_RISK_GATE=1`) / parked-since date. External-root-cause detection (P063) already-noted check passed via the pre-existing `- **Upstream report pending** —` marker at line 82 — no prompt re-fire. README refresh per P062 removed P007 from WSJF Rankings (new dev-work queue top: P005 at WSJF 4.0); appended P007 row to Parked section beside P004; line 3 rotated per P134 single-fragment discipline (new fragment 552 bytes, under 1024-byte soft cap). Commit `872821c`. Risk scored 1/1/0 per `/wr-risk-scorer:pipeline` first attempt (no retry needed; pre-commit hooks all passed clean — lesson from iter 1 about lowercase-verb subjects carried forward).

#### Tickets Deferred

(None — Stage 1 ticketing was not invoked because the iter produced no new codify-worthy observations.)

#### Verification Candidates

(None this iter — no `.verifying.md` files exist in the corpus.)

#### Pipeline Instability

| Signal                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Category                             | Citations                                                                                                                                                                                                                                                                                                                                                                                                                                       | Decision                                                                                                                                                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Iter 1's commitlint-subject-case lesson (`<verb> P<NNN>` not `P<NNN> <verb>`) carried forward cleanly on BOTH commits this iter (work + retro). However, P009 (Edit-tool markdown writes skip prettier; pre-commit `format:check` fails) fired AGAIN — this time on the retro commit itself (not the work commit). Applied the known workaround: `npm run format` + `git add docs/retros/2026-05-16-ask-hygiene.md` + retry. This is the 6th+ in-session occurrence of P009 (iter 1 hit it on `docs/problems/README.md`; this iter hit it on the retro file). Persistent class-of-behaviour. | Hook-protocol friction (repeat-work) | Work commit `872821c` (P007 park): clean first attempt. Retro commit first attempt: pre-commit exit 1 with `[warn] docs/retros/2026-05-16-ask-hygiene.md`. Resolution: `npm run format` (re-formatted prettier-significant whitespace in the new section), `git add`, retry. The work-commit's clean landing confirms iter-1's commitlint-subject-case lesson stuck; the retro-commit's P009 re-fire confirms P009 is still open and untouched. | appended to P009 (recorded in retro only) — adds one more in-session occurrence to the existing ticket's symptom evidence. The commitlint `<verb> P<NNN>` correction queued at iter 1's `outstanding_questions` remains the open upstream-fix follow-up. |
| JTBD currency advisory: clean — no `packages/` directory in this adopter-tree project (detector is plugin-suite-scoped; emits no output for adopter trees).                                                                                                                                                                                                                                                                                                                                                                                                                                  | n/a                                  | `wr-retrospective-check-readme-jtbd-currency` exit 0, empty stdout.                                                                                                                                                                                                                                                                                                                                                                             | n/a — detector not applicable to this surface.                                                                                                                                                                                                           |

#### Context Usage (Cheap Layer)

| Bucket             | Bytes   | % of total | Δ vs prior                                           |
| ------------------ | ------- | ---------- | ---------------------------------------------------- |
| memory             | 217,269 | 41.0%      | 0 (unchanged from iter 1)                            |
| decisions          | 174,722 | 33.0%      | 0 (unchanged from iter 1)                            |
| problems           | 66,796  | 12.6%      | +4,474 vs iter 1 (62,322 → 66,796 — P007 body grew)  |
| jtbd               | 34,853  | 6.6%       | 0 (unchanged)                                        |
| briefing           | 21,387  | 4.0%       | 0 (unchanged from iter 1)                            |
| project-claude-md  | 5,786   | 1.1%       | 0 (unchanged)                                        |
| hooks              | 0       | 0.0%       | unchanged                                            |
| skills             | 0       | 0.0%       | unchanged                                            |
| framework-injected | n/a     | n/a        | not measured — framework-injected, no on-disk source |

Threshold: 10,240 bytes per bucket (ADR-040 Tier 3 envelope). Top-5 offenders (bytes desc):

1. `memory` — 217,269 bytes. 21× threshold. Unchanged this iter.
2. `decisions` — 174,722 bytes. 17× threshold. Unchanged this iter.
3. `problems` — 66,796 bytes. 6.5× threshold. +7.2% this iter (P007 body grew with fix-path decision + parking section). Below the +20% delta threshold; no deep-analysis trigger.
4. `jtbd` — 34,853 bytes. 3× threshold. Unchanged.
5. `briefing` — 21,387 bytes. 2× threshold. Unchanged.

Per-plugin breakdown available in `/wr-retrospective:analyze-context` (deep layer). Deep analysis NOT triggered this iter — all bucket deltas under +20%. Cumulative iter-1 + iter-2 problems delta is +279% across the day's two AFK iters; the deep-layer recommendation from iter 1's retro still stands for a future interactive session.

#### Topic File Rotation Candidates

| Topic file                                | Bytes | Threshold | Proposed rotation                                                                                                                            | Decision              |
| ----------------------------------------- | ----- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `docs/briefing/autonomous-dep-updates.md` | 5,629 | 5,120     | leave-as-is (Branch B, ratio 1.10× — well under 2.0× MUST_SPLIT trigger; no strong sub-topic boundary; same defer as iter 1 same-day retro). | applied (leave-as-is) |

#### Codification Candidates

(None this iter — the iter was a clean replay of an established pattern. No new shape/skill/hook surfaced.)

#### No Action Needed

- TDD state IDLE: no implementation files touched this iter (docs-only). TDD gate did not block — markdown writes are unrestricted.
- Architect / JTBD / voice-tone / style-guide gates: P007 ticket file and `docs/problems/README.md` + `docs/problems/README-history.md` are all under the explicit `Does NOT apply to:` carve-outs for the four upstream gate hooks. The retro file itself (`docs/retros/2026-05-16-ask-hygiene.md`) is NOT in the carve-out, so architect + JTBD subagents were invoked on the retro edit and both returned PASS.
- Reconciliation preflight (`wr-itil-reconcile-readme docs/problems`): not run this iter (the AFK orchestrator's iter dispatch goes directly to inline work; manage-problem's Step 0 reconcile preflight fires when manage-problem is invoked at the skill boundary, not at the orchestrator boundary). README was kept consistent through inline P062 refresh in the same commit as the P007 transition (single-commit grain per ADR-014).
- Risk gate: commit/push/release scored 1/1/0 (Very Low) per `wr-risk-scorer:pipeline`. Within appetite (≤4/25). Commit gate satisfied first attempt.
- Line-3 budget: new fragment 552 bytes (P007 park summary), well under 1024-byte soft cap (P134).
- Iter-1 carry-forward: lowercase-verb commit-subject discipline (iter-1 lesson) held cleanly — `docs(problems): park P007 — …` accepted on first commitlint pass.

---

## Iteration retro — AFK `/wr-itil:work-problems` (P005 park)

Scope: iter 3 of the 2026-05-16 AFK loop. Worked P005 (`wr-voice-tone:agent` returns FAIL when `docs/VOICE-AND-TONE.md` is missing). Parked as `upstream-blocked` — upstream issue windyroad/agent-plugins#124 was already filed 2026-05-13 and the ticket already carried a complete `## Reported Upstream` section. Local docs/VOICE-AND-TONE.md was bootstrapped in commit 47143c4 so the gate works in this adopter; the upstream improvement (self-bootstrap or fail-open-with-prompt) benefits other adopter projects. Same AFK constraints as iters 1 + 2: no mid-loop `AskUserQuestion`; observations queue to `ITERATION_SUMMARY.outstanding_questions`.

| Call # | Header | Classification | Citation                                                                                                                                                   |
| ------ | ------ | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (none) | n/a    | n/a            | n/a — zero AskUserQuestion calls fired in this iteration per the AFK mid-loop prohibition (dispatch prompt: "NEVER call AskUserQuestion mid-loop in AFK"). |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

**Total: 0 calls**

Cross-session trend: iter 1 (P004 park) lazy=0; iter 2 (P007 park) lazy=0; this iter lazy=0. R6 gate (≥2 lazy across 3 consecutive retros) NOT fired — seven consecutive AFK iters with lazy=0.

### Session Retrospective — P005 iter

#### Briefing Changes

- No new entries added. The pattern this iter exercised is the same three-step manage-problem Step 7 Open/Known Error → Parked transition with P063 already-noted carve-out, P062 README refresh, and P134 line-3 rotation that iters 1 + 2 covered. Existing topic files already capture the pattern; nothing new surfaced. The "already-noted check passed via `## Reported Upstream` section" path was exercised for the second consecutive iter (iter 2 hit it via `- **Upstream report pending** —` marker; this iter hit it via the canonical `## Reported Upstream` appendage from `/wr-itil:report-upstream`).
- Per-entry signal scoring deferred to next interactive retro for the same rationale as iters 1 + 2 (cited entries already carry signal evidence; decay + cited-this-iter updates batch better in interactive mode).

#### Problems Created/Updated

- **P005** — transitioned `.known-error.md` → `.parked.md` per the Parked lifecycle entry (reason `upstream-blocked`). Status field updated to "Parked". `## Parked` section appended before the pre-existing `## Reported Upstream` section with reason / un-park trigger (upstream issue windyroad/agent-plugins#124 closes, signal: agent returns PASS-with-warning OR auto-bootstraps successfully) / parked-since date. External-root-cause detection (P063) already-noted check passed via the pre-existing `## Reported Upstream` section (set by `/wr-itil:report-upstream P005` on 2026-05-13, upstream URL <https://github.com/windyroad/agent-plugins/issues/124>) — no prompt re-fire needed. README refresh per P062 removed P005 from WSJF Rankings (new dev-work queue top: P006 at WSJF 3.0); inserted P005 row into Parked section between P004 and P007 (ID-ordered); line 3 rotated per P134 single-fragment discipline. Prior line-3 fragment (P007 park summary from iter 2) appended to `docs/problems/README-history.md` under 2026-05-16 heading. Commit `5346d81`. Risk scored 1/1/1 per `/wr-risk-scorer:pipeline` first attempt (well within appetite ≤4/25).

#### Tickets Deferred

(None — Stage 1 ticketing was not invoked because the iter produced no new codify-worthy observations.)

#### Verification Candidates

(None this iter — no `.verifying.md` files exist in the corpus.)

#### Pipeline Instability

| Signal                                                                                                                                                                                                                                                                                                                                                                                                    | Category                  | Citations                                                                                                                                                                                                                                                                                      | Decision                                                                                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Iter 1's commitlint-subject-case lesson (`<verb> P<NNN>` not `P<NNN> <verb>`) carried forward cleanly for the third consecutive iter — work commit `5346d81` (`docs(problems): park P005 — …`) accepted on first commitlint pass with no rewording. The SKILL.md upstream issue queued at iter 1's `outstanding_questions` remains the open follow-up; no new evidence to add this iter.                  | Skill-contract violations | Work commit `5346d81`: subject `docs(problems): park P005 — upstream-blocked on @windyroad/voice-tone` → commitlint accepted; pre-commit format:check + lint + type-check + tests all passed. No retry needed.                                                                                 | flagged (non-interactive) — existing outstanding_question from iter 1 covers this; no new ticket creation. Third consecutive confirmation of the SKILL example mismatch. |
| P009 (Edit-tool markdown writes skip prettier; pre-commit `format:check` fails) — did NOT fire on the work commit this iter. The four files staged (P005 rename + ticket edit + README.md + README-history.md) all formatted cleanly on first attempt. Persistent class-of-behaviour from iters 1 + 2 was bypassed by writing markdown tables with column-alignment already in the prettier-target shape. | Hook-protocol friction    | Work commit `5346d81` first attempt: pre-commit format:check exit 0, no `[warn]` lines. Contrast with iter 1 (P009 fired on README.md trailing whitespace) and iter 2 (P009 fired on retro file). This iter's tables were trimmed by hand before staging so prettier had nothing to re-format. | recorded in retro only — no new ticket evidence to add (existing P009 ticket already covers the symptom). One miss this iter; the class-of-behaviour ticket stays open.  |
| JTBD currency advisory: clean — no `packages/` directory in this adopter-tree project (detector is plugin-suite-scoped; emits no output for adopter trees).                                                                                                                                                                                                                                               | n/a                       | `wr-retrospective-check-readme-jtbd-currency` exit 0, empty stdout.                                                                                                                                                                                                                            | n/a — detector not applicable to this surface.                                                                                                                           |

#### Context Usage (Cheap Layer)

| Bucket             | Bytes   | % of total | Δ vs prior                                           |
| ------------------ | ------- | ---------- | ---------------------------------------------------- |
| memory             | 217,269 | 41.0%      | 0 (unchanged from iter 2)                            |
| decisions          | 174,722 | 33.0%      | 0 (unchanged from iter 2)                            |
| problems           | 68,429  | 12.9%      | +1,633 vs iter 2 (66,796 → 68,429 — P005 body grew)  |
| jtbd               | 34,853  | 6.6%       | 0 (unchanged)                                        |
| briefing           | 21,387  | 4.0%       | 0 (unchanged from iter 2)                            |
| project-claude-md  | 5,786   | 1.1%       | 0 (unchanged)                                        |
| hooks              | 0       | 0.0%       | unchanged                                            |
| skills             | 0       | 0.0%       | unchanged                                            |
| framework-injected | n/a     | n/a        | not measured — framework-injected, no on-disk source |

Threshold: 10,240 bytes per bucket (ADR-040 Tier 3 envelope). Top-5 offenders (bytes desc):

1. `memory` — 217,269 bytes. 21× threshold. Unchanged this iter.
2. `decisions` — 174,722 bytes. 17× threshold. Unchanged this iter.
3. `problems` — 68,429 bytes. 6.7× threshold. +2.4% this iter (P005 body grew with the parking section). Well below the +20% delta threshold; no deep-analysis trigger.
4. `jtbd` — 34,853 bytes. 3× threshold. Unchanged.
5. `briefing` — 21,387 bytes. 2× threshold. Unchanged.

Per-plugin breakdown available in `/wr-retrospective:analyze-context` (deep layer). Deep analysis NOT triggered this iter — all bucket deltas under +20%. Cumulative across the day's three AFK iters: problems +289% (17,614 base → 68,429); the deep-layer recommendation from iter 1's retro still stands for a future interactive session.

#### Topic File Rotation Candidates

| Topic file                                | Bytes | Threshold | Proposed rotation                                                                                                                           | Decision              |
| ----------------------------------------- | ----- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `docs/briefing/autonomous-dep-updates.md` | 5,629 | 5,120     | leave-as-is (Branch B, ratio 1.10× — same defer as iters 1 + 2 same-day retros; well under 2.0× MUST_SPLIT trigger; no sub-topic boundary). | applied (leave-as-is) |

#### Codification Candidates

(None this iter — the iter was a clean replay of an established pattern. No new shape/skill/hook surfaced. The same three repeat-park-iters this session is itself signal that the `upstream-blocked` parking workflow is well-codified; nothing else to extract.)

#### No Action Needed

- TDD state IDLE: no implementation files touched this iter (docs-only). TDD gate did not block — markdown writes are unrestricted.
- Architect / JTBD / voice-tone / style-guide gates: P005 ticket file and `docs/problems/README.md` + `docs/problems/README-history.md` are all under the explicit `Does NOT apply to:` carve-outs for the four upstream gate hooks. The retro file itself (`docs/retros/2026-05-16-ask-hygiene.md`) is NOT in the carve-out; architect + JTBD subagents were invoked on the retro edit and both returned PASS.
- Reconciliation preflight (`wr-itil-reconcile-readme docs/problems`): exit 0, no drift. README was kept consistent through iters 1 + 2's inline P062 refreshes; this iter found a clean slate.
- Risk gate: commit/push/release scored 1/1/1 (Very Low) per `wr-risk-scorer:pipeline`. Within appetite (≤4/25). Commit gate satisfied first attempt.
- Line-3 budget: new fragment 522 bytes (P005 park summary including upstream URL), well under 1024-byte soft cap (P134).
- Iter-1 + Iter-2 carry-forward: lowercase-verb commit-subject discipline held for the third consecutive iter.
- Already-noted P063 check: passed via canonical `## Reported Upstream` section (set 2026-05-13). Confirms the iter-2 lesson that the AFK-default `- **Upstream report pending** —` marker and the canonical `## Reported Upstream` appendage are both accepted by the detection block's "already-noted" check.
