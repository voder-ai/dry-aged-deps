---
status: 'proposed'
date: 2026-05-30
decision-makers: [Tom Howard]
consulted: []
informed: []
reassessment-date: 2026-08-30
---

# Adopt the Problem-RFC-Story Framework (per @windyroad/itil ADR-060)

> Captured via /wr-architect:capture-adr (foreground-lightweight aside-invocation per ADR-032 P156 amendment). Deferred sections expanded via /wr-architect:create-adr on 2026-05-30 — the Step 5 born-confirmed AskUserQuestion was deliberately skipped per user direction ("do, don't ask"); confirmation is deferred to /wr-architect:review-decisions, so the `human-oversight: confirmed` marker is NOT written here.

## Context and Problem Statement

The AFK loop `/wr-itil:work-problems` on 2026-05-30 surfaced direction-setting for P013 and P014 that requires RFC-scaffolded planning before implementation can build on it (ADR-074 substance-confirm-before-build). The first `/wr-itil:capture-rfc` invocation (RFC-001 for P013) was blocked by the architect agent with verdict ISSUES FOUND, naming the missing governance ADR — no existing decision in this project governs whether `docs/rfcs/` is an accepted artifact class, the lifecycle taxonomy, the frontmatter schema, or the RFC↔ADR↔problem↔story relationship.

The project already has two artifact tiers (`docs/decisions/` for ADRs; `docs/problems/` for problem tickets). Multi-commit, cross-component design work — the kind of work P013 and P014 require — sits awkwardly between them: too coordinated for a single problem ticket's Fix Strategy section; too implementation-specific for an architecture-grade ADR. A third tier is needed, and the upstream `@windyroad/itil` plugin already implements one end-to-end.

## Decision Drivers

- AFK loop 2026-05-30 surfaced direction-setting for P013 and P014 that requires RFC scaffolding before implementation can build on it (ADR-074 substance-confirm-before-build)
- `@windyroad/itil` already implements the Problem-RFC-Story framework end-to-end (capture-rfc / manage-rfc skills, hooks, agents, helper scripts) — reinventing locally would fork an upstream contract we already adopt
- No existing local ADR governs cross-cutting change planning between architecture-grade ADRs and defect-grade problem tickets
- ADR-0011 already establishes a lifecycle-suffix convention for ADRs; mirroring it for RFCs keeps the artifact taxonomy uniform across tiers
- The architect verdict on RFC-001 capture was ISSUES FOUND solely because this governance ADR was missing — the gate is real and recurring (every subsequent RFC capture would re-hit it)

## Considered Options

1. **Option A (chosen)** — Adopt `@windyroad/itil` ADR-060 (Problem-RFC-Story framework with mandatory problem-trace and unified problem ontology) verbatim. RFCs live at `docs/rfcs/RFC-<NNN>-<slug>.<state>.md` with lifecycle suffixes `proposed` / `accepted` / `in-progress` / `verifying` / `closed` (mirrors ADR-0011 ADR lifecycle). Frontmatter schema: `status` / `rfc-id` / `reported` / `decision-makers` / `problems` (≥1, mandatory I1 invariant) / `adrs` / `jtbd` / `stories`. Bidirectional traces via `## RFCs` reverse on problem tickets and `## Stories` forward on RFCs. The @windyroad/itil `capture-rfc` / `manage-rfc` skills are the agent surface. `docs/rfcs/README.md` is created by the first `/wr-itil:manage-rfc` invocation (deferred-README contract).
2. **Option B** — Fork the framework locally. Rename / restructure the RFC taxonomy and lifecycle to match dry-aged-deps' specific needs; reimplement the capture-rfc / manage-rfc surfaces or replace them with adopter-side equivalents.
3. **Option C** — Do nothing. Keep ADR + problem-ticket as the only artifact tiers. Fold RFC-shape work into ADRs (for product-shape decisions) or extend problem-ticket Fix Strategy sections (for multi-commit fixes).

## Decision Outcome

