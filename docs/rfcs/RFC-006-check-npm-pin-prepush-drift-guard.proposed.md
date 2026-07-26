---
status: proposed
rfc-id: check-npm-pin-prepush-drift-guard
reported: 2026-07-26
human-oversight: unconfirmed
decision-makers: [Tom Howard]
problems: [P033]
adrs: [ADR-0024]
jtbd: [JTBD-012]
stories: []
---

# RFC-006: `check:npm-pin` prepush drift guard — fail fast when a CI npm pin's major diverges from the local lockfile-generator npm

**Status**: proposed
**Reported**: 2026-07-26
**Problems**: P033
**ADRs**: ADR-0024
**JTBD**: JTBD-012

## Summary

Add a `check:npm-pin` guard, wired into `prepush` before `check:lockfile`, that fails loudly and locally when any CI npm pin's major version diverges from the local npm that generates `package-lock.json`. This is the fail-fast drift guard ADR-0024 defers to P033 and the prepush-local surface JTBD-012 requires — it closes ADR-0024's named residual risk (the pin/lockfile invariant is currently convention-only, silently re-drifting on the next lockfile regen under a newer npm major).

## Driving problem trace

- **P033** (Known Error) — CI jobs pin `npm install -g npm@X` in three places (`ci-publish.yml` build-and-test + publish, `auto-update.yml`), but `package-lock.json` is regenerated locally by whatever npm the dev/agent session runs. Across a major boundary `npm ci --prefer-frozen-lockfile` rejects the lockfile and every ci-publish run fails silently at "Install dependencies" — the release-eligible commit sits unreleased on `main`. RCA finding: `lockfileVersion` (3) is written by both npm 10 and 11, so it is NOT a usable drift fingerprint; the only reliable signal is the npm version that ran the install. The guard therefore compares the CI pins against the locally-running npm.

## Ratification gate

None. ADR-0024 (pin CI npm to the lockfile-generator npm version) is already `human-oversight: confirmed` (2026-07-26). This RFC implements ADR-0024's explicitly-deferred residual-risk closure ("a `check:lockfile`/prepush guard that fails fast on pin/lockfile mismatch"), so no new decision requires ratification before implementation. Shipping the guard fires ADR-0024's reassessment criterion (a) — this RFC's implementation AMENDS ADR-0024 (flips its now-false "Bad: enforced by convention, not by a check" consequence) rather than minting a new decision, per the architect verdict (amend grain, SSOT stays deferred). This RFC itself is born `unconfirmed` and is ratified at the `/wr-itil:manage-rfc accepted` drain.

## Scope

### In scope

The chosen path per ADR-0024's reassessment criterion (a) — a fail-fast drift guard, NOT the deferred single-source-of-truth (`packageManager`) mechanism:

- **`scripts/check-npm-pin.js`** — an ESM Node script (built-ins only, no new dependency) that:
  1. Reads every `npm install -g npm@<X>` pin out of `.github/workflows/*.yml`.
  2. **Asserts ≥1 pin was discovered** — if zero pins match (e.g. a future workflow renames the step or drops the pin), exits non-zero LOUDLY naming the count, never passing vacuously (no-silent-failures; the vacuous-pass is the exact silent-stall class P033 kills).
  3. Reads the local `npm --version` (the lockfile generator).
  4. Asserts every CI pin's **major** equals the local npm major. On mismatch, exits non-zero with a message naming the drift and the two remediations: bump the CI pins to `npm <local-major>.x`, **or** regenerate the lockfile under `npm <pin-major>`.
  - Compare **majors only** — minor/patch npm versions do not change lockfile shape, so a dev on `11.13.1` vs a CI pin of `11.13.0` must NOT fail (no false churn on patch bumps).
  - Asserting every CI pin's major equals the local major transitively guarantees the three pins agree with each other (closes the compounding "publish job unpinned/divergent" factor).
- **`package.json`** — add `"check:npm-pin": "node scripts/check-npm-pin.js"` and wire it into `prepush` immediately before `check:lockfile` (loud + local, per JTBD-012).
- **Test at `test/check-npm-pin.test.js`** (NOT co-located under `scripts/` — ADR-0020 scopes co-location to `src/`; cross-cutting `scripts/` tests live in `test/` per the `run-with-timeout` / `push-watch` precedent, and `scripts/**` is eslint-ignored). A unit test over the guard's pure logic: pin extraction picks up all three pins; a mismatched (CI-major ≠ local-major) set fails; a matching set passes; zero pins fails loudly. `@supports` annotation referencing P033 / RFC-006.
- **Amend ADR-0024** + regenerate `docs/decisions/README.md` compendium (ADR-077).

### Out of scope

- The single-source-of-truth (`packageManager` / workflows-read-one-declared-version) mechanism — ADR-0024 flags it as warranting its own investigation (peer-dep/engine interactions, adopter portability). Remains an available future reassessment per ADR-0024 (a); this guard fully serves JTBD-012 without it.
- Any change to the actual pinned npm version (already aligned to 11.13.0 in `f0cb373`).
- Auto-remediation / auto-bumping the pins — the guard surfaces loudly and lets the human decide (consistent with the surface-loudly-don't-auto-remediate discipline).

## Tasks

- [ ] T1 — `scripts/check-npm-pin.js` guard (extract workflow pins + ≥1-pin assertion + compare majors + loud failure message) with `test/check-npm-pin.test.js` asserting mismatch-fails / match-passes / all-three-pins-extracted / zero-pins-fails. TDD per ADR-052.
- [ ] T2 — wire `check:npm-pin` into `package.json` scripts + `prepush` (before `check:lockfile`); verify `npm run prepush` passes at the current aligned state.
- [ ] T3 — amend ADR-0024 (flip the convention-only "Bad" consequence) + regenerate the decisions compendium.
- [ ] T4 — ship-signal: close P033 (Known Error → Verification Pending) folded into the fix commit per ADR-022; `ci:` commit type (internal tooling, no minor bump); changeset for the release.

## Commits

(rendered from `git log --grep "Refs: RFC-006"` at manage-rfc / reconcile time — none yet at capture.)

## Related

- ADR-0024 — pin CI npm to the lockfile-generator npm version; this RFC implements its deferred residual-risk closure and amends its now-false convention-only consequence.
- P033 — the driver problem (Known Error).
- JTBD-012 — ship a release without the pipeline stalling silently; the guard's prepush-local surface serves this job's core outcome.
