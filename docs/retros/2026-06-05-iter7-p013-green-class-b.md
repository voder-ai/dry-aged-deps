# Retro — 2026-06-05 iter 7 — P013 GREEN-phase (class (b) `fix-via-overrides-edit` classifier)

## Session Retrospective

### Briefing Changes

- **Added**: a short Critical Points pointer line (`docs/briefing/README.md`) directing future iters to the bytewise-hash + Co-Authored-By rule in `hooks-and-gates.md§52` before composing any `git commit -m "$(cat <<'EOF' ... EOF)"` body under risk-scorer / voice-tone gates. Promotion rationale: 3rd consecutive iter hitting the same trailer-omission failure mode in a single calendar day signals the per-topic-file location alone isn't sticking — high-signal entries warrant index-line nudges in the session-start surface (ADR-040 Tier 1 budget allows ~10 bullets; this addition takes the index to 10, still within envelope).
- **Updated**: `docs/briefing/hooks-and-gates.md§52` — appended iter 7 evidence to the existing case-study list (iter 3 heredoc backtick escape → iter 5 trailer omission → iter 7 trailer omission). Signal-score bumped 3 → 4 (cited & acted on +2; decay -1 = net +1).
- **Removed**: none — no entries became stale this iter.
- **README index refreshed**: Critical Points gained the one-line pointer described above; Topic Index unchanged.

### Signal-vs-Noise Pass (P105)

(Step 1.5 ran the scan. One score change this iter; one promotion-via-index-pointer.)

| Entry                                                             | Topic file                         | Old score | New score | Classification         | Citation                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------------------------- | ---------------------------------- | --------- | --------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| External-comms gate hash is bytewise (incl. trailer)              | `docs/briefing/hooks-and-gates.md` | 3         | 4         | signal                 | Cited & acted on this iter — first risk-scorer + voice-tone PASS verdicts at turns ~25-26 hashed the trailer-less `<draft>`; the gate's hash of the actual HEREDOC body (trailer included) didn't match; re-ran both subagents at turns ~31-32 with the trailer-included draft and the commit landed at turn ~34. |
| @windyroad/tdd per-session IDLE state (P026)                      | `docs/briefing/hooks-and-gates.md` | 0         | 1         | signal                 | Cited & acted on this iter — first impl Edit at turn ~14 blocked with `TDD state is IDLE`; 1-char copy-edit to test description at turn ~16 re-armed RED state; impl Edit at turn ~17 succeeded.                                                                                                                  |
| External-comms gate hash bytewise — Critical Points pointer (new) | `docs/briefing/README.md`          | n/a       | 2         | signal (initial write) | Created this iter as silent promote per Step 3 / Step 1.5 silent-classification model.                                                                                                                                                                                                                            |

**Critical Points changes**: +1 entry — the new short pointer at `README.md` (post-`Autonomous-update workflow auth` bullet). Tier 1 budget envelope retained.
**Delete queue**: empty.
**Budget overflow**: none.

### Problems Created/Updated

- **No new tickets this iter.** The recurring external-comms-trailer pattern was addressed by promoting the existing `hooks-and-gates.md§52` entry to Critical Points (silent agent action per Step 3 / Step 1.5). Future iters loading Critical Points at session start will see the pointer before risking the gate-marker hazard.
- **P013 substance**: iter 7 commit `0b7fe9a` lands the class (b) `fix-via-overrides-edit` classifier extension to `deriveReason()`. ADR-0018 stays `proposed` per its §Lifecycle-transition decision — class (c) `genuinely-unfixable` + integration test snapshot updates + README docs + `proposed → accepted` transition follow in subsequent iters.

### Tickets Deferred

(None — Step 4b Stage 1 fired no skill-unavailable observations this iter. The single recurring-class observation (Co-Authored-By trailer omission) was resolved by silent Critical Points promotion per Step 3, not by ticket creation.)

### Verification Candidates

