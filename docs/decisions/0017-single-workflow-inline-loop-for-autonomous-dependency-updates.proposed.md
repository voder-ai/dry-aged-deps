---
status: 'proposed'
date: 2026-05-18
decision-makers: ['Tom Howard']
consulted: ['Tom Howard (via wr-architect:agent, wr-jtbd:agent review)']
informed: []
reassessment-date: 2026-08-18
supersedes:
  - 0009-scheduled-dependency-update-workflow
  - 0010-ai-agent-ci-trust-boundary
---

# 0017. Single-workflow inline-loop for autonomous dependency updates

## Context and Problem Statement

The autonomous dependency-update flow currently runs as two cooperating workflows:

- `.github/workflows/auto-update.yml` (ADR-0009) — detects safe updates, applies them, runs `npm run prepush`, opens a PR, enables auto-merge.
- `.github/workflows/auto-update-recover.yml` (ADR-0010) — fires on a `workflow_run` failure of `auto-update.yml` or `ci-publish.yml` when the head branch matches `auto/deps/*`, invokes `claude-code-action` with `--max-turns 1`, enforces a writable-paths allow-list and no-touch list via a post-hoc `git diff` audit, then either pushes a fix, labels `needs-human`, or closes the PR on a no-touch violation.

The split made sense under the original framing: the primary workflow's job was detection and PR creation; recovery was a post-hoc, best-effort fallback governed by a separate trust boundary, allowed to fire at most once per failure.

Two findings make that framing wrong for this repo:

1. **Maintainer design intent (confirmed 2026-05-18).** The intent is a single inline loop — detect → apply → check → claude-fix-loop → commit + merge — not a primary plus post-hoc recovery. The recovery agent was meant to be the _mechanism_ that closes the loop, not a fallback bolted on after the PR is opened. The "loop until green" character is load-bearing; the single-shot `--max-turns 1` was a fallback-shaped design, not the target.

2. **No human dev pool.** dry-aged-deps is operated as a fully-autonomous project. The recovery workflow's `needs-human` label path therefore terminates in dead-state accumulation, not escalation. JTBD-106 (amended 2026-05-18) and the new JTBD-008 reflect this: persistent failures must surface as inspectable, queryable PRs rather than labelled-for-humans state.

A consolidation is needed that:

- Preserves ADR-0010's trust boundary (writable-paths allow-list, no-touch list, post-diff audit, OAuth-only auth, bot co-author, agent PR comment) **verbatim**.
- Removes the `workflow_run`-triggered second workflow.
- Replaces the once-per-failure semantic with a bounded retry loop inside the primary workflow.
- Replaces the `needs-human` label dead-end with a failing-but-inspectable PR (auto-merge disabled).
- Anchors PR-as-inspection-surface in JTBD (JTBD-008) rather than treating it as an inferred preference.

## Decision Drivers

- **Maintainer design intent for inline-loop recovery** — confirmed 2026-05-18; the two-workflow split diverges from intent.
- **No human escalation channel** — JTBD-106 (amended) and project-level autonomy constraint; "leave for a human" is not a terminal state.
- **PR-as-inspection-surface** — JTBD-008 (new); the maintainer audits automated landings via the PR, not via Actions-tab archaeology.
- **Trust boundary survives verbatim** — ADR-0010's writable-paths allow-list, no-touch list, post-diff audit, OAuth-only auth, bot co-authorship, and agent PR comment must transfer byte-for-byte into the new workflow.
- **Single source of truth for "the bump worked"** — `npm run prepush` in the runner matches CI exactly per CLAUDE.md, so cross-workflow `workflow_run` triggers add no signal that prepush does not already carry.
- **Capacity discipline** — Claude Code OAuth subscription billing; the retry budget must bound worst-case draw per scheduled run.
- **Discoverability of failure** — budget-exhaustion needs a queryable record, not just a red X on the Actions tab.
- **Avoid duplicate PR churn** — multiple scheduled runs against a persistently-failing bump-set must not accumulate redundant PRs.

## Considered Options

