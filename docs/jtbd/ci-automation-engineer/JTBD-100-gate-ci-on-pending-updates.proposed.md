---
status: proposed
job-id: gate-ci-on-pending-updates
persona: ci-automation-engineer
date-created: 2026-05-11
screens:
  - CLI: dry-aged-deps --check
---

# JTBD-100: Gate CI on whether safe updates are pending

## Job Statement

When a CI workflow runs, I want a single command that exits with one well-defined code if safe updates are available and another if not, so I can branch pipeline behaviour without parsing output text or relying on heuristics.

## Desired Outcomes

- Exit 0 means "no safe updates available, nothing to do".
- Exit 1 means "safe updates are available".
- Exit 2 (and any other non-zero) means "the tool failed; treat as a CI error".
- The contract is documented in the project's ADRs and survives across minor versions.

## Persona Constraints

- Works in non-interactive runners where text scraping is fragile.
- Bound by ADR-0003 (Exit Code Standardization) and ADR-0004 (Check Mode).

## Current Solutions

- Pipe `npm outdated --json` to a custom jq filter and infer status from row count.
- Hand-roll a wrapper script that interprets the tool's output and translates to exit codes.
