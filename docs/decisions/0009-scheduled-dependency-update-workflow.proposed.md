---
status: 'proposed'
date: 2026-05-11
decision-makers: ['Tom Howard']
consulted: []
informed: []
reassessment-date: 2026-08-11
---

# 0009. Scheduled Autonomous Dependency-Update Workflow

## Context and Problem Statement

The project depends on a routine flow of safe dependency updates to keep pace with upstream patches without exposing itself to rushed or compromised releases. The `dry-aged-deps` CLI in this repository already enforces that flow at the developer's machine: it filters `npm outdated` to updates that have aged beyond a configurable threshold (default 7 days) and are free of known vulnerabilities. Applying it still requires a human to run the tool, install the updates, commit, push, and watch the release pipeline.

That manual dependency on a maintainer's machine has three concrete problems:

1. **Latency.** Aged-and-safe updates accumulate between human sessions. Security-relevant patches that have already cleared the 7-day soak window sit unapplied for days.
2. **Availability.** The maintainer cannot guarantee their machine is online to perform routine maintenance.
3. **Inconsistency.** When updates are applied opportunistically, batches grow large and PRs become harder to reason about, defeating the design goal of small, low-risk, high-frequency dependency hygiene.

An architecture consultation enumerated four option families for an autonomous workflow: a pure scheduled GitHub Actions workflow (Option A); GitHub Actions plus the Anthropic Claude Code Action on every run (Option B); a scheduled remote Claude agent that runs entirely off-repo (Option C); and a hybrid in which GitHub Actions owns the mechanical update path and an AI agent is invoked only on CI failure (Option D).

This ADR records the scheduled-update workflow itself — its trigger, what it does, how its output reaches `main`, and who acts as its author. A companion ADR (0010) records the AI agent CI trust boundary that applies when the hybrid escalates to autonomous fix-up.