1. **Status quo: two workflows (ADR-0009 + ADR-0010).** Keep `auto-update.yml` and `auto-update-recover.yml` as deployed today.
2. **Single inline-loop workflow.** Collapse both files into one workflow with a bounded retry loop around prepush + claude-code-action; keep the PR with auto-merge on green and as a failing-inspectable PR (auto-merge disabled) on budget exhaustion.
3. **Drop recovery; auto-close failed PRs.** Keep only `auto-update.yml`; on prepush failure, close the PR and let the next scheduled run try fresh.
4. **Push direct to `main`; no PR ceremony.** Skip the PR entirely; bypass branch protection with the App token.

## Decision Outcome

Chosen option: **"Single inline-loop workflow"**, because it matches the maintainer's confirmed design intent, eliminates the cross-workflow `workflow_run` indirection that was load-bearing only under the old fallback framing, and lets recovery operate as the mechanism that closes the loop rather than a one-shot fallback — while preserving ADR-0010's trust boundary unchanged and anchoring the PR step in JTBD-008.

### Workflow shape

1. **Detect.** `dry-aged-deps --check --format=json`. Exit 0 → no updates → workflow exits cleanly. Exit 1 → safe updates present. Other exit → fail loud.
2. **Skip-if-same-bump-already-open.** Query `gh pr list --head 'auto/deps/*' --state open --json title,body,number`. If an open PR carries the same `pkg@version` bump-set as today's `updates.json`, exit cleanly without further work (no apply, no commit, no PR).
3. **Apply.** `dry-aged-deps --update --yes`, then `npm install --ignore-scripts --package-lock-only` to canonicalise the lockfile.
4. **Branch.** Check out `auto/deps/YYYY-MM-DD`.
5. **Bounded retry loop** (max iterations: `MAX_RETRIES=3`):
   1. Stage `package.json`, `package-lock.json`, and any agent-touched files from prior iterations.
   2. Capture pre-step SHA (`PRE_SHA=$(git rev-parse HEAD)`).
   3. Run `npm run prepush`.
   4. If green → break out of the loop.
   5. If red → invoke `claude-code-action` (`anthropics/claude-code-action@v1`) with the failure logs, the diff, and the ADR-0010 writable-paths / no-touch constraints (lifted verbatim into the prompt).
   6. Run the post-diff hard gate: `git diff $PRE_SHA HEAD` against the no-touch globs and the `package.json` forbidden-top-level-fields regex. Any violation → close the PR, comment with the violating file list, and abort the entire workflow with no further work.
   7. Re-stage agent changes; continue to the next iteration.
6. **On green prepush:** commit (conventional commit type derived from `updates.json` severity, per the rule preserved from ADR-0009); mint the OIDC-exchanged App installation token (per ADR-0012); push; open PR; post an agent PR comment summarising the bump set and any recovery iterations applied (per ADR-0010 §Audit log); enable `gh pr merge --auto --squash`.
7. **On budget exhaustion** (loop reached `MAX_RETRIES` iterations without green): commit the current state (including any partial agent fixes that did not violate the no-touch list); push; open the PR with auto-merge **disabled**; embed the failure context (last `npm run prepush` output, agent attempt history, current diff summary) in the PR body. Post the same kind of agent PR comment summarising what was attempted (per ADR-0010 §Audit log). The PR is the inspection surface (per JTBD-008).

### What carries forward verbatim from ADR-0010

- **Writable-paths allow-list:** `src/**/*.js`, `bin/**/*.js` (no exit-code semantics changes), `test/**/*.js` (incl. snapshots/fixtures), `package.json` (deps/devDeps sections only), `package-lock.json`.
- **No-touch list (16 entries):** `.nsprc`, `docs/security-incidents/**`, `.releaserc.json`, `docs/decisions/**`, `docs/jtbd/**`, `prompts/**`, `.husky/**`, `.github/workflows/**`, `commitlint.config.cjs`, `eslint.config.js`, `tsconfig.json`, `.dry-aged-deps.json`, `CLAUDE.md`, `CHANGELOG.md`, `.voder/**`, and `package.json` top-level non-deps fields (`version`, `scripts`, `engines`, `publishConfig`, `repository`, `license`, `main`, `bin`, `type`, `name`).
- **Post-diff hard gate as a workflow step** (not just prompt text). The audit runs **inside the loop after each agent invocation** AND implicitly again on the final commit before push — the last iteration's audit IS the last gate before any push happens, so no separate "final audit" step is required.
- **Agent PR comment** summarising what changed and why, for human-readable audit (carries forward ADR-0010 §Audit log bullet 3).
- **OAuth-only auth:** `CLAUDE_CODE_OAUTH_TOKEN` referenced exclusively; `ANTHROPIC_API_KEY` never used (carries forward ADR-0010 §Funding-model amendment 2026-05-12).
- **Bot co-authorship on agent commits** (`Co-Authored-By: claude-code-action[bot] ...` or equivalent identifier; scheduled-workflow commits remain co-authored by `github-actions[bot]`).
- **OIDC token-exchange auth model** for git push / `gh` CLI operations (ADR-0012 unchanged).

