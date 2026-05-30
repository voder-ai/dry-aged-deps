---
status: accepted
rfc-id: overrides-hygiene-module
reported: 2026-05-30
decision-makers: [Tom Howard]
problems: [P013]
adrs: [ADR-0002, ADR-0003, ADR-0004, ADR-0018, ADR-0019]
jtbd: []
stories: []
---

# RFC-001: Overrides Hygiene Module

**Status**: accepted
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

- [ ] **T1**: Spec the module's contract via prompt/user-story at `prompts/<N>-overrides-hygiene.md` — input shape (package.json overrides + npm audit + npm outdated data); output shape (structured findings list with severity tags + safe-upgrade-target field); CLI flag interaction with `--check` per ADR-0003 + ADR-0004.
- [ ] **T2**: Write failing test for `src/overrides-hygiene.js` (TDD red). Input fixture: package.json with a stale override + a vulnerable override pin within a current advisory range. Expected output: structured finding list with severity + safe-upgrade-target.
- [ ] **T3**: Implement `src/overrides-hygiene.js` minimum-to-pass per the spec. Parses overrides from a passed-in `package.json`; ages each pin via existing `fetchVersionTimes()` / `calculateAgeInDays()`; cross-references with passed-in `npm audit` + `npm outdated` data.
- [ ] **T4**: Wire the module into the pipeline at `src/print-outdated.js` (after `applyFilters`, before output formatting). Add CLI flag `--no-overrides-hygiene` to opt out; default on.
- [ ] **T5**: Extend the table / JSON / XML output formatters to render the new findings section per existing ADR-0002 (JSON/XML) + ADR-0003 (exit codes) + ADR-0004 (check mode) contracts. Add formatter fixtures + assertions.
- [ ] **T6**: Update exit-code logic — exit 1 when ≥ 1 override pin has a safe upgrade target available (per Scope item 7 narrowed contract). Preserve existing safe-update exit-code semantics. Document the narrow contract in README + prompts.
- [ ] **T7**: Live-case regression test — exercise the original brace-expansion mislabel scenario from P013. A current advisory-range-hit override pin should surface as a finding (new RFC-001 surface). The same data should NOT mislabel itself as "unfixable transitive" — that's gap #2's surface; the test should pin the boundary.
- [ ] **T8**: First task commit (T2 or T3) carries `Refs: RFC-001` trailer and triggers `accepted → in-progress` transition.
- [ ] **T9**: On the final task commit (post-T7), transition `in-progress → verifying` with `## Verification` section drafted: release marker; user-side check that `dry-aged-deps --check` no longer reports the brace-expansion-style mislabel for an override-fixable vuln in their own projects.

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