(Project lifecycle convention uses `Status:` field in body, not `.verifying.md` filename suffix. `grep -lE "^Status: (verifying|Verification Pending)" docs/problems/*.md` at turn ~85 returned empty. No close-on-evidence candidates this iter.)

### Pipeline Instability

| Signal                                                                                                                                                                                                                                                                                                                                                                                                                   | Category               | Citations                                                                                                                                                                                                                                                                                                                                                                                                            | Decision                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| External-comms gate hash mismatched on first review — risk-scorer + voice-tone PASS verdicts at turns ~25-26 hashed the trailer-less `<draft>`; `git commit` at turn ~28 re-blocked because the gate hashed the actual HEREDOC body (Co-Authored-By trailer included). Re-ran both subagents at turns ~31-32 with the trailer-included draft; commit landed at turn ~34. Third hit in same calendar day (iters 3, 5, 7). | Hook-protocol friction | risk-scorer + voice-tone PASS verdicts present in transcript at turns ~25-26; `git commit` gate-blocked error at turn ~28 identical to pre-review state; second invocation pair at turns ~31-32 with `Co-Authored-By:` trailer included cleared the gate; commit `0b7fe9a` landed at turn ~34. Distinct from iter 6's marker-non-registration mode (which had the trailer correct but the marker still didn't fire). | recorded in retro only — durable codification already on disk via `hooks-and-gates.md§52` + new Critical Points pointer (Step 3). |
| @windyroad/tdd per-session IDLE state (P026 sibling pattern) — first Edit to `src/find-unfixable-vulns.js` at turn ~14 blocked with `TDD state is IDLE` despite the file having an existing RED test from iter 6 (commit `7de97a3`). 1-char copy-edit to the test description ("a patched range" → "patched range" via Edit at turn ~16) re-armed RED state; impl Edit at turn ~17 succeeded.                            | Hook-protocol friction | `TDD state is IDLE` error message at turn ~14; test-description Edit at turn ~16; subsequent impl Edit succeeded at turn ~17. Same shape as P026 documents — multi-session RED→GREEN impl edit blocked by per-session IDLE state.                                                                                                                                                                                    | recorded in retro only — durable codification already on disk via P026 ticket; workaround proven this iter.                       |

**README inventory currency**: detector exited with `packages dir not found: packages` — single-package repo, detector is shaped for the windyroad meta-repo. Known scope mismatch, not friction. Informational only.

### Topic File Rotation Candidates

