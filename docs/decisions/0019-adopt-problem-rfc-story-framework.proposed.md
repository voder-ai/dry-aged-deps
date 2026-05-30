---
status: 'proposed'
date: 2026-05-30
decision-makers: [unspecified — fill at canonical review]
consulted: []
informed: []
reassessment-date: 2026-08-30
---

# Adopt the Problem-RFC-Story Framework (per @windyroad/itil ADR-060)

> Captured via /wr-architect:capture-adr (foreground-lightweight aside-invocation per ADR-032 P156 amendment). Run /wr-architect:create-adr on this ID to expand the deferred sections canonically.

## Context and Problem Statement

The AFK loop `/wr-itil:work-problems` on 2026-05-30 surfaced direction-setting for P013 and P014 that requires RFC-scaffolded planning before implementation can build on it (ADR-074 substance-confirm-before-build). The first `/wr-itil:capture-rfc` invocation (RFC-001 for P013) was blocked by the architect agent with verdict ISSUES FOUND, naming the missing governance ADR — no existing decision in this project governs whether `docs/rfcs/` is an accepted artifact class, the lifecycle taxonomy, the frontmatter schema, or the RFC↔ADR↔problem↔story relationship.

## Decision Drivers

- (deferred to /wr-architect:create-adr canonical review)

## Considered Options

1. **Option A (chosen)** — Adopt `@windyroad/itil` ADR-060 (Problem-RFC-Story framework with mandatory problem-trace and unified problem ontology) verbatim: RFCs live at `docs/rfcs/RFC-<NNN>-<slug>.<state>.md` with lifecycle suffixes `proposed` / `accepted` / `in-progress` / `verifying` / `closed` (mirrors ADR-0011 ADR lifecycle); frontmatter schema is `status` / `rfc-id` / `reported` / `decision-makers` / `problems` (≥1, mandatory I1 invariant) / `adrs` / `jtbd` / `stories`; bidirectional traces via `## RFCs` reverse on problem tickets and `## Stories` forward on RFCs; the @windyroad/itil `capture-rfc` / `manage-rfc` skills are the agent surface; `docs/rfcs/README.md` is created by the first `/wr-itil:manage-rfc` invocation (deferred-README contract).
2. (deferred — see /wr-architect:create-adr canonical review)

## Decision Outcome

Chosen option: **"Option A"**, because the framework is already implemented in the `@windyroad/itil` plugin we already adopt; reinventing the schema or skipping the tier would either fork the framework or leave direction-confirmed work (P013, P014) unimplementable. The plugin's `capture-rfc` skill already enforces the I1 invariant (mandatory problem-trace) and the cross-tier reverse-trace contract, so adopting it requires no local tooling work.

**Architect notes at capture-time review (PASS-WITH-NOTES):**

1. **Unratified-dependency advisory** — this ADR mirrors ADR-0011's lifecycle taxonomy, and ADR-0011 is itself `.proposed.md`. At canonical `/wr-architect:create-adr` expansion, either ratify ADR-0011 first or record explicit acceptance of the compounded unratified-governance risk in Consequences.
2. **Confirmation criterion** — at canonical expansion, the Confirmation section must name a verifiable criterion (e.g. "RFCs exist at `docs/rfcs/RFC-<NNN>-<slug>.<state>.md` with mandatory `problems` frontmatter ≥1") so future architect reviews have a concrete compliance check.

**JTBD notes at capture-time review (PASS-WITH-NOTES):**

1. **No local JTBD cite** — the upstream @windyroad/itil capture-rfc SKILL.md names JTBD-008 / JTBD-001 / JTBD-101 as RFC-framework anchors, but those IDs are occupied locally with unrelated semantics (`see-safe-updates`, `inspect-automated-landings`, `machine-readable-output`). This ADR does NOT carry those `@jtbd` annotations — the local JTBD set has no documented persona for cross-cutting change planning yet. Framework introduction precedes the cross-cutting-change-planning JTBD authoring (ADR-074 substance-confirm-before-build).
2. **Future JTBD work** — once the RFC framework is in use, author a tech-lead JTBD (e.g. "Plan a cross-cutting fix that spans multiple problems") to close the gap.

## Consequences

### Good

- (deferred to /wr-architect:create-adr canonical review)

### Neutral

- (deferred to /wr-architect:create-adr canonical review)

### Bad

- (deferred to /wr-architect:create-adr canonical review)

## Confirmation

(deferred to /wr-architect:create-adr canonical review)

## Pros and Cons of the Options

### Option A

- (deferred to /wr-architect:create-adr canonical review)

## Reassessment Criteria

(deferred to /wr-architect:create-adr canonical review — default reassessment-date 3 months from capture)
