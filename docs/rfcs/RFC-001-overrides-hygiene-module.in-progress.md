---
status: in-progress
rfc-id: overrides-hygiene-module
reported: 2026-05-30
decision-makers: [Tom Howard]
problems: [P013]
adrs: [ADR-0002, ADR-0003, ADR-0004, ADR-0018, ADR-0019]
jtbd: []
stories: []
---

# RFC-001: Overrides Hygiene Module

**Status**: in-progress
**Reported**: 2026-05-30
**Problems**: P013
**ADRs**: ADR-0002, ADR-0003, ADR-0004, ADR-0018, ADR-0019
**JTBD**: (deferred — jtbd: [] per inverse-P078 guard; cited JTBDs JTBD-001 / JTBD-204 / JTBD-006 are unratified locally. Body Related section preserves descriptive references; load-bearing cites land in a follow-up manage-rfc update once the cited JTBDs reach `human-oversight: confirmed`.)

## Summary

Introduce a standalone `overrides-hygiene` module to `dry-aged-deps` that reads the package.json `overrides` block, ages each pinned override, and surfaces stale or vulnerable override pins to the operator. The module is adjacent to ADR-0018 (unfixable-vuln surface) but is **not** an extension of it — it has its own product-shape, story map, and acceptance criteria.

The companion `fixAvailable`-aware sharpening of the "unfixable" reason logic (P013 gap #2) is a separate workstream that amends ADR-0018 and rides its own confirmation criterion. It is **not** in scope for this RFC.

Direction confirmed by user during the `/wr-itil:work-problems` AFK loop on 2026-05-30 (Step 2.5 AskUserQuestion answer: "New RFC/story") and codified in P013's Fix Strategy section (commit baee7a1). The RFC framework was adopted via ADR-0019 in the same session (commit f8c8e1e; expansion 2b01e0c).

## Driving problem trace

- **P013** (dry-aged-deps ignores the package.json `overrides` block) — symptom: stale or vulnerable override pins go undetected; override-fixable vulnerabilities are mislabelled "unfixable". RCA established that the CLI's outdated/audit pipeline doesn't consume the `overrides` block at all. This RFC scopes only the new-capability half (gap #1) — surfacing override-pin hygiene as a first-class concern.

## Scope

### In scope

1. **Parse `package.json` `overrides`** — read both the simple shape (`"name": "version"`) and the nested shape (`"name": { ".": "version", "sub-dep": "version" }`) per the npm overrides spec.
2. **Age each pin** — for every override entry, fetch the registry publish time for the pinned version and compute days-since-publish using the existing `fetchVersionTimes()` / `calculateAgeInDays()` infrastructure in `src/build-rows.js`.
3. **Cross-reference each pin against `npm audit` advisory ranges** — for every pinned version that falls within a current advisory range from `npm audit --json`, surface the advisory ID, severity band, and patched-version range. Reuses the existing `checkVulnerabilities()` infrastructure in `src/check-vulnerabilities.js`.
4. **Cross-reference each pin against `npm outdated` data** — for every pinned version that is behind the latest published version, surface the latest version and the lag (days + minor/major version delta).
5. **Emit a new output section** — a structured list of override-pin findings, severity-tagged, with the same age + security filter semantics as the safe-updates surface. Renders in table / JSON / XML per the existing output contracts (ADR-0002 + ADR-0003 + ADR-0004).
6. **CLI flag** — default-on (`--no-overrides-hygiene` to opt out). Mirrors the ADR-0018 unfixable-surface flag pattern.
7. **Exit-code contract** — narrow: exit-1 fires only for `--check` when ≥ 1 override pin has a **safe upgrade target available** (aligns with ADR-0003 safe-updates-found semantics). Stale-but-vulnerable override pins with **no safe upgrade** surface **informationally per the ADR-0018 unfixable-pattern** and do NOT widen `--check`'s exit-1 trigger.

### Out of scope

- **`fixAvailable`-aware sharpening of the "unfixable" reason logic** (P013 gap #2) — that amends ADR-0018 and is a separate workstream. The unfixable-surface keeps its current reason logic until that amendment ships.
- **Auto-rewriting the `overrides` block** — surfacing only. Auto-bump is a future workstream (requires user direction first).
- **Override transitive-impact analysis** — i.e. "this override changes resolved version of N other packages downstream". Reasonable v2 work; out of scope here.
- **Multi-workspace overrides** — npm workspaces have additional override semantics. Surface single-package overrides first; revisit workspaces if user demand surfaces.

## Tasks

Ordered execution sequence. The `accepted → in-progress` transition fires on the first task commit (T2 or T3) carrying a `Refs: RFC-001` trailer. The `in-progress → verifying` transition fires on the final task commit (post-T7) with `## Verification` section drafted.

- [x] **T1**: Spec the module's contract via prompt/user-story at `prompts/017.0-DEV-OVERRIDES-HYGIENE.md` — input shape (package.json overrides + npm audit + npm outdated data); output shape (structured findings list with severity tags + safe-upgrade-target field); CLI flag interaction with `--check` per ADR-0003 + ADR-0004. (2026-05-30: AFK iter — architect PASS-WITH-NOTES; jtbd PASS-WITH-NOTES on revised spec; descriptive-cite/accepted-risk posture for unratified JTBDs matches RFC-001 §Related precedent; JTBD ratification queued for next interactive session.)
- [x] **T2**: Write failing test for `src/overrides-hygiene.js` (TDD red). Input fixture: package.json with a stale override + a vulnerable override pin within a current advisory range. Expected output: structured finding list with severity + safe-upgrade-target. (2026-05-30: AFK iter 2 — `test/overrides-hygiene.test.js` lands with 8 failing assertions covering parse / age / audit-xref / outdated-xref / reason-taxonomy / exception-respect / malformed-entries / no-overrides paths. RED confirmed via `npx vitest run test/overrides-hygiene.test.js` — fails on missing `src/overrides-hygiene.js` import.)
- [x] **T3**: Implement `src/overrides-hygiene.js` minimum-to-pass per the spec. Parses overrides from a passed-in `package.json`; ages each pin via existing `fetchVersionTimes()` / `calculateAgeInDays()`; cross-references with passed-in `npm audit` + `npm outdated` data. (2026-05-30: AFK iter 3 — module landed; 8 it-blocks GREEN; ADR-0015 amended in-flight (Option (a), second narrow exception) — subsequently superseded by ADR-0020 (universal co-location) the same day to resolve the third-trigger forcing function; tests relocated test/ → src/ unblocking the TDD hook; age math inlined via injected `now` per architect PASS-WITH-NOTES note 1 — pending T4/T5 swap-back when `calculateAgeInDays` gains injectable clock.)
- [x] **T4**: Wire the module into the pipeline at `src/print-outdated.js` (after `applyFilters`, before output formatting). Add CLI flag `--no-overrides-hygiene` to opt out; default on. (2026-05-30: AFK iter 5 — `runOverridesHygiene` wired via new `resolveOverridesHygiene()` sibling of `resolveUnfixable` per architect line-cap note; `runProjectAudit` refactored to return the raw `{ vulnerabilities }` payload so the same fetch drives both surfaces per architect note A + spec REQ-OVERRIDES-AUDIT-XREF; `loadPackageJson` widened to expose `.overrides` per architect note C; `--no-overrides-hygiene` flag added with default-on semantics mirroring `--no-unfixable`. Formatter render deferred to T5 per RFC-001 commit-type sequencing — T4 lands as `chore:`. 287/287 tests GREEN.)
- [x] **T5**: Extend the table / JSON / XML output formatters to render the new findings section per existing ADR-0002 (JSON/XML) + ADR-0003 (exit codes) + ADR-0004 (check mode) contracts. Add formatter fixtures + assertions. (2026-05-31: AFK iter 6 — `jsonFormatter` emits `overridesHygiene` array (omit-when-empty per REQ-OVERRIDES-SCHEMA-COMPAT); `xmlFormatter` emits camelCase `<overridesHygiene>` root with `<override>` children + nested `<advisories>/<advisory>` (architect gate corrected my initial kebab-case proposal — spec wins per "specs before code"); `print-outdated-utils` adds `printOverridesHygieneSection` mirroring the `printUnfixableSection` precedent (appended section, space-aligned columns, skip-when-empty, `-` for nulls); `print-outdated.js` captures `resolveOverridesHygiene` and threads through all three handlers + `handleNoOutdated`. Refactors: `xmlFormatter` complexity-pressure relieved via `appendOptionalSections` helper; `printOutdated` line-pressure relieved via `dispatchFormatter` helper; `handleNoOutdated` 6-param-pressure relieved via options-object signature. New paired tests: `src/json-formatter.test.js` (extended), `src/xml-formatter.test.js` (extended), `src/xml-formatter-utils.test.js` (new canonical for P020), `src/print-outdated-utils.test.js` (new canonical for P020), `src/print-outdated-handlers.test.js` (new canonical for P020). T4 deferred-render assertion flipped to GREEN. Pre-existing `printOutdated.test.js` + `printOutdated.edge-cases.test.js` scope-isolated via `overridesHygiene: false` — the project's own package.json carries real overrides which would otherwise leak into the outdated-deps-path log-call assertions. 311/311 tests GREEN; lint + types + format + prepush clean.)
- [ ] **T6**: Update exit-code logic — exit 1 when ≥ 1 override pin has a safe upgrade target available (per Scope item 7 narrowed contract). Preserve existing safe-update exit-code semantics. Document the narrow contract in README + prompts.
- [ ] **T7**: Live-case regression test — exercise the original brace-expansion mislabel scenario from P013. A current advisory-range-hit override pin should surface as a finding (new RFC-001 surface). The same data should NOT mislabel itself as "unfixable transitive" — that's gap #2's surface; the test should pin the boundary.
- [x] **T8**: First task commit (T2 or T3) carries `Refs: RFC-001` trailer and triggers `accepted → in-progress` transition. (2026-05-30: AFK iter 2 — T2 commit carries the trailer; `git mv` to `.in-progress.md` rides the same commit per @windyroad/itil ADR-014 single-commit grain.)
- [ ] **T9**: On the final task commit (post-T7), transition `in-progress → verifying` with `## Verification` section drafted: release marker; user-side check that `dry-aged-deps --check` no longer reports the brace-expansion-style mislabel for an override-fixable vuln in their own projects.

### Commit-type sequencing (codified 2026-05-30)

To avoid an unwanted minor release of a not-yet-user-callable module surface, the task commits follow this type sequence:

- **T3**: `chore:` — implementation landed; no user-visible surface yet (module exists; CLI doesn't expose it).
- **T4–T6**: `chore:` — pipeline wire + formatter render + exit-code logic; the user-visible flag (`--no-overrides-hygiene`) is wired but the surface remains internal until released.
- **T7**: `test:` — live-case regression test.
- **`feat:` commit**: rides either T4+T5+T6 wired-up together (if bundled into a single landing commit), OR a separate commit that flips the default-on flag once all pieces are in place. The `feat:` is the release-eligible trigger per the project's semantic-release configuration.

Source: CLAUDE.md `## Commit Messages` section names `chore:` as the type for "deps, tooling, build config (not `feat:` for internal tooling)". MEMORY.md `feedback_commit_types_for_internal_tooling` corroborates: `feat:` triggers a minor bump via semantic-release (ADR-0005); using `feat:` for an internal-only module surface produces a release with no user-visible change. Documenting this sequencing prevents the next iter accidentally using `feat:` too early.

## Commits

(maintained automatically — populated by the commit-message RFC trailer hook per ADR-060 Phase 1 item 12)

## Related

- **P013** — driving problem ticket
- **ADR-0002** (JSON / XML output support) — output formatter contract for the new findings section
- **ADR-0003** (CLI exit-code standardization) — exit-1 semantics narrowed per Scope item 7 to align with safe-updates-found contract
- **ADR-0004** (check mode for CI/CD enforcement) — flag interaction with the new module's surface
- **ADR-0018** (unfixable-vuln surface) — adjacent contract; gap #2 amendment ships separately. RFC-001 explicitly does NOT widen `--check`'s exit-1 trigger beyond ADR-0003 / ADR-0018 contract
- **ADR-0019** — governance ADR adopting the Problem-RFC-Story framework
- **AFK loop 2026-05-30 Step 2.5 surfacing** — user direction recorded in P013 Fix Strategy section (commit baee7a1)
- **JTBD review at capture (PASS-WITH-NOTES)** — descriptive references (not load-bearing cites; frontmatter `jtbd: []`): JTBD-001 (See safe updates) extended to override pins + JTBD-204 (Re-vet retroactively) as primary fits; JTBD-006 (Trust default policy) as secondary; project-maintainer + tech-lead persona fits confirmed
- **Unratified dependency on cited ADRs (accepted risk)** — ADR-0018 and ADR-0019 are currently `.proposed.md` and lack `human-oversight: confirmed` frontmatter. RFC-001 explicitly accepts this risk rather than blocking on ratification, mirroring the ADR-0019 precedent (Consequences/Bad item 1 records the compounded-unratified-governance risk on ADR-0011 by the same pattern). Manage-rfc Step 9 review revisits if either ADR is materially amended at canonical confirmation; the cited ADRs are quoted for boundary-setting, not load-bearing on the RFC's correctness.

(captured via /wr-itil:capture-rfc f8c8e1e + advanced via /wr-itil:manage-rfc accepted-transition; expand at next /wr-itil:manage-rfc update / in-progress-transition)