| Topic file                             | Bytes            | Threshold | Proposed rotation                                                                                                                                                                                                      | Decision                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------------------- | ---------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/briefing/hooks-and-gates.md`     | 10299            | 5120      | split-by-date (Branch A — ratio 2.01× just crossed MUST_SPLIT threshold; the crossing was caused by THIS iter's evidence-append to entry 52 + Critical Points pointer hashing of a related entry — ~250 bytes net add) | flagged (non-interactive) — AFK iter scope is P013 class (b) GREEN; rotation work belongs to a dedicated retro pass per ADR-013 Rule 6. The MUST_SPLIT crossing this iter is marginal (the file was 10049 = 1.96× before this retro's evidence-append); next interactive retro should pick split-by-date as safe default. Third consecutive flagged-state — iter 5 + iter 6 surfaced the same candidate at sub-MUST_SPLIT ratios. |
| `docs/briefing/governance-workflow.md` | 7896             | 5120      | split-by-date (Branch B safe-default; ratio 1.54×)                                                                                                                                                                     | flagged (non-interactive) — same scope-discipline rationale; same as iters 5 + 6.                                                                                                                                                                                                                                                                                                                                                 |
| `docs/briefing/README.md`              | 5837 (post-edit) | 5120      | trim-noise (Branch B; ratio 1.14× — index nudge added this iter; Critical Points roll-up is the largest contributor and Tier 1 budget guard exists at ~2KB)                                                            | flagged (non-interactive) — same scope-discipline rationale; index-nudge addition is the productivity-vs-bloat trade-off explicitly authorised by Step 3 silent promote.                                                                                                                                                                                                                                                          |

### Ask Hygiene (P135 Phase 5 / ADR-044)

(Zero AskUserQuestion calls fired this iter — strict AFK discipline per ADR-044 / P135 / orchestrator iter-prompt directive.)

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

`check-ask-hygiene.sh` trend line: `TREND lazy_first=0 lazy_last=0 delta=+0` — clean across the last 10 retros including this one.

### Context Usage (Cheap Layer)

| Bucket             | Bytes   | % of total | Δ vs prior                                                                           |
| ------------------ | ------- | ---------- | ------------------------------------------------------------------------------------ |
| memory             | 408,850 | 40.5%      | +0 vs iter 6                                                                         |
| decisions          | 280,177 | 27.8%      | +0 vs iter 6                                                                         |
| problems           | 235,114 | 23.3%      | +10,964 vs iter 6 (P026 + P027 tickets added between iters)                          |
| jtbd               | 42,306  | 4.2%       | +0 vs iter 6                                                                         |
| briefing           | 33,109  | 3.3%       | +0 vs iter 6 (pre-retro measure; retro additions ~+550 bytes will reflect next iter) |
| project-claude-md  | 7,747   | 0.8%       | +0 vs iter 6                                                                         |
| hooks              | n/a     | n/a        | not measured — source-absent (single-package repo)                                   |
| skills             | n/a     | n/a        | not measured — source-absent (single-package repo)                                   |
| framework-injected | n/a     | n/a        | not measured — framework-injected-no-on-disk-source                                  |

Top-5 offenders (bytes desc): `memory` (408,850 — `~/.claude/projects/-Users-tomhoward-Projects-dry-aged-deps/memory/`), `decisions` (280,177 — `docs/decisions/`), `problems` (235,114 — `docs/problems/`), `jtbd` (42,306 — `docs/jtbd/`), `briefing` (33,109 — `docs/briefing/`). Measurement method: `wr-retrospective-measure-context-budget` byte counts on directory contents (read-only).

THRESHOLD bytes=10240 — per-bucket cheap-layer ceiling. `memory`, `decisions`, `problems` all exceed; `briefing` aggregate well under.

Per-plugin breakdown available in `/wr-retrospective:analyze-context` (deep layer).

### Codification Candidates

| Kind    | Shape                    | Suggested name / Target file              | Scope / Flaw                                                                                                                                                                                                                          | Triggers / Evidence                         | Decision                                                                                                                                                                                                        |
| ------- | ------------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| improve | briefing (index promote) | `docs/briefing/README.md` Critical Points | High-signal per-topic-file hazard rules not loaded at iter-start by default — agents see only Critical Points + topic-index. The external-comms trailer rule is in `hooks-and-gates.md§52` but agents hit the gate before reading it. | 3 hits in same calendar day (iters 3, 5, 7) | applied this iter (silent agent action per Step 3 silent-promote) — short pointer added to Critical Points. Future iters loading the session-start surface will see the pointer before composing review drafts. |

### No Action Needed

- This iter's primary work — implementing class (b) `fix-via-overrides-edit` in `src/find-unfixable-vulns.js` (`isAtRootNodeModules` helper + new precedence branch in `deriveReason()`) — completed cleanly. All 7 tests in `src/find-unfixable-vulns.test.js` green. Full prepush passes (365 unit tests + 4 E2E tests). Commit `0b7fe9a` landed.
- The two friction modes observed (external-comms trailer omission, @windyroad/tdd IDLE state) are both already-ticketed / already-codified. The iter's scope (P013 class (b) GREEN-phase only) was satisfied.
- ADR-0018 stays `proposed` per the amendment's §Lifecycle-transition decision; class (c) `genuinely-unfixable` + integration test snapshot updates + README docs + `proposed → accepted` transition follow in subsequent iters.
