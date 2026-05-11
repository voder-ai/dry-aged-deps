---
name: ci-automation-engineer
description: An engineer who integrates dry-aged-deps into CI/CD pipelines and scheduled automation so dependency hygiene happens without manual intervention.
---

# CI/Automation Engineer

## Who

The engineer responsible for the build and release pipeline. They may be a platform engineer at a larger company or simply the maintainer wearing a different hat. They care about exit codes, machine-readable output, scheduled jobs, branch protection, and bot identities. They write GitHub Actions workflows, manage secrets, and decide what happens automatically versus what requires a human.

## Context Constraints

- They operate in non-interactive environments — runners, cron jobs, scheduled agents.
- They cannot rely on a maintainer's machine being online.
- They need precise, well-documented contracts: exit codes that mean exactly one thing, output formats that parse reliably, behaviour that does not depend on terminal capabilities.
- They are accountable for secret management — every new token, key, or App credential is a maintenance cost they must justify.
- They are bound by the release-pipeline conventions of the project (in this repository: semantic-release, Conventional Commits, husky pre-push, ADR-0005 / ADR-0008).

## Pain Points

- Many CLIs print useful summaries to humans but make no commitment about exit codes or stable machine-readable output.
- "No updates" and "tool crashed" look identical to a naive shell-style check.
- Automating dependency PRs without bot identity discipline produces commits semantic-release misinterprets.
- An automated update that breaks CI but has no recovery path leaves a stalled PR that paged a human anyway — the worst of both worlds.
- Adding external services or LLM API keys to CI carries trust and rotation costs that must be weighed against value.
