---
status: proposed
rfc-id: overrides-hygiene-module
reported: 2026-05-30
decision-makers: [Tom Howard]
problems: [P013]
adrs: [ADR-0019]
jtbd: []
stories: []
---

# RFC-001: Overrides Hygiene Module

**Status**: proposed
**Reported**: 2026-05-30
**Problems**: P013
**ADRs**: ADR-0019
**JTBD**: (deferred — manage-rfc accepted-transition should cite JTBD-001 / JTBD-204 / project-maintainer / tech-lead per JTBD review at capture; ratification of those entries required before the cite lands)

## Summary

Introduce a standalone `overrides-hygiene` module to `dry-aged-deps` that reads the package.json `overrides` block, ages each pinned override, and surfaces stale or vulnerable override pins to the operator. The module is adjacent to ADR-0018 (unfixable-vuln surface) but is **not** an extension of it — it has its own product-shape, story map, and acceptance criteria.

The companion `fixAvailable`-aware sharpening of the "unfixable" reason logic (P013 gap #2) is a separate workstream that amends ADR-0018 and rides its own confirmation criterion. It is **not** in scope for this RFC.

Direction confirmed by user during the `/wr-itil:work-problems` AFK loop on 2026-05-30 (Step 2.5 AskUserQuestion answer: "New RFC/story") and codified in P013's Fix Strategy section (commit baee7a1). The RFC framework was adopted via ADR-0019 in the same session (commit f8c8e1e).

## Driving problem trace

- **P013** (dry-aged-deps ignores the package.json `overrides` block) — symptom: stale or vulnerable override pins go undetected; override-fixable vulnerabilities are mislabelled "unfixable". RCA established that the CLI's outdated/audit pipeline doesn't consume the `overrides` block at all. This RFC scopes only the new-capability half (gap #1) — surfacing override-pin hygiene as a first-class concern.

## Scope

(deferred — populate at /wr-itil:manage-rfc accepted transition)

## Tasks

- [ ] (deferred — populate at /wr-itil:manage-rfc accepted transition)

## Commits

(maintained automatically — populated by the commit-message RFC trailer hook per ADR-060 Phase 1 item 12)

## Related

- P013 — driving problem ticket
- ADR-0018 — unfixable-vuln surface (adjacent; the gap #2 amendment ships separately)
- ADR-0019 — governance ADR adopting the Problem-RFC-Story framework
- AFK loop 2026-05-30 Step 2.5 surfacing — user direction recorded in P013 Fix Strategy section (commit baee7a1)
- JTBD review at capture (PASS-WITH-NOTES): JTBD-001 (See safe updates) extended to override pins + JTBD-204 (Re-vet retroactively) as primary fits; JTBD-006 (Trust default policy) as secondary; project-maintainer + tech-lead persona fits confirmed.

(captured via /wr-itil:capture-rfc; expand at next /wr-itil:manage-rfc invocation)
