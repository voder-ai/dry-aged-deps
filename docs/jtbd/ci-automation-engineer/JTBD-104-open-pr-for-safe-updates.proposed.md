---
status: proposed
job-id: open-pr-for-safe-updates
persona: ci-automation-engineer
date-created: 2026-05-11
screens:
  - GitHub: pull request
  - GitHub Actions: auto-update.yml
---

# JTBD-104: Open a pull request for safe updates without human intervention

## Job Statement

When the scheduled job finds safe updates and applies them locally on the runner, I want it to push a branch and open a pull request that the existing CI gates can validate, so the change reaches `main` through the same review surface as any other change.

## Desired Outcomes

- The PR is authored by an identifiable bot account, not impersonating a human.
- The PR title and body follow project commit-message conventions.
- The PR triggers the same `build-and-test` job that gates human PRs.
- The PR is squash-mergeable to keep release semantics clean.

## Persona Constraints

- Single, canonical CI gate; no parallel validation surfaces that can drift.
- Must work without introducing new long-lived secrets.

## Current Solutions

- Push directly to `main` and skip review entirely (loses the human-visible window).
- Open the PR manually after the bot pushes the branch (defeats the autonomy goal).
