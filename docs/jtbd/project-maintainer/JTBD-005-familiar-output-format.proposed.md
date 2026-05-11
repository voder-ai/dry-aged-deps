---
status: proposed
job-id: familiar-output-format
persona: project-maintainer
date-created: 2026-05-11
screens:
  - CLI: dry-aged-deps (default table output)
---

# JTBD-005: Get a familiar npm-outdated-style report

## Job Statement

When I read the tool's output, I want it to look enough like `npm outdated` that I do not need to learn a new mental model, so I can scan, interpret, and act without re-orienting every time.

## Desired Outcomes

- The default table format shows package, current, safe-update, age, and dependency category.
- Column widths and ordering feel natural to anyone fluent with the npm CLI.
- Important secondary information (e.g. age, severity) is visible without extra flags.

## Persona Constraints

- Years of muscle memory with `npm outdated`.
- Reads many tools per day and resents arbitrary visual divergence.

## Current Solutions

- Use `npm outdated` itself and accept the lack of safety filtering.
- Pipe `npm outdated --json` through a homegrown shell script and never quite get the formatting right.