### Explicit policy breaks vs ADR-0010

These ADR-0010 policy elements are deliberately replaced by this ADR (not preserved):

- **ADR-0010 Confirmation #3 ("at most once per failing run, no retry loop").** Replaced by the bounded retry loop (`MAX_RETRIES=3`). This is the single largest semantic change — recovery transitions from a one-shot fallback to the in-loop mechanism that closes the loop.
- **ADR-0010 §Required labels (`needs-human`).** Removed entirely. The label was a human-escalation channel; with no human dev pool, the equivalent surface is a failing PR with auto-merge disabled and failure context in the body. Repositories adopting this ADR may also delete the `needs-human` label itself; no workflow code references it.
- **ADR-0010 §Reassessment-criterion-3 ("recovery fires more often than ~25% of scheduled runs").** Replaced by a budget-exhaustion-rate criterion (see §Reassessment Criteria #1) — the old metric became meaningless under inline-loop because the agent fires on every failing prepush by design.

## Consequences

### Good

- One workflow file to read, reason about, and maintain. The cross-workflow `workflow_run` indirection is gone.
- Recovery is the mechanism that closes the loop, not a fallback. The agent gets to iterate: an iteration that improves but does not fully fix can still feed the next prepush + agent turn with refined context.
- Per-iteration hard gate means a violation in turn 1 cannot poison turn 2's baseline. The trust boundary tightens, not weakens.
- The PR is always the maintainer's inspection surface (green → merged record; red → failing-but-readable record), satisfying JTBD-008.
- Skip-if-same-bump-already-open prevents the autonomous schedule from accumulating duplicate PRs against a persistently-failing bump-set; at most one PR per bump-set is in flight.
- No `needs-human` label dead-end. Failures surface where they will actually be seen.

### Neutral

- Retry budget `MAX_RETRIES=3` per scheduled run. Capacity math (worst case): `3 turns × failure_rate × daily_runs`. At `daily_runs = 1` and `failure_rate = 1` (every run fails to green and reaches budget exhaustion), the upper bound is 90 turns/month. ADR-0010's predecessor capped at ~7.5 turns/month (1 turn × 0.25 firing-rate × 30 days) under its 25% reassessment threshold — so the new design's _worst case_ is ~12× the predecessor's _threshold case_. Actual draw depends on green-on-iteration-1 rate, which the predecessor never measured.
- The conventional-commit-type derivation (`chore(deps):` vs `fix(deps):` from severity) is preserved exactly as ADR-0009 specified — semantic-release behaviour (ADR-0005) is unchanged.
- Branches remain dated `auto/deps/YYYY-MM-DD`; multiple persistently-failing distinct bump-sets across different days can each have their own open failing PR until manually closed. The skip-if-same-bump-already-open check de-dupes within a bump-set, not across distinct bump-sets.

### Bad

- **prepush-vs-ci-publish.yml gap accepted.** The new design treats `npm run prepush` inside the workflow as the authoritative "did it work?" signal. If `prepush` passes locally but `ci-publish.yml` fails on the PR (matrix differences, environment drift, secrets-only steps), there is no automated recovery — the PR sits with auto-merge enabled but failing the required check, awaiting manual intervention or a re-run. ADR-0010's `workflow_run`-on-`ci-publish.yml` listener used to catch this class; the inline-loop does not.
- **Capacity worst-case ~12× the predecessor's threshold case.** Subscription-billed; no hard cost ceiling beyond Anthropic's usage caps. See Neutral §1.
- **Concurrency model lengthens.** A single `auto-deps` concurrency group (queue-not-cancel) still applies, but the workflow runtime per invocation grows (up to `MAX_RETRIES` agent turns + same number of prepush runs). Long-running invocations could collide with manual `workflow_dispatch` invocations more visibly.
- **`needs-human` label dropped.** Persistent failures no longer carry a discoverable label; the failing PR itself is the only signal. Maintainers who relied on label-based PR queries must switch to filtering by auto-merge-disabled state, by branch prefix, or by failed CI check.
- **Once-per-failure policy broken.** ADR-0010 Confirmation #3 is explicitly superseded. The bounded loop is the new policy.

## Confirmation

This decision is implemented when:

1. Only `.github/workflows/auto-update.yml` exists in the workflows directory for the auto-update flow; `auto-update-recover.yml` is removed (`git status` post-implementation shows the deletion).
2. The workflow contains a bounded loop around the prepush → claude-code-action → post-diff-audit sequence, with the iteration cap expressed as a literal `MAX_RETRIES=3` shell variable or an equivalently grep-able pattern (`grep -nE 'MAX_RETRIES=3|for i in 1 2 3|seq 1 3' .github/workflows/auto-update.yml` returns at least one match).
3. The post-diff audit step is present **inside** the loop body — each iteration calls `git diff $PRE_SHA HEAD` against the same no-touch globs and `package.json` forbidden-fields regex as ADR-0010's predecessor. The last iteration's audit (whether the loop exits on green or on budget exhaustion) is the last enforcement gate before any push step.
4. The writable-paths allow-list and no-touch list in the workflow's claude-code-action prompt and in the post-diff audit step match the ADR-0010 lists byte-for-byte. A textual `diff` against the predecessor's prompt and audit-step regex returns only the loop-wrapping context, never a line within the allow-list or no-touch list itself.
5. `CLAUDE_CODE_OAUTH_TOKEN` appears in the workflow file (referenced by the `claude-code-action` step); `ANTHROPIC_API_KEY` does NOT appear anywhere in the workflow file (`grep -c ANTHROPIC_API_KEY .github/workflows/auto-update.yml` returns `0`).
6. On green prepush, the workflow contains an explicit `gh pr merge --auto --squash` invocation. On budget exhaustion (loop falls through to iteration `MAX_RETRIES+1`), the workflow opens the PR **without** invoking `gh pr merge --auto` — and embeds the last `npm run prepush` output and agent attempt summary in the PR body.
7. Before `dry-aged-deps --update --yes` runs, the workflow contains a step that queries `gh pr list --head 'auto/deps/*' --state open` and exits cleanly (no apply, no commit, no PR) if an open PR's body contains the same `pkg@version` bump-set as the current `updates.json`.
8. Every PR opened by this workflow contains an agent PR comment summarising the bump-set and (if recovery iterations ran) what each agent turn changed and why. The comment is posted via `gh pr comment` from the workflow OR via the claude-code-action's own PR-comment surface.
9. Agent-produced commits in the loop carry a `Co-Authored-By:` trailer referencing the agent identity (e.g. `claude-code-action[bot]`); the scheduled-workflow's own commits carry the `Co-Authored-By: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>` trailer (carries forward ADR-0010 §Audit log bullet 2).
10. The OIDC token-exchange flow (ADR-0012) is unchanged: the workflow contains a "Mint GitHub App installation token" step that exchanges the OIDC token at `https://api.anthropic.com/api/github/github-app-token-exchange` and uses the resulting token for `git push` (HTTP basic with `x-access-token`) and `gh` CLI operations (bearer). The step text matches the predecessor workflow's "Mint" step byte-for-byte.

## Pros and Cons of the Options

### Option 1: Status quo (two workflows)

- Good: ships today; trust boundary clearly separated into a dedicated file; once-per-failure recovery is mechanically simple to reason about.
- Good: `workflow_run`-on-`ci-publish.yml` does catch the post-PR CI-vs-prepush gap.
- Bad: diverges from confirmed maintainer design intent (single inline loop).
- Bad: `needs-human` label terminates in dead state — no human pool to escalate to.
- Bad: cross-workflow indirection adds reading and maintenance cost without adding signal that prepush does not already provide.
- Bad: `--max-turns 1` caps the agent's ability to iterate within a single failing-run context.

### Option 2: Single inline-loop workflow (chosen)

- Good: matches maintainer design intent.
- Good: per-iteration hard gate is tighter than post-hoc once-per-failure audit.
- Good: PR is always the inspection surface (JTBD-008); no parallel `needs-human` channel.
- Good: skip-if-same-bump-already-open prevents duplicate-PR accumulation.
- Bad: prepush-vs-ci-publish.yml gap accepted (see §Bad consequences).
- Bad: capacity worst-case ~12× predecessor's threshold case.
- Bad: requires explicit supersession of ADR-0010 Confirmation #3 ("at most once per failing run").

### Option 3: Drop recovery; auto-close failed PRs

- Good: minimal architecture; no agent invocation; no subscription draw.
- Good: simpler than either workflow design.
- Bad: silently discards information the recovery agent could fix; every persistently-broken bump-set loops (close, re-bump tomorrow, re-close, …) with no signal that something is genuinely wrong.
- Bad: no memory between scheduled runs (without adding a quarantine list or similar persistence layer); CI cost burns per retry.
- Bad: forfeits the upside cases where the agent does produce a clean fix.

### Option 4: Push direct to `main`; no PR ceremony

- Good: simplest possible flow; no PR step.
- Bad: forfeits the JTBD-008 inspection surface; maintainer must reconstruct what landed from `git log` alone.
- Bad: requires bypass-branch-protection on the App token, broadening the App's privileges beyond what ADR-0012 currently arranges.
- Bad: loses the `pull_request`-triggered `ci-publish.yml` run as a required gate; main could land a green-prepush-but-red-ci-publish change with no automated catch.

## Reassessment Criteria

Reassess by **2026-08-18** (3-month default), or earlier if any of the following conditions hold:

1. **Budget-exhaustion rate exceeds 25% of scheduled runs over a calendar month.** Replaces ADR-0010 §Reassessment-criterion-3's "recovery fires more often than ~25% of scheduled runs" — that metric became meaningless under inline-loop because the agent fires on every failing prepush by design, not only on a separately-triggered recovery. The budget-exhaust rate is the meaningful analogue: it measures the rate at which `MAX_RETRIES` agent turns are insufficient to reach green.
2. **The prepush-vs-ci-publish gap manifests more than once.** If a green-prepush PR opened by this workflow is followed by a red `ci-publish.yml` run on the PR's `pull_request` trigger, the gap is real and the design needs revision (likely toward CI-equivalence assertion or a re-introduced post-PR recovery surface).
3. **A single scheduled run's Claude subscription draw is flagged by Anthropic usage alerting.** Concrete threshold to be set on first observation; the design assumes worst-case `MAX_RETRIES` turns per run is acceptable.
4. **Skip-if-same-bump-already-open false-positive observed.** If a same-bump-set check incorrectly skips a run where the open PR's failure has since been fixed upstream, the detection logic needs refinement (e.g. check the open PR's CI status before skipping).
5. **Maintainer manually closes ≥ 3 failing auto-deps PRs in a quarter.** Indicates the failing-PR inspection surface is generating churn rather than signal; revisit the "fail loud via PR" choice.

