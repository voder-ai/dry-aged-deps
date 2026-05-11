---
status: proposed
job-id: per-team-severity-threshold
persona: tech-lead
date-created: 2026-05-11
screens:
  - CLI: --severity, --prod-severity, --dev-severity
---

# JTBD-201: Pick a severity threshold appropriate to my team's risk profile

## Job Statement

When my team's risk profile differs from another team's, I want to set the vulnerability-severity gate independently — for example, allowing low-severity advisories in dev while forbidding any advisory in production — so I can express team-specific tolerance without forking the tool.

## Desired Outcomes

- Severity threshold is configurable along the same axes as age (global, prod, dev).
- The threshold values mirror the npm advisory severity vocabulary (none, low, moderate, high, critical).
- The active threshold is visible in output.

## Persona Constraints

- Different teams legitimately have different tolerances.
- Policy decisions must be expressible without code changes.

## Current Solutions

- Apply the strictest policy uniformly and slow down low-risk teams.
- Apply the loosest policy uniformly and expose high-risk teams.
