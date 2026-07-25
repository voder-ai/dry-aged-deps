# Problem 029: dry-aged-deps should detect deprecated dependencies and surface them loudly (verbatim npm deprecation message) — no auto-remediation

**Status**: Verification Pending
**Reported**: 2026-06-17

## Fix Released

**Released**: 2026-07-26 via `feat(deprecation): surface deprecated dependencies loudly (P029, RFC-005)` (commit `7e77036`, pushed to `main`) — ships as a semantic-release minor bump per ADR-0005 (the release-eligible `feat:` ship-signal completing RFC-005).

Implemented across RFC-005 slices 1-7, governed by ADR-0023, tracing to JTBD-011:

- **Slice 1** (`a52478d`) — `src/fetch-version-times.js` widened `npm view <pkg> time` → `time deprecated` (one call, no extra round-trip); latest version's deprecation rides the exported `DEPRECATED` symbol.
- **Slices 2-3** (`2f0b3ff`) — `build-rows.js` collects `deprecatedByPackage`; `printDeprecatedSection` renders a dedicated non-tabular "Deprecated dependencies:" table section in all three exit branches.
- **Slices 4-5** (`ffad51a`) — additive `deprecated` array in JSON, `<deprecated>` section in XML (verbatim, XML-escaped, omit-when-empty).
- **Slice 6** — behavioural test asserts `--update` is unchanged for a deprecated package (advisory-only invariant).
- **Slice 7** (`7e77036`) — `prompts/020.0` spec + REQ traceability, README "Deprecated dependencies" subsection, JTBD-011 index entry.

Advisory-only: verbatim message, no parsing/replacement-extraction/remediation, no filtering / `--update` / exit-code change. Full prepush green (390+ tests, coverage ≥80%, audit:ci clean); architect + JTBD PASS on every slice.

**Awaiting user verification** against a real project with a deprecated dependency (e.g. one depending on `clerk-sveltekit`): confirm the `Deprecated dependencies` section appears in `--check` table output and the `deprecated` array/element in `--check --format=json` / `--format=xml`, and that `--update` behaviour is unchanged.
**Priority**: 3 (Medium) — Impact: Moderate (3) x Likelihood: Rare (1) — a deprecated dependency is a real standing risk, but the tool silently omitting the signal has low blast radius (advisory gap, no incorrect action taken)
**Origin**: internal
**Effort**: L — re-rated from the deferred `M` placeholder at Known-Error transition (2026-07-25, P047). Investigation confirmed the fix spans a registry-read widening (`src/fetch-version-times.js`), row-shape threading (`src/build-rows.js`), three output surfaces (table / JSON / XML formatters), and needs a new ADR for the two open design decisions (output shape + advisory-vs-filtering) plus an RFC/story trace. Single-package but multi-file + new-ADR → L, not M.
**WSJF**: 1.5 = (3 × 2.0) / 4
**JTBD**: JTBD-001, JTBD-009
**Persona**: project-maintainer

## Description

`dry-aged-deps` does not currently detect or surface when a dependency (installed or update-candidate) has been **deprecated** on the npm registry. A deprecated dependency is a standing risk — often unmaintained, and sometimes superseded — that the maintainer should see.

The desired behaviour is narrow and deliberate: **detect deprecation and be loud about it.** Surface the verbatim npm deprecation message and stop there. `dry-aged-deps` must **not** decide what to do about it — no heuristic parsing of a recommended replacement out of the free-text message, no migration recommendation, no auto-remediation. Surfacing the signal is the tool's job; deciding the response is the human's or LLM's job. (Design direction from the user, 2026-06-17: _"If something is deprecated just be loud about that. Leave it to the human or LLM to decide what to do about it."_)

This is the sibling of **P028** (un-landable peer graphs). The two were split because they are independent signals: a deprecated dependency may still install cleanly (landable), and a non-deprecated dependency may be un-landable. Each answers a different "what should the human know about this dependency?" question.

### Motivating scenario (downstream `bbstats`)

