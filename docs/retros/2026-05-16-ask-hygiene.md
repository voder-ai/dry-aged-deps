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
