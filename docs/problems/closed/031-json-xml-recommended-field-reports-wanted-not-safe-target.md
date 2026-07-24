# Problem 031: JSON/XML `recommended` field reports `wanted`, not the safe update target

**Status**: Closed
**Reported**: 2026-07-11
**Priority**: 6 (Medium) — Impact: 3 × Likelihood: 2 — derived at capture: a machine-readable output field is deterministically wrong, but the harm is bounded (the correct value is available in the adjacent `.latest` field, the human table output is unaffected, and the X→X symptom requires an exact-pinned project whose consumer reads `.recommended` programmatically).
**Origin**: internal
**Effort**: S — one-line change in `src/output-utils.js` + a RED test + an XML-surface check.
**JTBD**: JTBD-101, JTBD-008
**Persona**: ci-automation-engineer

## Description

The JSON/XML `recommended` field is mislabelled — it reports `wanted` (the semver-range-satisfying version) instead of the safe update target. In `src/output-utils.js:36`, `recommended: wanted` sets the JSON `recommended` (and XML `<recommended>` via the same item shape) to the 3rd outdated-tuple element (`wanted`), but per `prompts/008.0-DEV-JSON-OUTPUT.md` (line ~68 shows `recommended` == `latest` == the safe target `4.18.2`) and ADR-0014 (`--update` writes the latest-safe version, which surfaces as `.latest`, the smart-search-overwritten 4th tuple element), `recommended` is SPECIFIED to be the safe target that `--update` will actually apply. Impact: for any exactly-pinned project (where `wanted === current` by construction, per ADR-0014 §Context), the emitted `recommended` equals `current` — a `X → X` no-op that re-introduces the exact P001 silent-failure symptom on the machine-readable surface. Any adopter (ci-automation-engineer persona) that reads `.recommended` from `--check --format=json` (or `<recommended>` from XML) to decide/display the target version gets the wrong value: it either shows no change or points at the current version rather than the safe upgrade. Discovered 2026-07-11 during the auto-update.yml jq fix — the workflow was steered to read `.latest` instead of `.recommended` precisely to dodge this bug (wr-architect ISSUES-FOUND verdict). Fix direction (refine at investigation): correct `output-utils.js:36` to `recommended: latest` (reconciling the JSON/XML surface with the spec schema + ADR-0014), with a RED test asserting `recommended === latest` (the safe target) and specifically `recommended !== current` on an exact-pin fixture; check the XML `<recommended>` builder in `src/xml-formatter-utils.js` uses the same corrected value. Serves JTBD-101 (consume machine-readable output programmatically) and JTBD-008 (inspect what an automated update landed and why) — the target column must be truthful. Relates to but is distinct from P028/P030 (this is a display/schema-labelling bug on landable updates, not a landability or lockfile bug).

## Symptoms

- `--check --format=json` emits `recommended` equal to `wanted` (the semver-range-satisfying version) rather than the safe update target.
- On an exact-pinned package (`wanted === current` by construction), `recommended === current` — an `X → X` no-op (the P001 silent-failure symptom on the machine-readable surface).
- The XML `<recommended>` element carries the same wrong value (shared item shape).

## Workaround

Read `.latest` (JSON) / `<latest>` (XML) instead of `.recommended` — `.latest` carries the smart-search-overwritten safe target that `--update` actually applies. The auto-update workflow already does this (`.github/workflows/auto-update.yml`, fixed 2026-07-11).

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: (deferred to investigation)
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

**Root cause**: `src/output-utils.js:36` in `prepareJsonItems()` set `recommended: wanted`. In the row tuple `[name, current, wanted, latest, age, depType]`, `wanted` is the 3rd element (semver-range-satisfying version) and `latest` is the 4th (the smart-search-overwritten safe update target that `--update` actually applies, per ADR-0014). Both output surfaces read the same field off the item object `prepareJsonItems()` produces — JSON at `src/json-formatter.js:58`, XML at `src/xml-formatter-utils.js:112` — so the single mislabelled line corrupted both `--format=json` and `--format=xml`.

**Why it went undetected**: every pre-existing test fixture that asserted `recommended` used data where `wanted === latest` (e.g. `printOutdated.json.test.js` rows `wanted: '1.1.0', latest: '1.1.0'`), so the wrong value coincided with the right one. The exact-pin case (`wanted === current !== latest`) — where the bug actually bites — had no coverage.

**Confirmed a bugfix, not a breaking schema change** (architect + JTBD gates, 2026-07-11): `prompts/008.0-DEV-JSON-OUTPUT.md:68` and `prompts/009.0-DEV-XML-OUTPUT.md:68` both document `recommended: "4.18.2" == latest` while `wanted` is `4.18.1`. The documented schema specifies `recommended === latest`; the field name/presence/type are unchanged. `fix:` (patch), not `BREAKING CHANGE`, per ADR-0002 + ADR-0005.

### Investigation Tasks

- [x] Investigate root cause — `output-utils.js:36` `recommended: wanted`; single producer feeds both JSON + XML surfaces
- [x] Create reproduction test (assert `recommended === latest` and `recommended !== current` on an exact-pin fixture) — `src/output-utils.test.js` `[REQ-JSON-SCHEMA]` case, RED→GREEN confirmed
- [x] Reconcile the JSON `recommended` (src/output-utils.js) and XML `<recommended>` (src/xml-formatter-utils.js) surfaces with the spec + ADR-0014 — one-line producer fix corrects both
- [x] Confirm the change is a bugfix, not an ADR-0002 breaking schema change (the field was wrong, not merely renamed) — architect PASS

## Fix Strategy

Correct `src/output-utils.js:36` from `recommended: wanted` to `recommended: latest`. Both the JSON and XML surfaces consume `item.recommended` from the shared `prepareJsonItems()` item shape, so the single producer-side change reconciles both formats with the documented schema and ADR-0014. Guarded by the `[REQ-JSON-SCHEMA]` RED reproduction test on an exact-pinned fixture.

**Release vehicle**: `fix(output): ...` conventional commit → semantic-release patch bump (this repo releases via semantic-release per ADR-0005; no `.changeset/` surface).

## Fix Released

Fixed in commit on 2026-07-11: `recommended` now reports the safe update target (`latest`), matching the documented JSON/XML schema and what `--update` applies. RED reproduction test in `src/output-utils.test.js` now GREEN; full suite (387 tests) passes. Awaiting user verification against a real exact-pinned project's `--check --format=json` output. Ships via semantic-release patch bump.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

- **ADR-0014** — `--update` writes the latest-safe version (the field `recommended` is specified to mirror).
- **P001** — the original `X → X` silent-failure class this re-introduces on the machine-readable surface.
- **P028 / P030** — distinct (landability / lockfile), not this display-labelling bug; named for disambiguation.
- Captured via /wr-itil:capture-problem during the 2026-07-11 auto-update.yml jq fix (wr-architect ISSUES-FOUND surfaced it); expand at next investigation.
