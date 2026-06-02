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

(deferred to investigation — currently observable as warning annotations on every workflow run; no functional impact yet)

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: (deferred to investigation)
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Confirm `actions/checkout@v5` + `actions/setup-node@v5` availability and stability
- [ ] Decide on migration path (v5 upgrade vs FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true opt-in)
- [ ] Apply chosen migration before 2026-06-16 cutover
- [ ] Verify all 3 workflows (auto-update, ci-publish, claude) pass under the migrated runtime

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
