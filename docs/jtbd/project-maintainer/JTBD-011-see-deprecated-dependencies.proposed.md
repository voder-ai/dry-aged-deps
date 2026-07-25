---
status: proposed
job-id: see-deprecated-dependencies
persona: project-maintainer
date-created: 2026-07-26
human-oversight: confirmed
oversight-date: 2026-07-26
screens:
  - CLI: dry-aged-deps --check
  - CLI: dry-aged-deps --check --format=json
  - CLI: dry-aged-deps --check --format=xml
  - GitHub: pull request (auto-update)
---

# JTBD-011: See deprecated dependencies so I can plan a migration

## Job Statement

When a dependency I still have installed has been marked **deprecated** on the npm registry — often unmaintained, sometimes superseded by a named replacement — I want `dry-aged-deps` to surface that deprecation loudly and verbatim, so I can decide on a migration rather than discover it only by squinting at `npm install` warning noise.

## Desired Outcomes

- Every `dry-aged-deps --check` run surfaces deprecated dependencies in a dedicated, clearly-labelled section, by default, without me needing to remember a flag.
- The deprecation appears in every output format I might consume — terminal (table), JSON, and XML — so neither I nor downstream tooling can miss it.
- The npm deprecation message is shown **verbatim**, so if the maintainer named a replacement package or migration URL in it, I see exactly what they wrote and decide for myself — the tool never parses, summarises, or recommends a replacement on my behalf.
- The auto-update workflow's pull request body includes the same deprecation surface, so an automated landing never hides "this package you still depend on is deprecated" alongside the bumps it did apply.
- The surface is **advisory-only** — it does NOT alter age/security filtering, the `--update` apply path, the exit-code contract, or `--check` gating semantics, so my CI integrations continue to work unchanged. The tool surfaces the signal; I (or an LLM acting for me) decide the response.
- It never silently auto-remediates — deprecation is information to act on, not an action the tool takes.

## Persona Constraints

- Time is the scarcest resource — a deprecation buried in install output is effectively invisible; the surface must be in the output I already read.
- Reviews everything I push myself — the PR body for an auto-update is where I look, so deprecation belongs there alongside the bump list.
- Cannot afford to unknowingly keep depending on an abandoned package — silent invisibility of deprecation is the failure mode this job exists to prevent.
- Will not maintain a parallel "packages I should migrate off" tracking system — the surface must live in the tool's existing output paths, not a new side-channel.
- Trusts the tool's defaults not to act without me — a deprecation must never be turned into a silent upgrade or removal; deciding the response is my job.

## Current Solutions

- Read `npm warn deprecated <pkg>@<ver>: <message>` lines during `npm install` — works only if I happen to watch that output, and it is not tied to `dry-aged-deps`'s report.
- Run `npm view <pkg> deprecated` by hand, per package — high-friction, does not scale across a dependency tree, and I have to already suspect a package to check it.
- Notice a "DEPRECATED" badge on the package's npm web page — requires me to visit each package, so it never happens routinely.
- Accept the gap and hope I stumble across the deprecation before the package's abandonment causes a problem — the exact failure this job exists to close.

## Related

- **ADR-0023** — surface deprecated dependencies advisory-only in a dedicated section (governing decision).
- **RFC-005** — surface deprecated dependencies loudly (implementation).
- **P029** — detect deprecated dependencies and surface them loudly (driving Known Error).
- **JTBD-009** (see unfixable vulnerabilities) / **JTBD-010** (see un-landable updates) — sibling one-job-per-informational-surface jobs; deprecation is a distinct risk class (no CVE, no severity, no `audit-resolve.json` suppression) warranting its own job per the RFC-005 slice-2/3 JTBD review.
