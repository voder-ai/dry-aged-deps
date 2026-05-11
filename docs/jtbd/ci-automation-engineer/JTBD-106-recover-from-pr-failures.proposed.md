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
- Recovery is attempted at most once per failure; persistent failures escalate to humans rather than thrashing.
- The recovery path is governed by a documented trust boundary (ADR-0010).

## Persona Constraints

- Any AI or external service introduced for recovery must justify its trust and cost.
- Must not introduce silent overrides of security gates (ADR-0008).

## Current Solutions

- Leave failed PRs open until a maintainer notices and intervenes manually.
- Disable the scheduled workflow entirely after a few failed runs.