The relevant JTBD jobs this workflow implements are JTBD-103 (run dependency hygiene autonomously on a schedule), JTBD-104 (open a pull request for safe updates without human intervention), and JTBD-105 (compose correctly with semantic-release's commit-analyzer) from the CI/Automation Engineer persona in `docs/jtbd/`.

## Decision Drivers

- **ADR-0005 (semantic-release)** owns versioning and publishing. Automation must produce commits the commit-analyzer can interpret correctly. By default, bare `chore:` does not trigger a release; `fix:` and `feat:` do. Dependency-update commits should therefore use `chore(deps):` for non-security bumps and `fix(deps):` for security-driven bumps so that security patches reach the registry promptly and routine bumps batch until a real release.
- **ADR-0008 (better-npm-audit)** owns the security exception list in `.nsprc`. The automation must keep `npm run audit:ci` green and must never silently add or remove `.nsprc` exceptions.
- **Existing CI gate.** `ci-publish.yml` already runs the full build-and-test suite on pull requests. The scheduled workflow must produce PRs that this existing CI gates, not a parallel validation surface that could drift.
- **Specs-before-code (`CLAUDE.md`).** Documenting the policy in an ADR before adding the workflow file is mandatory.
- **JTBD-103 outcomes.** A documented cadence; manual dispatchability; bounded resources and predictable runtime.
- **JTBD-104 outcomes.** Identifiable bot account; project commit-message conventions; reuses the same `build-and-test` job that gates human PRs; squash-mergeable.
- **JTBD-105 outcome.** The choice of commit type must be derived from data `dry-aged-deps` already produces (severity information), not from human judgement.
- **No-silent-failures rule (`CLAUDE.md`).** The workflow must not use `|| echo {}` or similar patterns; it must let commands fail so root causes are addressable.
- **Trunk-based development.** The project follows TBD: the maintainer pushes directly to `main` and integration is continuous. Branch protection on `main` must not require PRs for human contributors — direct pushes by the maintainer must remain possible. The auto-merge contract here therefore relies on required _status checks_ but explicitly NOT on required pull requests.

## Considered Options

1. **Pure scheduled GitHub Actions workflow opening a PR with `gh pr merge --auto --squash`** — the happy path of Option D from the architecture consultation. AI escalation on failure is covered by ADR-0010.
2. **Direct push to `main`** — bot pushes `chore(deps):` straight to `main` after local `prepush` passes.
3. **PR without auto-merge** — bot opens the PR; maintainer reviews and merges manually.
4. **Weekly cadence** — run the workflow once a week instead of daily.
5. **Always use `chore(deps):` regardless of security status** — drop the `fix(deps):` distinction.
6. **Run on every push to `main` instead of on a schedule.**
7. **Use Dependabot or Renovate instead.**

## Decision Outcome

Chosen option: **Pure scheduled GitHub Actions workflow opening a PR with `gh pr merge --auto --squash`**, because it produces an auditable PR validated by the existing `ci-publish.yml` build-and-test job, requires no new long-lived secrets, composes correctly with semantic-release, and preserves a human-visible window between PR creation and auto-merge.

### Workflow policy

| Parameter                   | Value                                                                                                                                                          | Rationale                                                                                                                                                                                                                                                                               |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trigger                     | `schedule: cron '0 6 * * *'` plus `workflow_dispatch`                                                                                                          | Daily 06:00 UTC catches updates as soon as they cross the 7-day age threshold; small per-PR diff; minimal Actions minutes. Manual dispatch retained for on-demand runs and testing (JTBD-103 outcome).                                                                                  |
| Detection                   | `node bin/dry-aged-deps.js --check` (ADR-0004)                                                                                                                 | Exit 1 signals "updates available"; exit 0 short-circuits the workflow with no PR.                                                                                                                                                                                                      |
| Application                 | `node bin/dry-aged-deps.js --update --yes` against the default `--min-age=7`                                                                                   | Aligns with the tool's documented default and its supply-chain rationale. No project-specific override.                                                                                                                                                                                 |
| Validation                  | `npm ci && npm run prepush` inside the runner                                                                                                                  | Same suite the husky pre-push hook runs locally. PR will not be opened if local validation fails.                                                                                                                                                                                       |
| Landing mode                | Pull request, not direct push to `main`                                                                                                                        | Re-uses the existing `ci-publish.yml` build-and-test job as the canonical gate (JTBD-104 outcome). `GITHUB_TOKEN` would not trigger downstream workflows on a direct push; this avoids that whole class of issue.                                                                       |
| Commit type                 | `chore(deps): update safe dependencies` by default; `fix(deps):` when any included row has a non-`none` `severity` in the `dry-aged-deps --format=json` output | Interacts correctly with semantic-release's commit-analyzer (ADR-0005). Security updates trigger a patch release; routine bumps batch until the next `feat:` or `fix:`. Derivation is mechanical from JSON output (JTBD-105 outcome).                                                   |
| Commit-type derivation rule | `severity === 'none'` ∀ rows → `chore(deps):`; otherwise → `fix(deps):`                                                                                        | Conservative: any non-`none` severity in any included row promotes the entire commit to `fix(deps):` so the security patch ships at next CI run.                                                                                                                                        |
| Branch name                 | `auto/deps/YYYY-MM-DD`                                                                                                                                         | Stable, sortable, predictable. One branch per scheduled run; subsequent runs open new branches rather than amending.                                                                                                                                                                    |
| Bot identity                | `github-actions[bot]` for commits; PR creation uses a fine-grained bot PAT stored as `DEPS_BOT_TOKEN`                                                          | A new repo secret is required because GitHub does not fire `pull_request` event workflows for PRs opened by `GITHUB_TOKEN` (see "Required secrets" below). Commits are still attributed to `github-actions[bot]` so blame is clear (JTBD-104 outcome — bot account, not impersonation). |
| Permissions                 | `contents: write`, `pull-requests: write` on the scheduled job                                                                                                 | Minimum required to push a branch and open a PR.                                                                                                                                                                                                                                        |

### Required secrets

The auto-merge contract in this ADR requires that the PR created by the scheduled workflow trigger `ci-publish.yml`'s `build-and-test` job. GitHub does not run `pull_request`-event workflows for PRs opened by the workflow-scoped `GITHUB_TOKEN` — this is a deliberate platform safety rule to prevent recursive workflow runs.

To satisfy the contract, the project must provision:

- **`DEPS_BOT_TOKEN`** — a fine-grained personal access token (or a GitHub App installation token) with `contents: write` and `pull-requests: write` scoped to this repository. The token is used by the workflow only for `gh pr create` and `gh pr merge --auto --squash`. Branch pushes use `GITHUB_TOKEN` (the bot identity for commits remains `github-actions[bot]`).

`ANTHROPIC_API_KEY` is governed by ADR-0010 and is not required by this ADR.

### Required branch-protection configuration

The auto-merge contract requires a specific branch-protection shape on `main` that must NOT conflict with the project's trunk-based development model. The maintainer pushes directly to `main`; that capability must be preserved.

Configure branch protection on `main` (classic branch protection or GitHub Rulesets) with these settings:

- **Required status checks** — enable; mark the `Build & Test` job from `ci-publish.yml` as required. This is the gate `gh pr merge --auto --squash` waits on.
- **Require a pull request before merging** — leave **DISABLED**. Enabling this would block the maintainer's direct pushes and break TBD.
- **Restrict pushes that create matching branches** — leave **DISABLED**. Direct pushes to `main` must remain possible for the maintainer.
- **Do not allow bypassing the above settings** — leave **DISABLED**, so admin pushes succeed even when CI temporarily lags.

The trade-off: required status checks may in some GitHub configurations gate direct pushes as well as PR merges. Verify by performing a single direct push after configuration; if blocked, switch to Rulesets and scope the rule to bot actors only.

| Auto-merge | `gh pr merge --auto --squash` | Squash keeps git history linear and gives semantic-release exactly one `chore(deps):` or `fix(deps):` commit per PR. Native auto-merge requires the existing `ci-publish.yml` build-and-test status check to be marked required on `main` via branch protection (configured per "Required branch-protection configuration" above). |
| Concurrency | `concurrency: group: auto-deps, cancel-in-progress: false` | Prevents two scheduled runs racing. New runs queue rather than cancel so a manual dispatch never aborts an in-flight automated PR. |
| Failure behaviour | Workflow fails loudly; PR is left in failed state for the AI escalation path in ADR-0010 to act on. The workflow does NOT swallow errors with `|| true` or `|| echo {}`. | Keeps this ADR's contract simple. Recovery is a separate concern (`CLAUDE.md` "no silent failures" rule). |

### Out of scope for this ADR

- AI-assisted recovery from `prepush` or `ci-publish.yml` failures. Governed by ADR-0010.
- Major-version bumps. `dry-aged-deps` does not currently distinguish semver-major from semver-minor in its default flow; if a major bump lands in the PR, the existing `prepush` and CI gates will catch breakage as they would for any other PR.
- Lockfile-only refreshes outside the `npm outdated` flow.
- Coordination with future Dependabot or Renovate configurations. The intent is that this workflow replaces that role for this project.

## Consequences

### Good

- **Autonomous routine hygiene.** Aged-and-safe updates land within a day of crossing the threshold without requiring the maintainer's machine.
- **Minimal secret surface.** Only one new secret (`DEPS_BOT_TOKEN`) is introduced; commits still use `GITHUB_TOKEN`. The recovery workflow's `ANTHROPIC_API_KEY` is governed separately by ADR-0010.
- **One canonical CI gate.** The PR is validated by the same `ci-publish.yml` build-and-test job that gates human PRs, so there is no second validation surface to keep in lockstep.
- **Clean release semantics.** `chore(deps):` and `fix(deps):` commits compose correctly with semantic-release: routine bumps accumulate without forcing releases; security bumps trigger patch releases.
- **Human reviewable.** The PR is visible and squashable on demand for the period between opening and auto-merge.
- **Auditable.** Every automated change is a real PR with a real CI run attached to it. The whole audit trail lives on GitHub, version-controlled implicitly via the workflow file.

### Neutral

- **Branch accumulation.** Failed PR branches (`auto/deps/YYYY-MM-DD`) persist on the remote until cleaned up. Auto-merged branches are deleted by squash-merge. A separate housekeeping policy may be useful later but is not required now.
- **Commit-type derivation.** Identifying whether an update batch should be `chore(deps):` or `fix(deps):` requires reading the JSON output of `dry-aged-deps`. This is straightforward and aligned with JTBD-105.

### Bad

- **Branch protection coupling.** Native auto-merge requires the `build-and-test` job to be marked required on `main` via branch protection. The project must therefore configure branch protection if it has not already; this is a one-time setup cost and a small ongoing operational dependency. The TBD constraint adds a configuration trap: "Require a pull request before merging" must remain disabled; otherwise the maintainer's direct pushes are blocked.
- **`DEPS_BOT_TOKEN` rotation.** The fine-grained PAT (or App credential) must be created, stored, and periodically rotated. This is the project's first long-lived credential beyond `NPM_TOKEN` and adds a small ongoing operational cost. Mitigated by scoping the token to this repository and to `contents: write` + `pull-requests: write` only.
- **One PR per day even on quiet weeks.** When no updates are available, the workflow runs and exits cleanly with no PR — minimal noise. When one or two trivial updates are available daily, the maintainer sees a steady drip of small PRs. This is by design but is a behaviour change from the manual flow.
- **No major-version safety net beyond CI.** Major bumps that include breaking changes will fail `prepush` or `ci-publish.yml` and leave a failing PR. The recovery path is ADR-0010's escalation; if that is not yet implemented, a maintainer must intervene manually.

## Confirmation

This decision is implemented when all of the following hold:

1. A file `.github/workflows/auto-update.yml` exists, triggers on `schedule: cron '0 6 * * *'` and `workflow_dispatch`, and runs as `github-actions[bot]` with `permissions: contents: write, pull-requests: write` scoped to the job.
2. The workflow invokes `node bin/dry-aged-deps.js --check`, short-circuits with exit 0 on no updates, and on exit 1 proceeds to apply updates via `node bin/dry-aged-deps.js --update --yes`.
3. The workflow runs `npm ci && npm run prepush` before pushing.
4. On `prepush` success, the workflow pushes an `auto/deps/YYYY-MM-DD` branch and opens a PR titled with `chore(deps):` (or `fix(deps):` when any row's `severity` is non-`none`) and a body summarising the rows produced by `dry-aged-deps`.
5. The workflow calls `gh pr merge --auto --squash` on the PR.
6. Branch protection on `main` requires the `Build & Test` status check from `ci-publish.yml` AND does NOT require a pull request before merging (preserves TBD for the maintainer's direct pushes).
7. Two consecutive successful scheduled runs land their PRs onto `main` without human intervention, with semantic-release publishing a release on the `fix(deps):` case and no release on the `chore(deps):` case.
8. No `ANTHROPIC_API_KEY` or other AI-related secret is required for this workflow to function (such secrets are governed by ADR-0010).
9. `DEPS_BOT_TOKEN` is configured at the repo level and is referenced by `auto-update.yml` only for `gh pr create` and `gh pr merge --auto --squash`. The token is NOT used for `git push` (which uses `GITHUB_TOKEN`).
10. No step in the workflow uses `|| echo {}`, `|| true`, or any silent-failure pattern.

## Pros and Cons of the Options

### Option 1 — Scheduled GH Actions + PR with auto-merge (chosen)

- Good: aligned with JTBD-103, JTBD-104, JTBD-105.
- Good: no new secrets; uses `GITHUB_TOKEN`.
- Good: reuses the existing `ci-publish.yml` gate.
- Good: composes correctly with semantic-release.
- Bad: requires branch protection on `main` to be configured.

### Option 2 — Direct push to `main`

**Approach.** Bot pushes `chore(deps):` straight to `main` after a successful local `prepush`. `ci-publish.yml` runs and semantic-release publishes.

- Good: faster path to release.
- Good: less workflow ceremony.
- Good: no branch-protection coupling required.
- Bad: a direct push by `GITHUB_TOKEN` does not trigger downstream workflows by default — would require a dedicated bot PAT, introducing a new secret.
- Bad: bypasses the PR review surface, removing the brief human-visible window during which a maintainer can intervene.
- Bad: failure recovery becomes a force-push or revert rather than abandoning a PR.
- Rejection reason: the cost of a new PAT secret and the loss of PR-level reviewability outweigh the small latency gain.

### Option 3 — PR without auto-merge

- Good: maximum human oversight on every change.
- Good: trivial to implement.
- Bad: defeats the primary goal of running without the maintainer's machine being available.
- Bad: reduces the workflow to a Dependabot-style PR opener.
- Rejection reason: inconsistent with the autonomy requirement that motivated the work (JTBD-103).

### Option 4 — Weekly cadence

- Good: larger batched PRs; fewer PRs to manage; lower Actions minutes.
- Bad: slows response to security-relevant patches by up to a week after they clear the 7-day soak window.
- Bad: larger batches are harder to reason about when they do fail.
- Bad: the marginal cost of a daily run is minimal.
- Rejection reason: the supply-chain rationale of `dry-aged-deps` favours responsiveness once the soak threshold is met.

### Option 5 — Always use `chore(deps):` regardless of security status

- Good: simpler workflow logic.
- Good: no need to inspect security data.
- Bad: security patches do not reach the npm registry until the next unrelated release.
- Bad: violates JTBD-105 outcome that the choice be derived from data, not human judgement (it is derived, but with the wrong rule).
- Rejection reason: releasing security patches promptly is a core value of this project.

### Option 6 — Run on every push to `main`

- Good: no idle scheduled runs.
- Bad: couples dependency-update cadence to unrelated commit activity.
- Bad: quiet weeks would see no updates at all; active weeks would generate many redundant runs.
- Rejection reason: decouples poorly from the actual driver (npm registry age), which is time-based.

### Option 7 — Dependabot or Renovate

- Good: mature, well-maintained, widely understood.
- Good: no new GitHub Actions code to write.
- Bad: neither service applies a 7-day-aged-plus-vulnerability filter with `dry-aged-deps` semantics.
- Bad: routing this project's own dependency updates through someone else's tool would undermine the dogfooding that drives the project's design feedback.
- Rejection reason: dogfood the tool the project ships.

## Reassessment Criteria

Reassess this decision when any of the following occur:

1. The failure rate of `prepush` on automated dep-update PRs exceeds roughly one in five over a four-week window — the ADR-0010 escalation either becomes essential or this workflow becomes net-negative.
2. The volume of daily updates drops to near zero for a sustained period — a weekly cadence may then be more appropriate.
3. Branch protection on `main` is changed in a way that breaks the auto-merge contract, OR in a way that blocks the maintainer's direct pushes (the TBD constraint).
4. A future ADR changes the release model away from semantic-release (the commit-type policy here would need to be re-derived).
5. GitHub introduces a feature that makes the `GITHUB_TOKEN` downstream-trigger caveat no longer relevant.
6. Three months from the date on this ADR (2026-08-11), as a default review checkpoint.

## Related Decisions

- **ADR-0003 (Exit Code Standardization).** The scheduled workflow relies on exit codes 0/1/2 to branch behaviour.
- **ADR-0004 (Check Mode for CI/CD Enforcement).** `--check` is the detection mechanism used by the workflow.
- **ADR-0005 (Semantic Release).** This ADR aligns its commit-type policy with semantic-release's commit-analyzer expectations.
- **ADR-0008 (better-npm-audit).** The workflow must keep `audit:ci` green and must not modify `.nsprc`.
- **ADR-0010 (proposed).** Governs the failure-recovery escalation that complements this workflow.

## References

- `bin/dry-aged-deps.js` — CLI entry point and exit-code contract.
- `.github/workflows/ci-publish.yml` — existing CI/release pipeline this workflow integrates with.
- `docs/jtbd/ci-automation-engineer/JTBD-103-run-on-schedule.proposed.md`
- `docs/jtbd/ci-automation-engineer/JTBD-104-open-pr-for-safe-updates.proposed.md`
- `docs/jtbd/ci-automation-engineer/JTBD-105-compose-with-semantic-release.proposed.md`
- [GitHub Actions: GITHUB_TOKEN permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)
- [GitHub: native auto-merge](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/automatically-merging-a-pull-request)
