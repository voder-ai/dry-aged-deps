---
status: proposed
job-id: reproducible-audit-artefacts
persona: tech-lead
date-created: 2026-05-11
screens:
  - CLI: dry-aged-deps --format=json > artefact.json
  - GitHub Actions artefact upload
---

# JTBD-203: Produce reproducible audit artefacts for stakeholders

## Job Statement

When a customer or auditor asks how I keep dependencies safe, I want to produce a machine-readable artefact showing what policy I applied and what it accepted or rejected on a given date, so my answer rests on evidence rather than anecdote.

## Desired Outcomes

- A single command run on any compatible machine produces the same artefact for the same inputs.
- The artefact captures the policy values used (age, severity, exclusions).
- The artefact captures every package considered and the reason it was accepted or rejected.
- The artefact can be archived in CI alongside other compliance evidence.

## Persona Constraints

- Auditors expect reproducibility and trace.
- Reports that require manual transcription do not scale.

## Current Solutions

- Screenshot terminal output, lose trace context.
- Hand-roll a custom report from `npm outdated` and `npm audit` outputs.
