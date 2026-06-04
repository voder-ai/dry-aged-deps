# Session Retrospective — 2026-06-04 iter 5 (P013 substance-confirm-defer)

AFK iter 5 of `/wr-itil:work-problems`. Single ticket — P013 (gap #2 ADR-0018 amendment). Outcome: substance-confirm-defer per ADR-074. One commit: `a55493b docs(problems): defer P013 — ADR-074 substance-confirm fires for ADR-0018 amendment`. Zero `AskUserQuestion` calls.

## Briefing Changes

- Added: none (scanned 9 Critical Points entries — no new "What You Need to Know" or "What Will Surprise You" learning surfaced this iter; iter scope was bounded to ADR-074 guard application on a single ticket).
- Removed: none (scanned for stale items — Critical Points entries on release model, gates, push-watch, ADR-0014 update target, OIDC auth, ADR-0016 pre-commit hook, ADR-0017 auto-update, branch protection are all still current; none invalidated by this iter).
- Updated: none.
- README index refreshed: no changes (no topic-file character shift).

## Signal-vs-Noise Pass (P105)

Per-iter retros in `claude -p` subprocess context load the 9 Critical Points entries via SessionStart hook but the iter scope was bounded to ADR-074 / ADR-0018 / P013. None of the loaded entries were cited or acted on; decay applies uniformly.

| Entry                                                    | Topic file                                | Old score | New score                      | Classification | Citation                                                                                                                                                                                         |
| -------------------------------------------------------- | ----------------------------------------- | --------- | ------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Release model is non-standard (semantic-release)         | `docs/briefing/releases-and-ci.md`        | n/a       | -1                             | decay-only     | not cited — iter scope was P013 ticket update only, no release path touched                                                                                                                      |
| Releases gated on no-pending-safe-deps                   | `docs/briefing/releases-and-ci.md`        | n/a       | -1                             | decay-only     | not cited — no release in this iter                                                                                                                                                              |
| Auto-update is one workflow now (ADR-0017)               | `docs/briefing/autonomous-dep-updates.md` | n/a       | -1                             | decay-only     | not cited                                                                                                                                                                                        |
| TBD with admin-bypass branch protection                  | `docs/briefing/autonomous-dep-updates.md` | n/a       | -1                             | decay-only     | not cited                                                                                                                                                                                        |
| `dry-aged-deps --update` writes `latest`-safe (ADR-0014) | `docs/briefing/releases-and-ci.md`        | n/a       | -1                             | decay-only     | not cited                                                                                                                                                                                        |
| CLAUDE_CODE_OAUTH_TOKEN for Claude API auth only         | `docs/briefing/autonomous-dep-updates.md` | n/a       | -1                             | decay-only     | not cited                                                                                                                                                                                        |
| Pre-commit hook auto-writes and re-stages (ADR-0016)     | `docs/briefing/hooks-and-gates.md`        | n/a       | 0 (noise neutralised by decay) | noise          | loaded but not cited — pre-commit hook ran during commit (format:check / lint / type-check all PASS); entry was tangentially relevant but the iter did not reference it for diagnostic reasoning |
| Push goes through `npm run push:watch`                   | `docs/briefing/releases-and-ci.md`        | n/a       | -1                             | decay-only     | not cited — no push in this iter                                                                                                                                                                 |
| Autonomous-update workflow auth is HTTP Basic            | `docs/briefing/autonomous-dep-updates.md` | n/a       | -1                             | decay-only     | not cited                                                                                                                                                                                        |

**Critical Points changes**: none promoted or demoted this iter (all entries remain at single-pass score; durable cross-session scoring requires multi-iter accumulation).

**Delete queue**: empty (no entry scored ≤ -3 in this single pass — scoring with `n/a` baseline + first-write would need cross-session accumulation to reach the delete threshold).

**Budget overflow**: not triggered.

**Note on first-write baseline**: HTML-comment per-entry persistence is the canonical mechanism for cross-session scoring but is not yet wired in this project's briefing files. The classifications above are surfaced for audit; per-entry file-write persistence is deferred to a separate codification candidate if the user wants the trail.

## Problems Created/Updated

- P013 (gap #2 / ADR-0018 amendment substance): added 2026-06-04 Findings subsection recording ADR-074 substance-confirm-defer; updated Investigation Tasks (gap-#1-vs-gap-#2 routing question marked resolved via RFC-001; new substance-confirm task added). Committed at `a55493b`.

## Tickets Deferred

(none — Stage 1 fired correctly; the iter's substance-confirm-defer is itself an applied ADR-074 guard, not a deferred observation)

## Verification Candidates

| Ticket | Fix summary                                                         | In-session citations                                                                                                                                                                                                                                                                                                                         | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------ | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P025   | actions/checkout + setup-node v4→v6 migration (released 2026-06-03) | Prior-session README cell (`docs/problems/README.md` Verification Queue row): `yes — observed: ci-publish exercised under v6 across 8+ pushes since fix shipped — all green; auto-update + claude workflows await natural trigger`. Written during iter 2 retro flow (commit `aef0c81`, 14:20). Not exercised in iter 5's tool-call history. | flagged (non-interactive) — prior-session README cell carries evidence per Step 4a sub-step 9; closure deferred to orchestrator-main-turn Step 2.4 gate (b) session-level retro (which runs its own Step 4a drain) or next iter's transition-problem dispatch. Iter 5 scope is bounded to P013 per the iter prompt; adding a P025 close commit would be scope-expansion beyond the dispatched ticket. Iter 4 also deferred this candidate. **Recovery**: rerun `/wr-itil:transition-problem 025 close` to dispatch the closure when the user reviews. |
| P014   | exposure-aware severity-scaled age soak (released 2026-06-04)       | Same-session exclusion: rename committed in iter 4 of this same AFK loop (`591e60a`, 13:54). Excluded per sub-step 8.                                                                                                                                                                                                                        | left Verification Pending (same-session)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| P021   | `calculateAgeInDays` testability fix (released 2026-06-02)          | README cell `no — not observed`. No evidence collected.                                                                                                                                                                                                                                                                                      | left Verification Pending                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

## Pipeline Instability

| Signal                                                                                                                                                                                                                                                                                              | Category                                                   | Citations                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Decision                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pre-commit hook flow re-fired the staging-trap pattern — first `git commit` attempt failed (exit 1) with file unstaged after format:check + lint + type-check all PASS; second attempt after explicit `git add` succeeded at sha `a55493b`.                                                         | Repeat-work friction (sibling of P022 / P057 staging-trap) | First Bash invocation `git commit ...` — output showed format-check passed, lint passed (1 pre-existing warning, 0 errors), type-check passed, then `Changes not staged for commit: modified: docs/problems/known-error/013-...md`. Required `git add` + retry. P022 investigation falsified the "commit-gate hook unstages files" hypothesis in iter 3 (commit `97e6201`); this iter's re-fire is fresh evidence the residual hypothesis space is not yet narrowed. | matches P022 (known-error, investigation arc open) — recorded in retro only per Step 2b AFK fallback; user reviews on return and appends evidence to P022's Root Cause Analysis via `/wr-itil:manage-problem` |
| Risk-pipeline gate re-fired between commit-message-body edits — the external-comms PASS marker is keyed against the body hash; editing backticks → backtick-free in the body invalidated the marker; had to re-trigger external-comms-risk + voice-tone + risk-pipeline reviews on the second body. | Hook-protocol friction (marker-key-vs-edit-tolerance)      | Edited commit body to swap markdown backticks for unquoted names in three lines (`.afk-run-state/outstanding-questions.jsonl`, `src/find-unfixable-vulns.js`, `AskUserQuestion`, `direction`); the hook re-fired demanding fresh PASS markers. Reverted to original body → reused existing markers → commit proceeded.                                                                                                                                               | recorded in retro only (single-instance friction; the marker-vs-edit-tolerance question is well-trodden territory per prior reviews of similar gates; not ticket-worthy alone)                                |
| README inventory currency advisory failed                                                                                                                                                                                                                                                           | Detector failure                                           | `wr-retrospective-check-readme-jtbd-currency` returned `check-readme-jtbd-currency: packages dir not found: packages` — this repo is a downstream adopter of the wr- framework, not the monorepo. Detector is designed for the monorepo layout.                                                                                                                                                                                                                      | recorded in retro only (downstream-adopter fall-open per the SKILL's defensive-trip clause; not a regression)                                                                                                 |

## Topic File Rotation Candidates

`check-briefing-budgets.sh` was not invoked this iter (no topic-file edits — Step 3 emitted no changes, so the post-edit budget pass had nothing to measure). Briefing tree byte count from Step 2c: `briefing bytes=29265` across 4 topic files + README; individual file sizes not separately measured. Defer to a topic-file rotation pass at orchestrator-main-turn session-level retro.

## Context Usage (Cheap Layer)

| Bucket             | Bytes        | % of total | Δ vs prior                                         |
| ------------------ | ------------ | ---------- | -------------------------------------------------- |
| memory             | 395,324      | 41.8%      | no prior snapshot — first measurement this project |
| decisions          | 270,092      | 28.6%      | no prior snapshot — first measurement this project |
| problems           | 207,542      | 22.0%      | no prior snapshot — first measurement this project |
| jtbd               | 42,306       | 4.5%       | no prior snapshot — first measurement this project |
| briefing           | 29,265       | 3.1%       | no prior snapshot — first measurement this project |
| project-claude-md  | 7,747        | 0.8%       | no prior snapshot — first measurement this project |
| hooks              | not measured | —          | reason=source-absent                               |
| skills             | not measured | —          | reason=source-absent                               |
| framework-injected | not measured | —          | reason=framework-injected-no-on-disk-source        |

**Top 5 offenders**:

- `memory` 395 KB — measurement-method: `du -b $CLAUDE_PROJECT_DIR/.claude/projects/.../memory` (per `wr-retrospective-measure-context-budget` BUCKET emit).
- `decisions` 270 KB — measurement-method: `du -b $CLAUDE_PROJECT_DIR/docs/decisions`.
- `problems` 207 KB — measurement-method: `du -b $CLAUDE_PROJECT_DIR/docs/problems`.
- `jtbd` 42 KB — measurement-method: `du -b $CLAUDE_PROJECT_DIR/docs/jtbd`.
- `briefing` 29 KB — measurement-method: `du -b $CLAUDE_PROJECT_DIR/docs/briefing`.

Per-plugin breakdown available in `/wr-retrospective:analyze-context` (deep layer).

Deep analysis recommended — invoke `/wr-retrospective:analyze-context` (no prior snapshot AND `memory` + `decisions` + `problems` together exceed 870 KB; the cheap layer cannot distinguish loaded vs. on-disk-but-not-loaded bytes — deep layer's per-turn attribution required to identify the actual context footprint).

## Ask Hygiene (P135 Phase 5 / ADR-044)

(see `docs/retros/2026-06-04-iter5-P013-substance-confirm-defer-ask-hygiene.md` — empty table; lazy count 0)

**Lazy count: 0**
**Direction count: 0** (the ADR-074 substance-confirm-defer was queued to `.afk-run-state/outstanding-questions.jsonl` per ADR-044 AFK contract — NOT surfaced via AskUserQuestion mid-iter)
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

## Codification Candidates

(none — the iter's primary action was framework-mediated guard application; no new recurring patterns surfaced beyond the existing P022 staging-trap investigation arc which already has a ticket)

## No Action Needed

- ADR-074 substance-confirm-before-build guard correctly fired and was correctly applied — this is the framework working as designed; not a learning to capture, just a successful guard application.
- ADR-044 AFK contract (no AskUserQuestion mid-iter; queue outstanding-questions) correctly applied — zero lazy calls, zero direction calls via AskUserQuestion (the direction-class observation routed correctly to the jsonl queue).
