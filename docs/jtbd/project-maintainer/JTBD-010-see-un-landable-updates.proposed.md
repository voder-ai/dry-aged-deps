---
status: proposed
job-id: see-un-landable-updates
persona: project-maintainer
date-created: 2026-07-10
human-oversight: confirmed
oversight-date: 2026-07-10
screens:
  - CLI: dry-aged-deps
  - CLI: dry-aged-deps --check
  - CLI: dry-aged-deps --check --format=json
  - CLI: dry-aged-deps --check --format=xml
  - GitHub: pull request (auto-update)
---

# JTBD-010: See safe updates that can't currently land so I can plan a manual resolution

## Job Statement

When `dry-aged-deps` finds a safe, mature update but cannot apply it because the package's peer-dependency graph won't resolve without `--force` / `--legacy-peer-deps` (an ERESOLVE), I want the tool to surface that update as skipped-and-why anyway, so I can plan a manual resolution (bump the blocking peer, replace an unmaintained dependency) instead of discovering it only when an install fails.

## Desired Outcomes

- Every `dry-aged-deps` run lists safe+aged updates that were withheld because their peer graph won't resolve, by default, without me needing to remember a flag.
- The list appears in every output format I might consume — terminal (table), JSON, and XML — so neither I nor downstream tooling can miss it.
- Each withheld update states the reason (`incompatible-peers`) so I can tell a peer-graph block apart from a maturity or vulnerability filter.
- The auto-update workflow's pull request body includes the same list, so an automated landing never hides "these safe updates couldn't land" alongside the bumps it did apply.
- A single un-landable update never poisons the rest of the batch — the landable updates still apply, and only the blocked ones are held back.
- The tool never forces the install to make a broken peer graph land — it surfaces the block for me to resolve, it does not silently paper over it.
- The surface is informational only — it does NOT alter the exit-code contract; un-landable updates simply do not count toward `--check`'s "safe updates available" signal, keeping `--check` and `--update` in agreement.

## Persona Constraints

- Time is the scarcest resource — the default must tell me WHY an update was withheld, not just that a number dropped, so I don't re-derive the peer conflict myself.
- Reviews everything I push myself — the PR body for an auto-update is where I look, so un-landable updates belong there alongside the bump list.
- Will not maintain a parallel "updates I should manually chase" tracking system — the surface must live in the tool's existing output paths, not a new side-channel.
- Must never be handed a `package.json` that fails to install — a withheld update is correct; a landed-but-unresolvable one is not.

## Current Solutions

- Run `dry-aged-deps --update`, watch the whole batch fail to install on one bad peer, and bisect by hand to find the blocker — high-friction, and the auto-update cron just retries it daily (land/revert churn).
- Read npm's raw ERESOLVE output when an install fails and reverse-engineer which update caused it — works only after the failure, and ERESOLVE reports are dense.
- Pin or exclude the blocking package by hand and hope I remember why — no durable record of which safe updates are being held back or why.
- Accept the gap and let the un-landable update sit in the outdated list indefinitely, indistinguishable from updates that simply haven't aged yet.
