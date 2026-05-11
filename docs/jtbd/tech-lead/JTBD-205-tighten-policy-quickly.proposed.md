---
status: proposed
job-id: tighten-policy-quickly
persona: tech-lead
date-created: 2026-05-11
screens:
  - Config file: .dry-aged-deps.json edit + commit
---

# JTBD-205: Tighten policy quickly when the threat landscape changes

## Job Statement

When a new class of supply-chain attack lands in the news, I want to change my team's age or severity policy in a single commit and have every developer's and every CI run's behaviour shift immediately, so my response time is measured in minutes rather than weeks.

## Desired Outcomes

- A policy change is one config-file edit, one commit, one merge.
- No tool changes, no version bumps, no deployments are required.
- The change is immediately visible in subsequent local and CI runs.

## Persona Constraints

- Threat landscape moves faster than software release cadences.
- Policy responsiveness is a feature of the tool, not just a hope.

## Current Solutions

- Send an email to the team and hope everyone applies the new threshold.
- Update a wiki page that nobody re-reads.