### Related decisions and JTBDs

- **Supersedes ADR-0009** (Scheduled Autonomous Dependency-Update Workflow) — workflow shape; renamed to `.superseded.md` per ADR-0011.
- **Supersedes ADR-0010** (AI Agent CI Trust Boundary for Dependency-Update Recovery) — trust boundary; renamed to `.superseded.md` per ADR-0011. All non-superseded elements (writable-paths, no-touch list, post-diff audit, OAuth-only, bot co-author, agent PR comment) carry forward verbatim into the §Decision Outcome above.
- **References ADR-0011** (ADR Format and Lifecycle) — amended in the same commit to allow list-form `supersedes` / `superseded-by`.
- **References ADR-0012** (Autonomous Workflow Authentication Mechanism) — unchanged; the OIDC token-exchange model and `x-access-token` push transport carry into this workflow exactly as before.
- **References ADR-0005** (Semantic-Release Version Management) — unchanged; the conventional-commit-type derivation rule is preserved so semantic-release continues to produce correct release notes.
- **References ADR-0008** (better-npm-audit for Vulnerability Exceptions) — `.nsprc` remains on the no-touch list; agent cannot weaken or rewrite audit exceptions.
- **Driven by JTBD-106** (Recover from automated-PR failures without paging a human; amended 2026-05-18 for no-human-pool reality) — desired outcomes now describe a bounded retry budget with budget-exhaust = failing inspectable PR, no human escalation channel.
- **Driven by JTBD-008** (Inspect what an automated update landed and why; new 2026-05-18) — anchors the PR-as-inspection-surface design driver.
