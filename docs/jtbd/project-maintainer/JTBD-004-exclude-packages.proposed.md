---
status: proposed
job-id: exclude-packages
persona: project-maintainer
date-created: 2026-05-11
screens:
  - Config file: .dry-aged-deps.json
  - CLI flag (when supported)
---

# JTBD-004: Skip specific packages that need different handling

## Job Statement

When one or two packages in my project need bespoke handling — pinned to a specific version, managed by a separate process, or known to fail tests at the latest release — I want to exclude them from the safe-update report and the auto-update action, so the tool stays useful instead of forcing me to ignore its output.

## Desired Outcomes

- Excluded packages do not appear in the safe-updates listing.
- Excluded packages are not touched by `--update`.
- The exclusion list is configurable per project and reviewable in source control.
- The reason for each exclusion can be captured alongside it.

## Persona Constraints

- Reviews everything they push.
- Wants exclusions to be the rare exception, not the norm.

## Current Solutions

- Manually skip rows when applying updates, with no protection against forgetting.
- Document exclusions in a README that nobody reads.
- Pin versions in `package.json` with caret/tilde manipulation, which is brittle.
