---
status: proposed
job-id: run-on-schedule
persona: ci-automation-engineer
date-created: 2026-05-11
screens:
  - GitHub Actions workflow: .github/workflows/auto-update.yml
---

# JTBD-103: Run dependency hygiene autonomously on a schedule

## Job Statement

When nobody is at a keyboard, I want a scheduled CI job to run the safe-update check, apply updates, and prepare them for release, so dependency hygiene happens reliably without depending on any individual's availability.

## Desired Outcomes

- The job runs on a documented cadence (e.g. daily) without manual triggering.
- The job is also manually dispatchable for testing.
- The job runs with bounded resources and predictable runtime.
- The job's results are visible to maintainers without them having to seek them out.

## Persona Constraints

- Cannot assume any one machine is available.
- Must justify every new piece of automation against ongoing maintenance cost.

## Current Solutions

- Rely on a maintainer remembering to run the check periodically.
- Use a third-party service like Dependabot with its own (non-aged) policy.
