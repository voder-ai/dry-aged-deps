# Problem 025: GitHub Actions deprecating Node.js 20 on 2026-06-16 — v4 actions across all workflows will be force-migrated to Node.js 24

**Status**: Open
**Reported**: 2026-06-03
**Priority**: 12 (High) — Impact: Moderate (3) x Likelihood: Likely (4) — deadline 2026-06-16 (13 days from 2026-06-03); no migration queued; 7 references across 3 workflows will be force-migrated; risk of silent behavioural drift if v4-on-Node24 differs from v4-on-Node20
**Origin**: external (GitHub Actions infrastructure)
**Effort**: M — 7 file edits (workflow YAML) + verification across all 3 workflows; possibly v5 actions if released
**Type**: technical
**WSJF**: 6.0 = (12 × 1.0) / 2

## Description

GitHub Actions is deprecating Node.js 20 on **2026-06-16**. All 7 references to `actions/checkout@v4` and `actions/setup-node@v4` across this project's workflows will be force-migrated to Node.js 24:

- `.github/workflows/auto-update.yml`: 2 references (checkout@v4, setup-node@v4)
- `.github/workflows/ci-publish.yml`: 4 references (3× checkout@v4, 1× setup-node@v4)
- `.github/workflows/claude.yml`: 1 reference (checkout@v4)

**Migration paths**:

1. **Upgrade to v5 actions** when published — `actions/checkout@v5` / `actions/setup-node@v5` (if/when stable). Cleanest long-term.
2. **Opt in early via `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true`** — set the env var on the runner or in the workflow files to surface any compatibility issues NOW rather than at the 2026-06-16 cutover. Smallest delta; gives lead time to fix anything that breaks.
3. **Wait for the 2026-06-16 cutover** and accept the forced migration. Riskiest — silent behavioural changes from v4-actions running on Node.js 24 may not be caught by the existing test suite.

**Risk if ignored**: post-cutover workflow runs may exhibit compatibility regressions if `actions/checkout@v5` / `actions/setup-node@v5` aren't yet stable (forces v4-on-Node24), OR the v4-on-Node24 forced-migration produces silent behavioural changes the test suite doesn't cover.

**Empirical observation**: the deprecation annotation appears on every recent workflow run:

- Cron scheduled runs: 2026-05-31, 2026-06-01, 2026-06-02
- ci-publish on every push during the 2026-06-02 session (multiple pushes)

Deprecation reference: https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/

## Symptoms

(deferred to investigation)

## Workaround

Pre-cutover (before 2026-06-16): no workaround needed — the deprecation surfaces as warning annotations on every workflow run; no functional impact. Post-cutover: GitHub force-migrates v4 actions to Node 24, so the warning annotations disappear automatically but any latent v4-on-Node24 compat issues would manifest as workflow failures.

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: (deferred to investigation)
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

**Root cause (external)**: GitHub Actions runner deprecation of Node.js 20, announced 2025-09-19 (https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/). Effective 2026-06-16, all JavaScript actions pinned to majors built against Node 20 will be force-migrated to Node 24. This project's three workflow files reference v4 of `actions/checkout` and `actions/setup-node`, both of which are Node-20-built majors. The deprecation is upstream-driven and the migration cannot be deferred past 2026-06-16 without accepting silent runtime substitution.

**Empirical confirmation of v6 availability (2026-06-03, the day this ticket was captured)**:

- `actions/checkout` latest stable: `v6.0.3` (published 2026-06-02; non-prerelease) — supersedes the v5 line.
- `actions/setup-node` latest stable: `v6.4.0` (published 2026-04-20; non-prerelease) — supersedes the v5 line.

Both v6 majors run on Node 24, fully closing the deprecation. v5 was a transitional major and is now superseded; v6 is the canonical latest-stable-major.

### Fix Strategy

