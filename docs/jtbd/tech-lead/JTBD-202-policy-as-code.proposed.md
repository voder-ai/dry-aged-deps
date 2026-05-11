---
status: proposed
job-id: policy-as-code
persona: tech-lead
date-created: 2026-05-11
screens:
  - Config file: .dry-aged-deps.json (checked into source control)
---

# JTBD-202: Capture the team's dependency policy as code

## Job Statement

When I want my team's dependency-hygiene policy to be reviewable, durable, and reproducible, I want to capture it in a checked-in config file that every developer and every CI job picks up automatically, so policy is documentation that the tools actually obey.

## Desired Outcomes

- A single checked-in config file is the authoritative policy artefact.
- Code review is the change-control mechanism for policy changes.
- A new clone produces the same results as an existing checkout.
- Bound by ADR-0010-related plans for config-file support and existing config-file behaviour.

## Persona Constraints

- Policy that lives only in a person's head does not survive turnover.
- Policy that lives in a wiki drifts from the tools' behaviour.

## Current Solutions

- Document policy in a README that the tools do not consult.
- Use CI environment variables, which are invisible to local development.
