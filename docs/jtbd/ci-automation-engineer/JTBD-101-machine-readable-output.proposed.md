---
status: proposed
job-id: machine-readable-output
persona: ci-automation-engineer
date-created: 2026-05-11
screens:
  - CLI: dry-aged-deps --format=json
  - CLI: dry-aged-deps --format=xml
---

# JTBD-101: Consume machine-readable output programmatically

## Job Statement

When my pipeline needs to act on the list of safe updates — open a PR, post a notification, write a report — I want a stable, well-structured output format I can parse without scraping the table, so my automation does not break when the human-facing display changes.

## Desired Outcomes

- A `--format=json` mode produces deterministic, documented JSON.
- An `--format=xml` mode is available for systems that prefer XML.
- Format changes that would break consumers happen only across major versions.
- The same data is present in every format; format choice does not change what is reported.

## Persona Constraints

- Cannot afford fragile string parsing.
- Bound by ADR-0002 (JSON/XML output support).

## Current Solutions

- Parse the text output with regex (brittle, fails on column-width changes).
- Maintain a downstream schema that drifts from the tool's reality.