Bump all 8 references from `@v4` to `@v6` across the three workflow files (the P025 capture-time Description undercounts `ci-publish.yml` — it lists 4 refs there but the actual file carries 5: 3× checkout + 2× setup-node, lines 20/36/41/110/115; the `publish` job's setup-node at line 115 was missed in the original count):

| File                                | Line | Action     | Before | After |
| ----------------------------------- | ---- | ---------- | ------ | ----- |
| `.github/workflows/auto-update.yml` | 61   | checkout   | v4     | v6    |
| `.github/workflows/auto-update.yml` | 72   | setup-node | v4     | v6    |
| `.github/workflows/ci-publish.yml`  | 20   | checkout   | v4     | v6    |
| `.github/workflows/ci-publish.yml`  | 36   | checkout   | v4     | v6    |
| `.github/workflows/ci-publish.yml`  | 41   | setup-node | v4     | v6    |
| `.github/workflows/ci-publish.yml`  | 110  | checkout   | v4     | v6    |
| `.github/workflows/ci-publish.yml`  | 115  | setup-node | v4     | v6    |
| `.github/workflows/claude.yml`      | 29   | checkout   | v4     | v6    |

**Rejected alternatives**:

- `@v5` (the P025 capture-time named option): superseded by `@v6` upstream; pinning to a legacy stable when a fresher stable exists offers no benefit and accrues immediate dep-debt.
- `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` env var: lower-delta but leaves the v4 pin in place; still has to be migrated before/at cutover. Bumping to v6 closes the issue in one step.

**Architect verdict (2026-06-03)**: APPROVE. ADR-0017's verbatim-step contract (Confirmation #10) scopes the OIDC Mint step prose, not action version pins. No existing ADR pins action versions. No new ADR required — this is a forced upstream-driven runtime migration, not an architectural choice.

**JTBD verdict (2026-06-03)**: ALIGNED. JTBD-103/104/106 are preserved; migration is invisible at the persona-surface layer.

**Verification plan** (deferred to next CI run after this commit lands): the next `push` event triggers `ci-publish.yml` end-to-end; the next 06:00 UTC cron triggers `auto-update.yml`; `claude.yml` triggers on the next `@claude` comment. A green outcome on each workflow under v6 closes the migration; a red outcome surfaces the v6 compat issue with lead time before the 2026-06-16 cutover.

### Investigation Tasks

- [x] Re-rate Priority and Effort at next /wr-itil:review-problems — re-rated 2026-06-03 (P022/P023/P024/P025 review pass, commit 0220471); Effort confirmed M, WSJF 6.0.
- [x] Confirm `actions/checkout@v5` + `actions/setup-node@v5` availability and stability — superseded by `@v6`; both v6 majors verified stable via `gh api` on 2026-06-03 (v6.0.3 + v6.4.0, both non-prerelease).
- [x] Decide on migration path (v5 upgrade vs FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true opt-in) — chose `@v6` (latest stable major, supersedes both candidates).
- [x] Apply chosen migration before 2026-06-16 cutover — applied this iter (13 days before cutover).
- [ ] Verify all 3 workflows (auto-update, ci-publish, claude) pass under the migrated runtime — gated on the next CI run after this commit lands (next push exercises ci-publish; next 06:00 UTC cron exercises auto-update; next `@claude` comment exercises claude.yml).

## Dependencies

- **Blocks**: continued workflow stability after 2026-06-16
- **Blocked by**: nothing — migration is in this project's direct control
- **Composes with**: P022 (commit-gate hook on the same workflow surfaces, different concern); ADR-0017 (auto-update single-workflow shape — preserves the workflow file but the action versions are orthogonal)

## Related

- **P022** — shares the `.github/workflows/` file-path surface but is structurally different (commit-gate hook unstaging vs. action-runtime deprecation). PROCEED_NEW per hang-off classifier — different concern.
- `.github/workflows/auto-update.yml`, `.github/workflows/ci-publish.yml`, `.github/workflows/claude.yml` — affected files.
- GitHub deprecation announcement: https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/
- 2026-05-31/06-01/06-02 cron runs + 2026-06-02 push runs — empirical evidence (deprecation annotation on every run).

(captured via /wr-itil:capture-problem; expand at next investigation)
