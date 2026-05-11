---
status: proposed
job-id: stricter-prod-than-dev
persona: tech-lead
date-created: 2026-05-11
screens:
  - Config file: .dry-aged-deps.json
  - CLI: --prod-min-age, --dev-min-age, --prod-severity, --dev-severity
---

# JTBD-200: Enforce stricter rules on production than on dev dependencies

## Job Statement

When I am setting team policy, I want to apply tighter age and severity thresholds to production dependencies than to dev dependencies, so the dependency surface that actually ships to users is protected without slowing down build-time tooling unnecessarily.

## Desired Outcomes

- Independent thresholds are configurable for prod and dev.
- If only a global threshold is set, both categories inherit it (no surprising defaults).
- The active per-category policy is visible in the output and in any audit artefact.
- Bound by ADR-0007 (separate prod/dev thresholds).

## Persona Constraints

- Risk profile of prod and dev are genuinely different.
- Policy must remain readable to engineers who are not security specialists.

## Current Solutions

- Apply the same threshold to both categories and accept the trade-off.
- Maintain two separate tools or wrapper scripts for prod and dev, which drift.
