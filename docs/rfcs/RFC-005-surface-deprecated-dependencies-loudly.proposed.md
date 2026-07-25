---
status: proposed
rfc-id: surface-deprecated-dependencies-loudly
reported: 2026-07-25
human-oversight: unconfirmed
decision-makers: [Tom Howard]
problems: [P029]
adrs: [ADR-0023]
jtbd: [JTBD-001, JTBD-009]
stories: []
---

# RFC-005: Surface deprecated dependencies loudly

**Status**: proposed
**Reported**: 2026-07-25
**Problems**: P029
**ADRs**: ADR-0023
**JTBD**: JTBD-001, JTBD-009

## Summary

Implement the loud surfacing of npm dependency deprecation per ADR-0023: read the per-version `deprecated` field from the registry and surface the verbatim message in a dedicated "Deprecated dependencies" section (table) and a `deprecated` array (JSON, XML). Advisory-only — no change to filtering or the `--update` apply path.

## Driving problem trace

- **P029** (Known Error) — `dry-aged-deps` never reads the registry `deprecated` field, so deprecated dependencies (a standing maintenance/supply-chain risk) are silently omitted from every output. Root cause: `src/fetch-version-times.js` fetches only the `time` field via `npm view`. The fix is to widen that existing per-package call and thread the message through to the formatters.

## Ratification gate

ADR-0023 is currently `human-oversight: unconfirmed`. Per the RFC-005 architect review (2026-07-25, [Unratified Dependency] / ADR-074 surface 3), **no implementation slice below may land until ADR-0023 is ratified** at the `/wr-architect:review-decisions` drain (frontmatter gains `human-oversight: confirmed`). The two decisions' substance was already confirmed by the maintainer via `AskUserQuestion` on capture; ratification records the oversight marker. Capturing this RFC as planning scaffolding (stories `[]`, no product code) is the normal pre-ratification sequence.

## Scope

Per ADR-0023 (surface deprecated dependencies advisory-only in a dedicated section), the fix reads the per-version `deprecated` free-text string from the npm packument and surfaces it verbatim, without parsing, replacement-extraction, migration suggestion, or any auto-remediation, and without influencing age/security filtering or the `--update` apply path. The **`latest`** version's deprecation (the update candidate) is the surfaced version.

Implementation approach (chosen path), incorporating the RFC-005 architect review notes:

- **Fetch layer** (`src/fetch-version-times.js`): widen the existing `npm view <pkg> time --json` call to `npm view <pkg> time deprecated --json` so one registry call per package carries both fields (no extra round-trip). **Return-contract ripple (architect note):** a multi-field `npm view` projection nests output under field names (`{ "time": {...}, "deprecated": ... }`) instead of the current flat top-level version→ISO map, so both the parse logic AND the return shape change. The return shape has three consumers that must move together: `build-rows.js` (`versionTimes[info.latest]`), and `collectOverrideVersionTimes` + `lookupVersionIso` in `src/print-outdated.js` (`fetched[exact]`). Either return a richer `{ versionTimes, deprecated }` object and update all three call sites, or keep `versionTimes` the primary return and expose deprecation via a secondary channel. Preserve the existing retry/validation behaviour and `@supports` annotations. Slices 1 and 2 are therefore coupled and sequence together.
- **Row/context threading** (`src/build-rows.js`): thread the deprecation message for the `latest` version into the `printOutdated` context as a parallel `deprecatedByPackage` Map — mirroring how `vulnMap` / `filterReasonMap` / `viaExposureModifierByPackage` are threaded `printOutdated` → `dispatchFormatter` → `sharedOpts` → the handlers. Do NOT widen the 6-element positional tuple `[name, current, wanted, latest, age, depType]` (the codebase deliberately keeps sidecar data in parallel Maps).
- **Table formatter**: render a dedicated `Deprecated dependencies` section following the `printUnfixableSection` / `printOverridesHygieneSection` / `printIncompatibleSection` append-a-section, skip-when-empty precedent. **Architect note:** those helpers render via `printAlignedTable` (column-padded), which will NOT fit the verbatim message (name + URL — the very reason ADR-0023 rejected a table column). This section needs a non-tabular layout (each package's message on its own line), not `printAlignedTable`.
- **JSON formatter**: add a `deprecated` array of `{ name, version, message }` objects (message verbatim), slotting alongside `unfixable` / `overridesHygiene` / `incompatible` in `jsonFormatter`.
- **XML formatter**: add the equivalent `deprecated` elements in `xmlFormatter`.
- **Advisory-only invariant**: the deprecation signal is read and surfaced only; it must not enter `applyFilters`, the age/security decision, or `--update`'s apply path (ADR-0003/ADR-0004 exit-code contracts preserved). A behavioural test asserts `--update` against a project with a deprecated dependency produces the identical package.json/lockfile result as before this change.

Out of scope (per ADR-0023): heuristic replacement extraction from the message, migration recommendations, auto-remediation, and any `--update` filtering influence (the deferred Decision-2 option).

## Stories

Work-breakdown is decomposed into stories on a story map (ADR-089/095/096) — authored at the `/wr-itil:manage-rfc accepted` transition via `/wr-itil:capture-story-map` + `/wr-itil:capture-story`, then listed in the `stories:` frontmatter array. `stories: []` here is the pre-decomposition back-fill state, not an atomic-fix shape.

Intended story slices (to be authored + accepted before implementation, TDD per ADR-052; a draft story cannot be implemented until accepted per ADR-096; and ADR-0023 must be ratified first per the Ratification gate above):

1. Fetch layer widened to carry per-version `deprecated` alongside `time` in one `npm view` call, with the return-contract updated across its three consumers — fetch-layer test asserts both fields arrive from a single call. **(coupled with slice 2)**
2. Deprecation threaded through `build-rows.js` into the `printOutdated` context as a parallel `deprecatedByPackage` Map. **(coupled with slice 1)**
3. Table formatter — dedicated `Deprecated dependencies` section, verbatim messages, non-tabular layout (not `printAlignedTable`), lazy-empty.
4. JSON formatter — `deprecated` array of `{name, version, message}`.
5. XML formatter — `deprecated` elements.
6. Advisory-only invariant — behavioural test asserting `--update` is unchanged for a deprecated package.
7. `prompts/` spec story + REQ IDs (traceability), and a README Options/output-surface mention as the release-eligible `feat:` ship-signal (per CLAUDE.md multi-iter feature convention).

## Commits

(rendered from `git log --grep "Refs: RFC-005"` at manage-rfc / reconcile time — none yet at capture.)

## Related

- ADR-0023 — surface deprecated dependencies advisory-only in a dedicated section (governing decision).
- P029 — detect deprecated dependencies and surface them loudly (driving Known Error).
- ADR-0018 — surface known-vulnerable-but-unfixable packages (the sibling informational-section pattern this fix mirrors).
- Captured via /wr-itil:capture-rfc --fix-time; expand at next /wr-itil:manage-rfc invocation.
