---
status: proposed
job-id: recover-from-pr-failures
persona: ci-automation-engineer
date-created: 2026-05-11
screens:
  - GitHub Actions: auto-update.yml
  - GitHub: failing PR
---

# JTBD-106: Recover from automated-PR failures without paging a human

## Job Statement

When the scheduled dependency-update PR fails CI because of test, lint, or type fallout from the bump itself, I want the failure to be triaged and fixed autonomously within a bounded scope, so a routine maintenance task does not become a manual interruption.

## Desired Outcomes

- The failure context (logs, diff, failing test names) is available to an automated fixer.
- The fixer operates within an explicit writable-paths allow-list and never modifies security-sensitive files.
- Recovery is bounded — a documented attempt budget caps the work spent on any one failure so the runner does not thrash indefinitely.
- When the budget is exhausted, the failed state is discoverable via the PR itself (auto-merge disabled, failure context attached) — not silently dropped, not requeued blindly into the next scheduled run.
- No human escalation channel is assumed; this is an autonomous-operation repo and "leave for a human" is not a terminal state. Persistent failures surface as failing, inspectable PRs that the next scheduled run will not auto-overwrite.
- The recovery path is governed by a documented trust boundary (ADR-0010 and its successor).

## Persona Constraints

- Any AI or external service introduced for recovery must justify its trust and cost.
- Must not introduce silent overrides of security gates (ADR-0008).
- Must not assume a human review pool — this is an autonomous-operation repo.

## Current Solutions

- Leave failed PRs open until a maintainer notices and intervenes manually (does not apply here — no maintainer pool to notice).
- Disable the scheduled workflow entirely after a few failed runs.
