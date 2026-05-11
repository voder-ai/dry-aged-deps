---
status: proposed
job-id: distinguish-no-updates-from-failure
persona: ci-automation-engineer
date-created: 2026-05-11
screens:
  - CLI: dry-aged-deps --check
---

# JTBD-102: Distinguish "no updates" from "tool failure"

## Job Statement

When a scheduled CI run exits non-zero, I want to know whether updates are pending or the tool itself failed, so I open a PR for the first case and page an engineer for the second instead of confusing the two.

## Desired Outcomes

- A specific exit code (0) is reserved for the "nothing to do" path.
- A specific exit code (1) is reserved for the "actionable, safe updates available" path.
- Errors (invalid flags, registry failure, transient npm audit issues) use exit code 2 or higher.
- The exit-code contract is the same across `--format=table`, `--format=json`, and `--format=xml`.

## Persona Constraints

- Cannot let transient infrastructure failures be silently confused with healthy "no updates" results.
- Pipelines must be auditable when something goes wrong.

## Current Solutions

- Treat any non-zero exit code as a failure and lose the actionable signal.
- Use `|| true` patterns that paper over real failures, against the project's own no-silent-failures rule.
