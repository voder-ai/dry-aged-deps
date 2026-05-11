---
status: proposed
job-id: project-local-config
persona: project-maintainer
date-created: 2026-05-11
screens:
  - Config file: .dry-aged-deps.json
  - CLI: dry-aged-deps --config-file=<path>
---

# JTBD-007: Save and reuse my project's filtering policy via a config file

## Job Statement

When my project has its own age and severity preferences, I want to capture them in a checked-in config file that the tool reads automatically, so my collaborators get the same results without having to remember which flags to pass.

## Desired Outcomes

- The tool reads a `.dry-aged-deps.json` (or explicitly specified) config file by default.
- Config values are overridable by CLI flags for one-off runs.
- The schema is small, obvious, and documented.

## Persona Constraints

- Wants policy to be reproducible across machines and contributors.
- Does not want a second policy file for the same concern.

## Current Solutions

- Ad-hoc bash aliases or `npm` scripts that hard-code flags.
- README instructions that drift from reality.
