---
status: proposed
job-id: inspect-automated-landings
persona: project-maintainer
date-created: 2026-05-18
screens:
  - GitHub: pull request (merged)
  - GitHub: pull request (failing)
  - CLI: git log
---

# JTBD-008: Inspect what an automated update landed and why

## Job Statement

When an autonomous flow lands (or attempts to land) a dependency update without my direct involvement, I want a single inspectable record that shows what changed, what was tried, and why the run reached its outcome, so I can stay confident in delegating routine maintenance without losing the ability to audit it later.

## Desired Outcomes

- Every automated landing produces a PR that captures the update list (package, old → new, severity), the resulting diff, and any agent recovery steps that were applied.
- The PR is retained by GitHub after auto-merge (squash + branch deletion is fine — the PR record itself remains queryable).
- A failed automated attempt produces a failing, inspectable PR — auto-merge disabled, failure logs and agent attempt history embedded in the body — so I can open one URL and see the full context.
- `git log` continues to show the bot's commits with conventional-commit semantics (`chore(deps):` / `fix(deps):`) so release notes and semantic-release output read correctly.
- The audit trail does not depend on workflow-run retention windows; once the PR is created, the inspection surface persists.

## Persona Constraints

- Time is the scarcest resource — inspection must be cheap (one click into the PR), not a multi-tab archaeology session across Actions runs.
- Reviews everything that lands on `main`, even when it lands via a bot — needs full diff and full failure context, not a lossy summary.
- Reserves the right to revert or push a manual fix; the PR record is what makes that decision informed.

## Current Solutions

- Click through GitHub Actions runs and piece together logs from multiple workflows to reconstruct what happened (slow, loses correlation between detect → fix → merge).
- Read `git log` and diff `main` file-by-file (loses the _why_ — no agent reasoning, no failure context).
- Trust the bot blindly and skip inspection entirely (forfeits the audit surface, surprises later when something regresses).