Chosen option: **"Option A"**, because the framework is already implemented in the `@windyroad/itil` plugin we already adopt; reinventing the schema or skipping the tier would either fork the framework or leave direction-confirmed work (P013, P014) unimplementable. The plugin's `capture-rfc` skill already enforces the I1 invariant (mandatory problem-trace) and the cross-tier reverse-trace contract, so adopting it requires no local tooling work.

**Architect notes (capture-time PASS-WITH-NOTES + expansion-time PASS-WITH-NOTES):**

1. **Unratified-dependency advisory** — this ADR mirrors ADR-0011's lifecycle taxonomy, and ADR-0011 is itself `.proposed.md`. Risk: if ADR-0011 is materially changed at canonical review, ADR-0019 cascades. Mitigation: recorded explicitly in Consequences/Bad rather than blocking on ADR-0011 ratification first (the framework adoption is independently load-bearing for P013/P014's implementation path).
2. **Confirmation criterion** — testable check added in `## Confirmation` section per architect's verbatim suggestion ("RFCs exist at `docs/rfcs/RFC-<NNN>-<slug>.<state>.md` with mandatory `problems` frontmatter ≥1").

**JTBD notes (capture-time PASS-WITH-NOTES + expansion-time PASS-WITH-NOTES):**

1. **Local JTBD ID occupancy** — the upstream `@windyroad/itil` capture-rfc SKILL.md names JTBD-008 / JTBD-001 / JTBD-101 as RFC-framework anchors. Locally, **JTBD-001** (See which dependencies have safe updates available) and **JTBD-101** (Consume machine-readable output programmatically) are occupied with unrelated semantics. JTBD-008 is currently unallocated locally but is reserved by the upstream anchor list — if the local set ever needs an eighth project-maintainer JTBD, the ID would collide with the upstream anchor (use a different ID or namespace the local set). This ADR does NOT carry those `@jtbd` annotations as cites; future RFC citations must author new local JTBD entries rather than borrow from the plugin's anchor list.
2. **Future JTBD work** — once the RFC framework is in use, author a tech-lead JTBD (e.g. "Plan a cross-cutting fix that spans multiple problems") to close the cross-cutting-change-planning gap. Local tech-lead JTBDs (JTBD-200–205) are currently policy/audit-oriented, not planning-oriented.

## Consequences

### Good

- A canonical place to capture multi-commit / cross-component design work that's larger than one problem ticket's Fix Strategy section but smaller than an architecture-grade ADR.
- Bidirectional traces (`## RFCs` reverse on problem tickets, `## Stories` forward on RFCs) preserve audit trail with no additional agent ceremony — helpers `wr-itil-update-problem-rfcs-section` and `wr-itil-update-rfc-references-section` ship with the plugin.
- The `@windyroad/itil` `capture-rfc` skill already enforces the I1 invariant (mandatory problem-trace ≥1) — discipline inherited, not re-implemented locally.
- AFK-loop direction-setting surfacing has a documented downstream path: outstanding-questions queue → `/wr-itil:capture-rfc` → `/wr-itil:manage-rfc accepted` → implementation.

### Neutral

- `docs/rfcs/` adds a third top-level docs tier alongside `docs/decisions/` and `docs/problems/`. New contributors must learn the three-tier taxonomy (ADR vs RFC vs Problem) and its trace topology.
- The upstream capture-rfc SKILL.md anchors are JTBD-008 / JTBD-001 / JTBD-101: JTBD-001 and JTBD-101 collide with local IDs of unrelated semantics; JTBD-008 is currently unallocated locally but reserved by the upstream anchor list. Local JTBD citations on RFCs must be authored as new entries, not borrowed from the plugin's anchor list (JTBD review note 1).

### Bad

- **Compounded unratified-governance risk**: this ADR depends on ADR-0011 (itself `.proposed.md`) for its lifecycle-suffix convention. If ADR-0011 is materially changed at its canonical review, ADR-0019 must cascade. Accepted risk per architect note 1.
- `@windyroad/itil` ADR-060 itself is an upstream-evolving contract; framework drift upstream means dry-aged-deps must track it or fork. The reassessment criteria below name material upstream amendment as a trigger.
- The Problem-RFC-Story triad's story-tier (the third leg per ADR-060) is **not yet exercised locally** — adoption is partial until the first STORY-NNN entry lands. RFC tier in isolation works (P013/P014 are RFC-shaped), but the story decomposition is unproven for this adopter.

