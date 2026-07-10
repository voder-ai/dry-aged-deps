# Problem 031: JSON/XML `recommended` field reports `wanted`, not the safe update target

**Status**: Open
**Reported**: 2026-07-11
**Priority**: 6 (Medium) — Impact: 3 × Likelihood: 2 — derived at capture: a machine-readable output field is deterministically wrong, but the harm is bounded (the correct value is available in the adjacent `.latest` field, the human table output is unaffected, and the X→X symptom requires an exact-pinned project whose consumer reads `.recommended` programmatically).
**Origin**: internal
**Effort**: S — one-line change in `src/output-utils.js` + a RED test + an XML-surface check.
**JTBD**: JTBD-101, JTBD-008
**Persona**: ci-automation-engineer

## Description

The JSON/XML `recommended` field is mislabelled — it reports `wanted` (the semver-range-satisfying version) instead of the safe update target. In `src/output-utils.js:36`, `recommended: wanted` sets the JSON `recommended` (and XML `<recommended>` via the same item shape) to the 3rd outdated-tuple element (`wanted`), but per `prompts/008.0-DEV-JSON-OUTPUT.md` (line ~68 shows `recommended` == `latest` == the safe target `4.18.2`) and ADR-0014 (`--update` writes the latest-safe version, which surfaces as `.latest`, the smart-search-overwritten 4th tuple element), `recommended` is SPECIFIED to be the safe target that `--update` will actually apply. Impact: for any exactly-pinned project (where `wanted === current` by construction, per ADR-0014 §Context), the emitted `recommended` equals `current` — a `X → X` no-op that re-introduces the exact P001 silent-failure symptom on the machine-readable surface. Any adopter (ci-automation-engineer persona) that reads `.recommended` from `--check --format=json` (or `<recommended>` from XML) to decide/display the target version gets the wrong value: it either shows no change or points at the current version rather than the safe upgrade. Discovered 2026-07-11 during the auto-update.yml jq fix — the workflow was steered to read `.latest` instead of `.recommended` precisely to dodge this bug (wr-architect ISSUES-FOUND verdict). Fix direction (refine at investigation): correct `output-utils.js:36` to `recommended: latest` (reconciling the JSON/XML surface with the spec schema + ADR-0014), with a RED test asserting `recommended === latest` (the safe target) and specifically `recommended !== current` on an exact-pin fixture; check the XML `<recommended>` builder in `src/xml-formatter-utils.js` uses the same corrected value. Serves JTBD-101 (consume machine-readable output programmatically) and JTBD-008 (inspect what an automated update landed and why) — the target column must be truthful. Relates to but is distinct from P028/P030 (this is a display/schema-labelling bug on landable updates, not a landability or lockfile bug).

## Symptoms

(deferred to investigation)

## Workaround

Read `.latest` (JSON) / `<latest>` (XML) instead of `.recommended` — `.latest` carries the smart-search-overwritten safe target that `--update` actually applies. The auto-update workflow already does this (`.github/workflows/auto-update.yml`, fixed 2026-07-11).

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: (deferred to investigation)
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Investigate root cause
- [ ] Create reproduction test (assert `recommended === latest` and `recommended !== current` on an exact-pin fixture)
- [ ] Reconcile the JSON `recommended` (src/output-utils.js) and XML `<recommended>` (src/xml-formatter-utils.js) surfaces with the spec + ADR-0014
- [ ] Confirm the change is a bugfix, not an ADR-0002 breaking schema change (the field was wrong, not merely renamed)

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

- **ADR-0014** — `--update` writes the latest-safe version (the field `recommended` is specified to mirror).
- **P001** — the original `X → X` silent-failure class this re-introduces on the machine-readable surface.
- **P028 / P030** — distinct (landability / lockfile), not this display-labelling bug; named for disambiguation.
- Captured via /wr-itil:capture-problem during the 2026-07-11 auto-update.yml jq fix (wr-architect ISSUES-FOUND surfaced it); expand at next investigation.
