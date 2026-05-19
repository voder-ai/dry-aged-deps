---
status: proposed
job-id: see-unfixable-vulnerabilities
persona: project-maintainer
date-created: 2026-05-19
screens:
  - CLI: dry-aged-deps --check
  - CLI: dry-aged-deps --check --format=json
  - CLI: dry-aged-deps --check --format=xml
  - GitHub: pull request (auto-update)
---

# JTBD-009: See vulnerabilities I can't yet fix so I can plan mitigation

## Job Statement

When `dry-aged-deps` cannot recommend a safe update for a package that carries a known vulnerability — because no available version satisfies both the vuln fix and the maturity/security thresholds — I want the tool to surface that vulnerability anyway, so I can plan a mitigation rather than discover it only by scrolling through CI logs.

## Desired Outcomes

- Every `dry-aged-deps --check` run lists known vulnerabilities that have no safe-version path, by default, without me needing to remember a flag.
- The list appears in every output format I might consume — terminal (table), JSON, and XML — so neither I nor downstream tooling can miss it.
- The auto-update workflow's pull request body includes the same list, so an automated landing never carries a hidden "this vuln we couldn't fix" surface alongside the bumps it did apply.
- I can raise the severity floor (e.g. moderate-and-above) if my project's ecosystem produces too many low-severity rows to triage, but I never have to opt _in_ to seeing them at all.
- Vulnerabilities I have already accepted in `audit-resolve.json` do NOT re-appear on this surface — my explicit "known and accepted" decision is honoured.
- The new surface is informational only — it does NOT alter the existing exit-code contract or `--check` gating semantics, so my CI integrations continue to work unchanged.

## Persona Constraints

- Time is the scarcest resource — the default must be readable, not a wall of low-severity noise. The all-severities default is acceptable on a small project; a `--unfixable-level` knob keeps the surface tunable when severity volume grows.
- Reviews everything I push myself — the PR body for an auto-update is where I look, so unfixable vulns belong there alongside the bump list.
- Cannot afford to be the unknowing distribution point of a compromised package — silent invisibility of vulns is the failure mode this job exists to prevent.
- Will not maintain a parallel "vulns I should know about" tracking system — the surface must live in the tool's existing output paths, not a new side-channel.

## Current Solutions

- Visually scroll the `better-npm-audit` table that appears in prepush console output — works only if I happen to look at the right console; nothing automated about it.
- Run `npm audit` ad-hoc and cross-reference manually against installed versions to figure out which advisories have no fix path — high-friction, rarely done.
- Rely on GitHub Dependabot security alerts in the repo's Security tab — works for direct dependencies but I have to remember to check the tab, and the workflow PR body does not link back.
- Accept the gap and hope the next scheduled dry-aged-deps run will catch it once a patched version ages into "safe" — does not work for vulnerabilities with no patched version at all.
