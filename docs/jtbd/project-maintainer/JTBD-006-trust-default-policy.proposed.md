---
status: proposed
job-id: trust-default-policy
persona: project-maintainer
date-created: 2026-05-11
screens:
  - CLI: dry-aged-deps (no flags)
---

# JTBD-006: Trust that the default policy is sensibly safe

## Job Statement

When I run the tool without any flags, I want defaults that I do not have to reason about every time, so I can use it routinely without re-evaluating policy on every invocation.

## Desired Outcomes

- The out-of-the-box behaviour rejects very recent releases and known-vulnerable versions.
- The defaults are documented in one place I can point colleagues to.
- The defaults change only across major versions, with the change called out in the changelog.

## Persona Constraints

- Cannot afford to make a policy decision every time they check for updates.
- Holds the tool to a higher trust bar than a generic `npm outdated` wrapper because the project's name signals safety.

## Current Solutions

- Hand-roll a checklist of policy questions that is rarely consulted.
- Use Dependabot defaults that do not consider age at all.
