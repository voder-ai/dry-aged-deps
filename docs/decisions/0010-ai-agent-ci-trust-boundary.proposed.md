---
status: 'proposed'
date: 2026-05-11
decision-makers: ['Tom Howard']
consulted: []
informed: []
reassessment-date: 2026-08-11
---

# 0010. AI Agent CI Trust Boundary for Dependency-Update Recovery

## Context and Problem Statement

ADR-0009 establishes a scheduled GitHub Actions workflow that opens a `chore(deps):` / `fix(deps):` PR for safe dependency updates and auto-merges on green. When the PR fails the existing `prepush` suite or the `ci-publish.yml` build-and-test job — because a bumped package shipped a renamed export, a deprecation warning that lint now treats as error, an updated type signature, an outdated snapshot, or similar fallout — the failure leaves a stalled PR. Without an autonomous recovery path, the maintainer must intervene manually, defeating the primary goal of ADR-0009 (a workflow that runs without depending on the maintainer's machine).

The recovery path needs an agent that can (a) read the failing CI logs and diff, (b) make a minimal, scoped change to fix the failure, and (c) push the fix to the PR branch so the next CI run can re-evaluate. The natural mechanism is the Anthropic `claude-code-action` GitHub Action, invoked with a tight prompt and a writable-paths allow-list.

But an AI with commit authority on a project's main branch (even indirectly via a PR branch that will auto-merge on green) is a new trust surface this project has never carried. The project's existing trust model is built on:

- ADR-0008's security-incident process for `.nsprc` exceptions (an exception requires a documented analysis).
- ADR-0005's semantic-release-owns-versioning contract.
- The husky `pre-push` suite and `ci-publish.yml` as canonical quality gates.
- `commitlint.config.cjs`, `eslint.config.js`, `tsconfig.json` as the policy surface for what "valid code" means.

A poorly bounded AI fixer could silently weaken any of these gates to make CI green — and the worst form of that failure is the one that _doesn't_ trip a human review because the PR auto-merges. The trust boundary must therefore be explicit, narrow, and defended by file-path rules.

The relevant JTBD job is JTBD-106 (recover-from-pr-failures) from the CI/Automation Engineer persona.

## Decision Drivers

- **JTBD-106 outcome.** "Failure context available to an automated fixer." The agent must have access to logs, diff, and failing test names.
- **JTBD-106 outcome.** "Writable-paths allow-list and never modifies security-sensitive files."
- **JTBD-106 outcome.** "At most one attempt per failure; persistent failures escalate to humans rather than thrashing."
- **JTBD-106 outcome.** "Governed by a documented trust boundary (this ADR)."
- **ADR-0008 integrity.** The agent must not silently widen the `.nsprc` exception list or the `audit:ci` `--exclude` list, because either would bypass the security-incident process.
- **ADR-0005 integrity.** The agent must not modify `.releaserc.json` or `package.json#version`, because either would interfere with semantic-release ownership.
- **Gate integrity.** The agent must fix root cause; it must not weaken the `prepush` suite, the husky hooks, the lint config, the commitlint config, the type-checker config, or the CI workflows in order to make CI pass.
- **Cost discipline.** AI invocation costs real money per call. The trust boundary should keep invocation rare (failure-only) and bounded (one retry per failure).

## Considered Options

1. **`claude-code-action` invoked on every scheduled run, with a small fix budget** — Option B from the architecture consultation.
2. **`claude-code-action` invoked only on `prepush` or `ci-publish.yml` failure, with a strict writable-paths allow-list and a single-retry policy** — failure-only escalation (Option D from the architecture consultation, this ADR's companion).
3. **A scheduled remote Claude agent that runs the whole workflow off-repo** — Option C from the architecture consultation.
4. **No AI escalation; leave failed PRs for a human.**

## Decision Outcome

Chosen option: **`claude-code-action` invoked only on `prepush` or `ci-publish.yml` failure, with a strict writable-paths allow-list and a single-retry policy**, because it confines AI authority to the moment of failure (rare events in steady state), keeps the happy path in human-auditable GitHub Actions, and preserves the project's existing trust gates.

### Invocation surface

- The agent fires only as a `workflow_run` follow-up to (a) the scheduled workflow defined in ADR-0009 when its `prepush` step fails, or (b) `ci-publish.yml`'s `build-and-test` job when it fails on a PR whose head branch matches `auto/deps/*`.
- The agent does not fire on any other branch, any human-authored PR, or any failure unrelated to the automated dep-update flow.
- The agent is invoked at most once per failing CI run. If the agent's fix is itself a failure, the run leaves the PR in failed state for human attention; the agent does not re-invoke.

### Inputs to the agent

- The failing job's full logs.
- The PR diff (the dep bump).
- The list of failing tests / failing lint rules / failing type errors, extracted by the workflow before invocation.
- A prompt that explicitly states the scope: "Investigate and fix only failures introduced by this dependency bump. Do not modify product behaviour. Do not weaken any quality gate. Do not touch files on the no-touch list. If the failure cannot be fixed within the writable-paths allow-list, exit with an explanation and let a human take over."

### Writable-paths allow-list

The agent may write to:

- `src/**/*.js` — production source.
- `bin/**/*.js` — CLI entry, **except** for code that changes exit-code semantics (see no-touch list).
- `test/**/*.js` — including snapshot files and fixtures.
- `package.json` — **only** the `dependencies` and `devDependencies` sections (for forward-pinning a known-broken transitive). All other `package.json` modifications require human review.
- `package-lock.json` — lockfile updates consistent with `package.json` changes.

### No-touch list (the agent must refuse to write these)

- `.nsprc` — ADR-0008 exception list.
- `docs/security-incidents/` — ADR-0008's documentation half.
- The `audit:ci` script value in `package.json` (the `--exclude` advisory IDs) — ADR-0008 second half of the exception record.
- `package.json#version` — ADR-0005 semantic-release ownership.
- `.releaserc.json` — ADR-0005 release configuration.
- `docs/decisions/` — every ADR in the project.
- `docs/jtbd/` — JTBD definitions and persona files.
- `prompts/` — user stories and traceability sources.
- `.husky/` — pre-commit and pre-push hooks.
- `.github/workflows/` — CI workflows (including the scheduled workflow itself).
- `commitlint.config.cjs` — Conventional Commits enforcement.
- `eslint.config.js` — ESLint policy (ADR-0007).
- `tsconfig.json` — TypeScript type-checking config (ADR-0006).
- `.dry-aged-deps.json` and any other checked-in `dry-aged-deps` config file — tech-lead persona policy artefact (JTBD-202, JTBD-205).
- `CLAUDE.md` and the project's other `*.md` policy files.
- `CHANGELOG.md` if present — semantic-release-managed.
- `.voder/` — AI development state per `CLAUDE.md`.

The no-touch list is enforced by:

1. The prompt itself, which lists every path.
2. A `workflow_run` post-step that diffs the agent's commit against the no-touch globs and aborts the PR (closes it, comments on it, leaves it for human review) if any no-touch file was modified. This is a belt-and-braces check.

### Retry and escalation policy

- One agent invocation per failing run.
- If the agent's fix passes a re-run of `prepush` and `ci-publish.yml`'s `build-and-test`, auto-merge proceeds as normal.
- If the agent's fix still fails CI, no further automation runs against that PR. The PR is labelled `needs-human` and remains open for the maintainer.
- If the agent's fix violates the no-touch list, the post-step closes the PR and comments with the violating file list.

### Secret management

- `ANTHROPIC_API_KEY` is stored as a repo secret.
- The secret is exposed only to the failure-handler job, not to the scheduled `auto-update.yml` workflow.
- The secret is rotated according to the project's general secret-rotation cadence (no project-specific rotation policy currently exists; a future ADR may add one).

### Audit log

- Every agent invocation produces a GitHub Actions run log; this is the audit trail.
- The agent's commit on the PR branch is co-authored by `claude-code-action[bot]` (or equivalent identifier) so blame is visible.
- The agent's PR comment lists what it changed and why, providing a human-readable summary at review time.

### Out of scope for this ADR

- Recovery from failures unrelated to the automated dep-update flow.
- Use of `claude-code-action` for code review, documentation, or any non-recovery purpose.
- Any agent capability that requires write access outside the allow-list.
- Cross-project agent coordination.

## Consequences

### Good

- **Autonomous recovery for the common case.** Dependency-bump fallout (snapshot updates, type signature drift, deprecation renames, lint rule changes) gets fixed without human intervention, satisfying JTBD-106.
- **Bounded AI authority.** The agent acts on a narrow surface, only on failure, only once. The cost and risk envelope is small.
- **Gate integrity preserved.** The no-touch list explicitly protects every documented quality gate, the security-incident process, and the policy artefacts that the project's personas care about.
- **Failures still escalate.** Persistent or out-of-scope failures land in a human's lap, not in `main`. The agent never papers over genuinely broken updates.
- **Reproducible audit trail.** Every agent action is a real GitHub Actions run, a real commit with co-authorship, and a real PR comment. There is no off-repo state.

### Neutral

- **One new secret.** `ANTHROPIC_API_KEY` joins the repo's secret surface. This is a real but small operational cost.
- **One new vendor relationship.** Anthropic becomes a CI dependency. If their API is unavailable, the failure-handler simply does not fire and the PR stays failed — equivalent to "no AI escalation" (Option 4).

### Bad

- **AI fallibility.** The agent may produce a fix that passes CI but is subtly wrong (for example, a test mock update that hides a real regression). The CI gate is the same gate that gates human PRs, so this risk is no worse than for a human PR — but it is also no better. The no-touch list mitigates the worst class of failure but cannot prevent every subtle one.
- **Cost on persistent failure.** A pathological day where many dependency bumps fail could fire many agent runs (one per failing PR). The single-retry policy bounds this per PR but not per day.
- **Belt-and-braces post-step required.** The no-touch enforcement must be implemented as a workflow step, not just as a prompt instruction. The prompt is a soft constraint; the post-step is the hard one.

## Confirmation

This decision is implemented when all of the following hold:

1. A workflow file (e.g. `.github/workflows/auto-update-recover.yml`) is configured as a `workflow_run` trigger on the `auto-update.yml` workflow (ADR-0009) and on `ci-publish.yml` for branches matching `auto/deps/*`.
2. The recovery workflow invokes `anthropics/claude-code-action` with the failing-job logs, the PR diff, and a prompt that lists the writable-paths allow-list and the no-touch list verbatim.
3. The recovery workflow runs at most once per failing run (no retry loop).
4. After the agent finishes, a workflow step diffs the agent's commit against the no-touch globs. If any file in the no-touch list was modified, the step closes the PR, comments on it with the offending files, and exits non-zero.
5. The `ANTHROPIC_API_KEY` secret is configured at the repository level and is referenced only by the recovery workflow.
6. The agent's commits are co-authored by an identifiable bot account (not impersonating a human).
7. Two consecutive simulated dep-bump failures with fixable root causes are recovered to green by the agent without any no-touch file being modified.
8. One simulated failure that requires modifying a no-touch file is correctly refused: the PR ends up closed-with-comment, not merged.

## Pros and Cons of the Options

### Option 1 — `claude-code-action` on every scheduled run

- Good: simplest invocation model (no `workflow_run` chaining).
- Bad: pays Anthropic API spend on every scheduled run including the dozens of clean ones.
- Bad: AI authority is the default path, not the exception.
- Rejection reason: paying for AI inference on every scheduled run is the worst cost/benefit point on the curve.

### Option 2 — Failure-only escalation with strict allow/no-touch lists (chosen)

- Good: matches cost to value — Anthropic API spend only on failures.
- Good: keeps the happy path in human-auditable GitHub Actions.
- Good: explicit writable-paths allow-list and no-touch list defend every existing gate.
- Good: single-retry policy avoids thrashing.
- Good: belt-and-braces post-step provides hard enforcement of the no-touch list.
- Bad: belt-and-braces post-step is real code to maintain.

### Option 3 — Scheduled remote Claude agent (off-repo)

- Good: uniquely able to watch `ci-publish.yml` through to npm publish and fix flakes in the publish job.
- Bad: the most important automation step lives outside the repo, conflicting with the spirit of `CLAUDE.md`'s "script centralisation" rule.
- Bad: secret blast radius — a PAT with `contents:write` is more powerful than a runner-scoped `GITHUB_TOKEN`.
- Bad: workflow not version-controlled in the repo.
- Rejection reason: gives up too much auditability for a small additional capability (publish-job recovery).

### Option 4 — No AI escalation

- Good: zero new trust surface, zero new secrets, zero new cost.
- Good: simplest possible mental model.
- Bad: every `prepush` or `ci-publish.yml` failure on an automated dep-update PR pages a human, defeating much of ADR-0009's autonomy goal.
- Bad: fails JTBD-106 outcomes.
- Rejection reason: leaves the automation half-finished. The scheduled workflow runs without a maintainer present but its failures require a maintainer present.

## Reassessment Criteria

Reassess this decision when any of the following occur:

1. The agent's commit produces a CI-green outcome that later turns out to mask a real regression (gate-integrity failure that the no-touch list did not prevent). One occurrence is a signal; two is a trigger for re-evaluating the writable-paths allow-list.
2. The no-touch post-step rejects more than ~25% of agent commits over a four-week window. Either the agent's prompt needs tightening or the no-touch list is too aggressive.
3. The recovery workflow fires more often than ~25% of scheduled runs — the steady-state cost of Anthropic API spend has crept beyond the failure-only assumption.
4. Anthropic changes the pricing or capability surface of `claude-code-action` such that the cost/value calculus shifts.
5. The maintainer's tolerance for AI-modified commits on `main` changes.
6. ADR-0005 (semantic-release ownership) or ADR-0008 (better-npm-audit exception process) is amended in a way that changes the no-touch list.
7. Three months from the date on this ADR (2026-08-11), as a default review checkpoint.

## Related Decisions

- **ADR-0009 (proposed).** The scheduled workflow whose failures this ADR's escalation handles.
- **ADR-0005 (Semantic Release).** Establishes the `package.json#version` and `.releaserc.json` no-touch entries.
- **ADR-0008 (better-npm-audit).** Establishes the `.nsprc`, `audit:ci` `--exclude` list, and `docs/security-incidents/` no-touch entries.
- **ADR-0006 (JSDoc Type Checking).** Establishes the `tsconfig.json` no-touch entry.
- **ADR-0007 (ESLint Plugin Selection).** Establishes the `eslint.config.js` no-touch entry.

## References

- `docs/jtbd/ci-automation-engineer/JTBD-106-recover-from-pr-failures.proposed.md`
- `docs/jtbd/tech-lead/JTBD-202-policy-as-code.proposed.md`
- `docs/jtbd/tech-lead/JTBD-205-tighten-policy-quickly.proposed.md`
- [`anthropics/claude-code-action`](https://github.com/anthropics/claude-code-action)
- `CLAUDE.md` — project trust model and "no silent failures" rule.
