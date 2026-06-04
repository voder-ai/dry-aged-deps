# Retro — 2026-06-05 iter 8 — P013 RED-phase class (c) `no patched version`

**Scope**: iter 8 of AFK work-problems loop. One commit landed (`c0780e9`); no push.
**Iter goal**: add the failing test for ADR-0018 amendment Confirmation #16 first clause — a transitive vuln with `fixAvailable: false` MUST classify as `'no patched version'`.
**Result**: ACHIEVED. Test fails with `Expected: "no patched version"` / `Received: "vulnerable transitive dependency"`; other 7 tests stay green.

## Step 1 — Briefing read

Read `docs/briefing/README.md` + the four topic files (`autonomous-dep-updates.md`, `governance-workflow.md`, `hooks-and-gates.md`, `releases-and-ci.md`). No surface relevant to this iter's class-(c) RED-phase test addition was cited; the iter exercised TDD + governance-gate surfaces already well-covered.

## Step 1.5 — Signal-vs-noise pass

Per-entry scoring deferred to interactive retro per AFK fallback (ADR-013 Rule 6). No entries cited or paraphrased during this iter beyond the standard governance-gate sequence (architect, JTBD, external-comms risk, voice-tone, pipeline risk) — those are already Critical-Points-tier and rotation is decay-driven, not iter-driven. Delete queue: empty by scan (no entry crossed the -3 floor this iter; the briefing was not modified).

## Step 2 — Reflection

**What surprised me**: nothing new this iter. The four-gate prep cycle (architect → JTBD → external-comms risk → voice-tone → pipeline risk) plus the pre-commit hook (format/lint/type-check) ran cleanly; only one mid-cycle re-stage was required (see Pipeline Instability below — already covered by P022).

**What was harder than it should have been**: the gate cycle required one `git add` re-stage. P022 already tracks this pattern; this iter's evidence does not contradict the 2026-06-04 iter 3 hypothesis-falsification (the gate-hook chain does NOT unstage), so the re-frame remains "partial-staging misperception or inter-tool working-tree mutation between gate-blocked attempts and retry".

**What failed**: nothing.

**Codifiable patterns**: none new — this iter is the third instance of the well-rehearsed "RED-phase test addition + AFK governance gates + single-commit" pattern that iters 4 + 6 already exercised. The pattern is mechanically reproducible without new codification.

## Step 2b — Pipeline-instability scan

**Detection 1** — Mid-cycle re-stage after gate cycle. Category: hook-protocol friction (subcategory: partial-staging across multi-gate retry).

- Citations: external-comms gate fire at turn N (BLOCKED — external-comms gate); pipeline risk gate fire at turn N+1 (BLOCKED — No commit risk score found); third commit retry exited 1 with "no changes added to commit" after pre-commit hook (format/lint/type-check) ran. `git status` showed `modified: src/find-unfixable-vulns.test.js` unstaged. Recovery: `git add src/find-unfixable-vulns.test.js` → 4th retry succeeded as `c0780e9`.
- Dedup: matches existing **P022** (`docs/problems/open/022-commit-gate-hook-unstages-files-on-pipeline-state-drift-block.md`). The leading hypothesis (gate-hook unstages files) was already falsified per the 2026-06-04 iter 3 hook-chain audit. This iter's evidence is consistent with the current re-frame ("partial-staging misperception OR inter-tool mutation between attempts"). Decision: AFK-defer the append decision — the evidence does not advance the falsified-hypothesis re-frame; the user reviews on return whether the cumulative N-th occurrence warrants a fresh investigation cycle.

**Detection 2** — None. No other pipeline-level friction observed.

**README inventory currency advisory**: `wr-retrospective-check-readme-jtbd-currency` exited with `packages dir not found: packages` — this is a downstream-adopter repo (no `packages/` directory); advisory script intended for plugin-repo use. Not a regression.

## Step 2c — Context-usage measurement (cheap layer)

| Bucket             | Bytes                                               | % of total | Δ vs prior                                       |
| ------------------ | --------------------------------------------------- | ---------- | ------------------------------------------------ |
| memory             | 408,850                                             | 40.0%      | not estimated — first measurement this iter file |
| decisions          | 280,177                                             | 27.4%      | not estimated — first measurement this iter file |
| problems           | 235,114                                             | 23.0%      | not estimated — first measurement this iter file |
| jtbd               | 42,306                                              | 4.1%       | not estimated — first measurement this iter file |
| briefing           | 33,858                                              | 3.3%       | not estimated — first measurement this iter file |
| project-claude-md  | 7,747                                               | 0.8%       | not estimated — first measurement this iter file |
| hooks              | not measured — source-absent                        | —          | —                                                |
| skills             | not measured — source-absent                        | —          | —                                                |
| framework-injected | not measured — framework-injected-no-on-disk-source | —          | —                                                |

