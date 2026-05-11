# Jobs To Be Done (JTBD) Index

This directory captures the jobs that `dry-aged-deps` is hired to do, organised
by persona. Each job statement describes a situation, a motivation, and an
expected outcome — independent of any specific feature or implementation.

Jobs start as `proposed` and become `validated` once user research or
production use confirms them.

## Project Maintainer

An individual maintainer responsible for the day-to-day health of an npm project who runs `dry-aged-deps` against their own repository.

[Persona definition](project-maintainer/persona.md)

### Proposed

| ID | Job | File |
|----|-----|------|
| JTBD-001 | See which dependencies have safe updates available | [JTBD-001-see-safe-updates.proposed.md](project-maintainer/JTBD-001-see-safe-updates.proposed.md) |
| JTBD-002 | Apply safe updates without manually picking versions | [JTBD-002-apply-safe-updates.proposed.md](project-maintainer/JTBD-002-apply-safe-updates.proposed.md) |
| JTBD-003 | Tighten the age threshold for a higher-risk project | [JTBD-003-tighten-age-policy.proposed.md](project-maintainer/JTBD-003-tighten-age-policy.proposed.md) |
| JTBD-004 | Skip specific packages that need different handling | [JTBD-004-exclude-packages.proposed.md](project-maintainer/JTBD-004-exclude-packages.proposed.md) |
| JTBD-005 | Get a familiar npm-outdated-style report | [JTBD-005-familiar-output-format.proposed.md](project-maintainer/JTBD-005-familiar-output-format.proposed.md) |
| JTBD-006 | Trust that the default policy is sensibly safe | [JTBD-006-trust-default-policy.proposed.md](project-maintainer/JTBD-006-trust-default-policy.proposed.md) |
| JTBD-007 | Save and reuse my project's filtering policy via a config file | [JTBD-007-project-local-config.proposed.md](project-maintainer/JTBD-007-project-local-config.proposed.md) |

## CI/Automation Engineer

An engineer who integrates `dry-aged-deps` into CI/CD pipelines and scheduled automation so dependency hygiene happens without manual intervention.

[Persona definition](ci-automation-engineer/persona.md)

### Proposed

| ID | Job | File |
|----|-----|------|
| JTBD-100 | Gate CI on whether safe updates are pending | [JTBD-100-gate-ci-on-pending-updates.proposed.md](ci-automation-engineer/JTBD-100-gate-ci-on-pending-updates.proposed.md) |
| JTBD-101 | Consume machine-readable output programmatically | [JTBD-101-machine-readable-output.proposed.md](ci-automation-engineer/JTBD-101-machine-readable-output.proposed.md) |
| JTBD-102 | Distinguish "no updates" from "tool failure" | [JTBD-102-distinguish-no-updates-from-failure.proposed.md](ci-automation-engineer/JTBD-102-distinguish-no-updates-from-failure.proposed.md) |
| JTBD-103 | Run dependency hygiene autonomously on a schedule | [JTBD-103-run-on-schedule.proposed.md](ci-automation-engineer/JTBD-103-run-on-schedule.proposed.md) |
| JTBD-104 | Open a pull request for safe updates without human intervention | [JTBD-104-open-pr-for-safe-updates.proposed.md](ci-automation-engineer/JTBD-104-open-pr-for-safe-updates.proposed.md) |
| JTBD-105 | Compose correctly with semantic-release's commit-analyzer | [JTBD-105-compose-with-semantic-release.proposed.md](ci-automation-engineer/JTBD-105-compose-with-semantic-release.proposed.md) |
| JTBD-106 | Recover from automated-PR failures without paging a human | [JTBD-106-recover-from-pr-failures.proposed.md](ci-automation-engineer/JTBD-106-recover-from-pr-failures.proposed.md) |

## Tech Lead

A technical lead who sets and enforces dependency-hygiene policy across one or more teams or projects.

[Persona definition](tech-lead/persona.md)

### Proposed

| ID | Job | File |
|----|-----|------|
| JTBD-200 | Enforce stricter rules on production than on dev dependencies | [JTBD-200-stricter-prod-than-dev.proposed.md](tech-lead/JTBD-200-stricter-prod-than-dev.proposed.md) |
| JTBD-201 | Pick a severity threshold appropriate to my team's risk profile | [JTBD-201-per-team-severity-threshold.proposed.md](tech-lead/JTBD-201-per-team-severity-threshold.proposed.md) |
| JTBD-202 | Capture the team's dependency policy as code | [JTBD-202-policy-as-code.proposed.md](tech-lead/JTBD-202-policy-as-code.proposed.md) |
| JTBD-203 | Produce reproducible audit artefacts for stakeholders | [JTBD-203-reproducible-audit-artefacts.proposed.md](tech-lead/JTBD-203-reproducible-audit-artefacts.proposed.md) |
| JTBD-204 | Re-vet retroactively when a version turns out to have gone bad | [JTBD-204-retroactive-revet.proposed.md](tech-lead/JTBD-204-retroactive-revet.proposed.md) |
| JTBD-205 | Tighten policy quickly when the threat landscape changes | [JTBD-205-tighten-policy-quickly.proposed.md](tech-lead/JTBD-205-tighten-policy-quickly.proposed.md) |
