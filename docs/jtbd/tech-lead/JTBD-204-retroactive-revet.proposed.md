---
status: proposed
job-id: retroactive-revet
persona: tech-lead
date-created: 2026-05-11
screens:
  - CLI / scripted re-run against historic snapshots
---

# JTBD-204: Re-vet retroactively when a version turns out to have gone bad

## Job Statement

When a dependency version that the tool previously approved is later revealed to be malicious or vulnerable, I want to identify every project in my portfolio that took that version, so I can act on the affected projects rather than guessing.

## Desired Outcomes

- The previous run's output (the audit artefact from JTBD-203) tells me exactly which versions were applied.
- A re-run of the tool against current data shows whether the affected version is still in use.
- The change in approval status is explicit, so it is clear something previously passed has been re-classified.

## Persona Constraints

- Supply-chain incidents demand fast, evidence-driven response.
- Cannot rely on every team remembering what they took six months ago.

## Current Solutions

- Grep `package-lock.json` across repositories ad-hoc when an incident hits.
- Have no record at all and depend on the registry's vulnerability database catching up.