`clerk-sveltekit` (the library blocking the vite 8 major in P028) is deprecated. npm already knows this:

```
$ npm view clerk-sveltekit deprecated
This package is deprecated. Please use svelte-clerk instead: https://github.com/wobsoriano/svelte-clerk
```

Note the replacement (`svelte-clerk`) is right there in the verbatim message. Surfacing that message as-is is enough — the maintainer (or an LLM agent acting for them) reads it and decides. `dry-aged-deps` does **not** need to parse "svelte-clerk" out into a structured field; doing so would be fragile guessing on free-text, and is explicitly out of scope.

### What npm exposes (evidence)

- Deprecation is set by the package **maintainer** via `npm deprecate <pkg>@<range> "<message>"`, which writes a `deprecated` free-text string onto each matching version in the registry **packument** (`https://registry.npmjs.org/<pkg>` → `versions[<ver>].deprecated`).
- It is readable via `npm view <pkg> deprecated`, in the packument JSON, and as `npm warn deprecated <pkg>@<ver>: <message>` during install. `npm outdated --json` does **not** carry it.
- **Low marginal cost for this tool**: `dry-aged-deps` already fetches each package's packument from the registry to compute update age (`fetchVersionTimes` in `src/build-rows.js` reads the `time` map). The same packument carries the `deprecated` field per version — so deprecation detection reuses data the tool already downloads, no extra round-trip per package.

### Proposed behaviour (to refine at investigation)

- Read the `deprecated` field from the packument the tool already fetches; flag deprecated dependencies (installed and/or update-candidate) loudly in output (table / JSON / XML).
- Surface the deprecation message **verbatim**. Do not parse, summarise, or extract a replacement from it; do not emit a recommendation.
- Out of scope (explicit): heuristic replacement extraction, migration suggestions, or any auto-remediation. The tool surfaces the signal; the human or LLM decides the response.
- Open question for investigation: whether a deprecated package should also influence filtering (e.g. never silently auto-apply an update whose package is deprecated) or remain purely advisory-and-loud.

## Symptoms

- Running `dry-aged-deps` (any format) against a project that depends on a deprecated package shows no deprecation signal at all — the deprecated package appears in the outdated listing identically to a healthy one.
- The maintainer has no in-tool way to learn a dependency (installed or update-candidate) is deprecated; they must run `npm view <pkg> deprecated` by hand, per package, to discover it.

## Workaround

Query the registry directly, per package: `npm view <pkg> deprecated` (or `npm view <pkg>@<version> deprecated` for a specific version) prints the verbatim deprecation message, or nothing if not deprecated. `npm install` also emits `npm warn deprecated <pkg>@<ver>: <message>` lines, but those are buried in install noise and not tied to `dry-aged-deps` output. The workaround is manual and does not scale across a dependency tree — which is the gap this ticket closes.

## Impact Assessment

- **Who is affected**: project maintainers and CI/automation engineers relying on `dry-aged-deps` as their dependency-health surface (JTBD-001, JTBD-009).
- **Frequency**: whenever a tree carries a deprecated dependency and the maintainer relies on the tool to surface dependency risk. Deprecated deps are common in real trees (observed this session: `clerk-sveltekit` in downstream `bbstats`; npm bundling an old vendored `tar`).
- **Severity**: Moderate impact (a deprecated dep is a standing maintenance / supply-chain risk — often unmaintained or superseded — that should be seen), but low likelihood of harm because the failure mode is an _omitted advisory_, not an incorrect action. The tool doesn't do the wrong thing; it just stays silent.
- **Analytics**: N/A (public single-maintainer CLI; no usage telemetry).

## Root Cause Analysis

**Root cause (confirmed 2026-07-25):** `dry-aged-deps` never reads the npm registry `deprecated` field, so it cannot surface it. Evidence:

