---
status: proposed
job-id: compose-with-semantic-release
persona: ci-automation-engineer
date-created: 2026-05-11
screens:
  - Commit messages in scheduled PRs
  - .releaserc.json
---

# JTBD-105: Compose correctly with semantic-release's commit-analyzer

## Job Statement

When the automated dep-update workflow lands a commit on `main`, I want the commit type to be the right one — `chore(deps):` for routine bumps that should accumulate, `fix(deps):` for security-driven bumps that should release immediately — so semantic-release does the right thing without manual intervention.

## Desired Outcomes

- Routine dependency updates do not cause a release of their own.
- Security-relevant dependency updates trigger a patch release.
- The choice of commit type is derived from the data `dry-aged-deps` already produces (e.g. severity information), not from human judgement.

## Persona Constraints

- Bound by ADR-0005 (Semantic Release Version Management).
- Cannot introduce a parallel versioning mechanism.

## Current Solutions

- Always use `chore(deps):` and let security patches batch until the next unrelated `fix:` (delays security releases).
- Always use `fix(deps):` and produce a release on every routine bump (noisy, defeats batching).