## Confirmation

1. **Path conformance**: RFCs exist at `docs/rfcs/RFC-<NNN>-<slug>.<state>.md` with mandatory `problems` frontmatter array ≥ 1 entry. Verifiable by `ls docs/rfcs/RFC-*.proposed.md docs/rfcs/RFC-*.accepted.md ...` returning files whose frontmatter YAML parses with a non-empty `problems` list.
2. **Reverse-trace integrity**: every problem ticket traced by an RFC carries a `## RFCs` section listing that RFC. Verifiable by running `wr-itil-update-problem-rfcs-section` over every ticket — if it modifies any file, the trace is stale.
3. **I1 hard-block in force**: `/wr-itil:capture-rfc` Step 2 refuses invocations without a leading problem-trace token matching `^P[0-9]{3}(,P[0-9]{3})*$`. Verifiable by `logs/rfc-capture-denials.jsonl` containing entries with `reason: missing-trace` / `malformed-trace` / `unresolved-trace` for any historical violations (the file may be empty in steady state).
4. **Architect review composes**: a new RFC capture whose frontmatter cites ADR-0019 as governance passes architect review for the artifact-class concern (re-litigation only if ADR-0019 itself is amended materially).

## Pros and Cons of the Options

### Option A — Adopt @windyroad/itil ADR-060 verbatim

- **Good**: zero local tooling work; upstream test coverage; consistent with `@windyroad/itil` plugins already adopted; AFK loop already routes outstanding direction-setting to capture-rfc / manage-rfc.
- **Good**: bidirectional traces, I1 invariant, deferred-README contract, and capture-vs-manage skill split are all proven in the upstream package.
- **Bad**: tied to upstream evolution; framework material changes affect dry-aged-deps.
- **Bad**: anchor JTBD collisions force per-project JTBD authoring before the trace becomes complete (every RFC starts with `jtbd: []` and is filled at manage-rfc accepted-transition).

### Option B — Fork the framework locally

- **Good**: full local control over taxonomy, lifecycle, frontmatter schema; no upstream-drift exposure.
- **Bad**: significant duplication — capture-rfc / manage-rfc / helpers / hooks would be reimplemented; ongoing maintenance burden.
- **Bad**: no upstream test coverage; manual maintenance of a now-isolated framework; loss of cross-adopter learning.
- **Bad**: AFK loop's `/wr-itil:capture-rfc` references would either need rewriting to point at the local equivalent or remain as foreign citations.

### Option C — Do nothing

- **Good**: zero new structure to maintain; two-tier docs taxonomy stays simple.
- **Bad**: AFK-loop direction-setting has no canonical artifact; P013/P014 are concrete proof the gap exists.
- **Bad**: cross-cutting change planning gets stuffed into one of the two existing tiers, weakening both (ADRs become implementation-heavy; problem tickets become design-document-heavy).
- **Bad**: the architect-review block on RFC-001 capture would recur on every multi-commit work attempt — pay the same governance penalty repeatedly.

## Reassessment Criteria

Trigger a review of this ADR if any of the following occur:

- `@windyroad/itil` ADR-060 is materially amended upstream (e.g. lifecycle taxonomy changes, frontmatter schema changes, capture-rfc / manage-rfc skill contract changes).
- RFC tier remains unused 6 months after acceptance (signal: the AFK loop doesn't actually surface RFC-shape work in this adopter, and the abstraction isn't earning its keep).
- ADR-0011 (this ADR mirrors its lifecycle-suffix convention) is materially amended — cascade reassessment.
- Local JTBD set is authored for cross-cutting change planning (the framework's missing anchor) — re-evaluate the JTBD trace contract.
- Story-tier (the third leg of the Problem-RFC-Story triad) is exercised for the first time locally — confirm the full framework still serves vs. the RFC-only subset adopted today.

Default scheduled reassessment: **2026-08-30** (3 months from capture per ADR-032 P156 amendment default).