Total measured: 1,008,052 bytes. Threshold: 10,240 bytes per individual file (the script's THRESHOLD is the per-file ceiling, not aggregate budget). Per-plugin breakdown available in `/wr-retrospective:analyze-context` (deep layer).

No delta column because this iter's retro file is the first to invoke `wr-retrospective-measure-context-budget` in this specific iter sequence per `no prior snapshot — first measurement this project` sentinel.

## Step 2d — Ask Hygiene Pass

Zero `AskUserQuestion` calls fired this iter (strict AFK discipline per ADR-044 / P135 / orchestrator iter-prompt directive).

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

R6 numeric gate check: 11 consecutive retros at lazy=0 (per `check-ask-hygiene.sh` trail) — well below R6 trigger of ≥2 across 3 consecutive retros.

## Step 3 — Briefing tree

- Added: none. The iter exercised already-Critical-Points-tier surfaces (TDD discipline + governance gates); no new under-2KB observation warrants briefing addition.
- Removed: none.
- Updated: none.
- README index refreshed: no change.

Scanned 17 candidate observations across the iter's tool-call history (test write, vitest run, git status, git add, commit-block × 2, gate-passes × 3, final commit). All match existing briefing entries or are routine governance-gate sequence steps already encoded. Zero accepted candidates for briefing addition — per the P332 anti-pattern enforcement, this row carries the scan-evidence (17 candidates scanned, 0 accepted) to distinguish a scanned-empty result from a silent skip.

### Tier 3 budget pass (P099)

`check-briefing-budgets.sh` results:

```
OVER governance-workflow.md bytes=7896 threshold=5120
OVER hooks-and-gates.md bytes=10299 threshold=5120
MUST_SPLIT hooks-and-gates.md reason=ratio-exceeds-2x
```

Two candidates carried over from prior iters. State unchanged since iter 7 (no briefing edits this iter). See "Topic File Rotation Candidates" below.

## Step 4 — Problems

No new problems captured this iter. The iter's mechanical observations are covered by P022 (re-stage friction — see Detection 1 above).

## Step 4a — Verification-close housekeeping

Globbed `docs/problems/verifying/*.md`. No `.verifying.md` tickets were exercised by this iter — the test addition does not touch any verifying fix's source path, test file, skill, hook, or gate. No close-candidates; no flag-for-manual-review entries.

**Sub-step 9 (prior-session README cell drain)**: read `docs/problems/README.md` Verification Queue. No `yes — observed:` rows surfaced as close-candidates this iter (covered by prior iters' drains).

## Step 4b — Two-stage codification

**Stage 1 — Ticket every codify-worthy observation**: zero codify-worthy observations this iter. The single Detection 1 (re-stage) is already-ticketed at P022; the evidence does not contradict the current re-frame.

**Stage 2 — Fix Strategy**: N/A (no Stage 1 tickets created this iter).

## Step 5 — Summary

Inline in iter ITERATION_SUMMARY emit (Phase 3 schema per `packages/itil/skills/work-problems/SKILL.md`).

---

## Section: Verification Candidates

(Omitted — no `.verifying.md` candidates from in-session evidence this iter.)

## Section: Pipeline Instability

| Signal                                                                                             | Category               | Citations                                                                                                                                                                                                                              | Decision                                                                                                                                                          |
| -------------------------------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mid-cycle re-stage required after external-comms gate → pipeline risk gate → pre-commit hook cycle | Hook-protocol friction | external-comms gate BLOCKED at turn N; pipeline risk gate BLOCKED at turn N+1; pre-commit hook exit 1 at turn N+2 with `git status` showing test file unstaged; recovery `git add src/find-unfixable-vulns.test.js` → commit `c0780e9` | matches P022 — flagged (non-interactive) — evidence consistent with current re-frame, does not advance falsified-hypothesis investigation; user reviews on return |

## Section: Topic File Rotation Candidates

| Topic file                             | Bytes  | Threshold | Proposed rotation                                                                                                                   | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| -------------------------------------- | ------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/briefing/hooks-and-gates.md`     | 10,299 | 5,120     | split-by-date (Branch A — ratio 2.01× MUST_SPLIT; no clear sub-topic boundary; archive oldest half to `hooks-and-gates-archive.md`) | flagged (non-interactive) — AFK iter scope is P013 class (c) RED; rotation work belongs to a dedicated retro pass per ADR-013 Rule 6. Fourth consecutive flagged-state — iter 5, 6, 7 + 8 surfaced the same candidate without rotation. The recurring-defer pattern (P145/P247 class-of-behaviour) is now strong enough to warrant a dedicated retro pass at next interactive session OR to revise the AFK-iter contract so rotation fires opportunistically when the per-iter file delta is zero. |
| `docs/briefing/governance-workflow.md` | 7,896  | 5,120     | split-by-date (Branch B safe-default; ratio 1.54×)                                                                                  | flagged (non-interactive) — same scope-discipline rationale; same as iters 5, 6, 7.                                                                                                                                                                                                                                                                                                                                                                                                                |

**Recurring-defer self-observation (codify candidate, P145-class)**: this is the **fourth** consecutive AFK iter retro that flagged `hooks-and-gates.md` as MUST_SPLIT without rotating. The iter contract carves rotation out of AFK scope; meanwhile the file accumulates per-iter mtime decay. Two routes for next interactive retro: (a) actually do the split-by-date rotation (mechanical, 5-min op); (b) capture an ADR amendment clarifying that AFK iter retros may legitimately defer Tier 3 rotation when the per-iter byte delta is zero. Surfacing as observation, not as new ticket — the deferral pattern is uniform across all four iters and not class-of-behaviour drift.

## Section: Ask Hygiene (P135 Phase 5 / ADR-044)

(Zero AskUserQuestion calls fired this iter — strict AFK discipline.)

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

## Section: Codification Candidates

(Empty — no new candidates this iter. Recurring-defer observation captured inline above under Topic File Rotation Candidates; not promoted to a separate codification row because the appropriate routing target is a future interactive retro, not a new skill/agent/hook.)

## Section: No Action Needed

- TDD RED-phase contract — well-rehearsed (this is the 3rd RED-phase iter in this P013 series); no new learning.
- Governance-gate sequence (architect → JTBD → external-comms × 2 → pipeline-risk) — exercised cleanly; pre-iter sequencing covers all gates.
- P010 verb-first commit-subject workaround — applied without friction at line 1 of the commit message.