1. **The signal exists and is per-version.** Deprecation is set by the package maintainer via `npm deprecate` and written onto each matching version in the registry packument as `versions[<ver>].deprecated` (free-text). Live-confirmed: `npm view clerk-sveltekit deprecated` → `This package is deprecated. Please use svelte-clerk instead: https://github.com/wobsoriano/svelte-clerk`, and the field is present on `versions[<latest>].deprecated` in the raw packument.
2. **The tool's current registry read is scoped to `time` only.** `src/fetch-version-times.js` runs `npm view <pkg> time --json` and returns a flat `Record<version, dateString>` map — the `deprecated` field is neither requested nor carried. So the ticket's original "reuses data the tool already downloads, no extra round-trip" premise is **half right**: the tool already makes one `npm view` call per package (in `buildRows` → `fetchVersionTimes`), but that call currently fetches only `time`. The fix widens the field list on the _existing_ call (e.g. `npm view <pkg> time deprecated --json`, or a per-version `npm view <pkg>@<latest> deprecated`) — still one call per package, no _extra_ round-trip.
3. **Threading + surfacing is where the real work is.** `src/build-rows.js` `buildRows()` maps each package to a 6-tuple `[name, current, wanted, latest, age, depType]`; deprecation would add a 7th element (or a parallel map), then the three formatters (table / JSON / XML) surface the verbatim message loudly.

**Two open design decisions — deferred to the fix RFC/ADR (fix is proposed _after_ Known Error per ADR-072):**

- **Output shape**: a dedicated deprecation column/field carrying the verbatim message, vs a separate "deprecated" warning block, across table / JSON / XML — and whether it appears in the default read-only listing, the `--update` apply path, or both.
- **Advisory-only vs filtering influence**: purely advisory-and-loud, vs also gating `--update` so a deprecated package's update is never silently auto-applied. The ticket's design direction is loud-surfacing-only (no auto-remediation, no heuristic replacement extraction), so filtering influence, if any, must stay a conservative "flag and skip, don't decide."

### Investigation Tasks

- [x] Re-rate Priority and Effort at next /wr-itil:review-problems — done at this Known-Error transition (Effort M → L, WSJF 1.5)
- [x] Investigate root cause — confirmed: tool reads only `time` from the registry; `deprecated` field is available per-version but never requested
- [x] Confirm the packument `deprecated` field is available in the data `fetchVersionTimes` already pulls (reuse vs extra request) — **refined**: NOT in the current fetch (`time` only), but obtainable by widening the existing per-package `npm view` call; no extra round-trip
- [ ] (fix-time) Create reproduction / acceptance test — deferred to the fix RFC/story per specs-before-code (CLAUDE.md) + ADR-072 (fix proposed after Known Error). Reproduction evidence recorded above (`npm view clerk-sveltekit deprecated` returns a message the tool's output omits).
- [ ] (fix-time) Decide the loud-surfacing output shape — deferred to fix ADR (open decision above)
- [ ] (fix-time) Decide advisory-and-loud only vs filtering influence — deferred to fix ADR (open decision above)

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P028 (flag and skip un-landable updates / incompatible peers) — sibling "what should the human know about this dependency?" signal split from the same capture.

## Related

- **JTBD-001** (`docs/jtbd/project-maintainer/JTBD-001-see-safe-updates.proposed.md`) — surfacing that a dependency is deprecated is part of seeing what is (un)safe to take or keep.
- **JTBD-009** (`docs/jtbd/project-maintainer/JTBD-009-see-unfixable-vulnerabilities.proposed.md`) — analogous risk-surfacing: a deprecated dep is a risk to see loudly, not silently carry; the tool surfaces, the human decides.
- **P028** — sibling ticket: un-landable peer-graph detection (split from this capture per user direction 2026-06-17).
- Motivating scenario: downstream `bbstats` project — deprecated, ~3-year-stale `clerk-sveltekit` (the verbatim npm message names `svelte-clerk`) blocking the vite 8 major.
- Captured via /wr-itil:capture-problem; split into P028 + P029, then scoped to loud-surfacing-only (no heuristic extraction) per user direction 2026-06-17.

## RFCs

| RFC     | Status   | Title                                  |
| ------- | -------- | -------------------------------------- |
| RFC-005 | proposed | Surface deprecated dependencies loudly |
