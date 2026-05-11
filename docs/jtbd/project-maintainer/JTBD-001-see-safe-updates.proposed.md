---
status: proposed
job-id: see-safe-updates
persona: project-maintainer
date-created: 2026-05-11
screens:
  - CLI: dry-aged-deps
---

# JTBD-001: See which dependencies have safe updates available

## Job Statement

When I am thinking about routine dependency maintenance on a project I own, I want to see only the updates that have aged past a recent-release window and are free of known vulnerabilities, so I can spend my attention on real choices instead of triaging every version bump from scratch.

## Desired Outcomes

- I can run a single command and read its output without setting flags for the common case.
- The output excludes versions released too recently to have been validated by the community.
- The output excludes versions with known vulnerabilities.
- The output is empty when there is nothing safe to apply, and that signals "no action needed" unambiguously.

## Persona Constraints

- Time-scarce.
- Reviews everything they push themselves.
- Expects familiar npm-style output and behaviour.

## Current Solutions

- Run `npm outdated` and manually cross-reference each row against `npm audit` and the npm registry's `time` field.
- Skip the check entirely between releases and trust luck.
- Rely on Dependabot or Renovate with default settings, which do not implement an age threshold.
