---
status: proposed
job-id: tighten-age-policy
persona: project-maintainer
date-created: 2026-05-11
screens:
  - CLI: dry-aged-deps --min-age=<days>
---

# JTBD-003: Tighten the age threshold for a higher-risk project

## Job Statement

When I am working on a project where I want extra soak time before taking any update, I want to override the default age threshold from the command line, so I can apply a stricter policy without changing the tool itself or memorising a long invocation.

## Desired Outcomes

- A single flag changes the minimum age applied to all dependencies for that run.
- Reasonable bounds prevent typos producing nonsense thresholds.
- The active threshold is visible in the output so I know what policy produced these results.

## Persona Constraints

- May not maintain a config file for one-off ad-hoc runs.
- Cares more about defaults being safe than about flag ergonomics.

## Current Solutions

- Run the default and mentally subtract recent rows.
- Maintain a private wrapper script that hard-codes a stricter threshold.
- Trust the ecosystem's general 7-day soak window without explicit enforcement.
