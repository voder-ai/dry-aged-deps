# Problem 033: CI npm pin drifts from the lockfile-generator npm version, silently stalling the release pipeline

**Status**: Open
**Reported**: 2026-07-26
**Priority**: 9 (Medium) — Impact: 3 (Moderate — publishing disrupted; every `feat:`/`fix:` sits unreleased on `main` and adopters get no updates) × Likelihood: 3 (Possible — fires whenever a session regenerates `package-lock.json` under a newer npm major than the pinned CI npm; observed 3 consecutive ci-publish failures on 2026-07-25)
**Origin**: internal
**Effort**: M — a `check:lockfile`/prepush guard comparing the CI npm pin to the `lockfileVersion` / npm major that generated `package-lock.json`; one script plus wiring, no cross-package work
**JTBD**: JTBD-012
**Persona**: project-maintainer

## Description

The `build-and-test`, `publish`, and `auto-update` CI jobs pin a specific npm via `npm install -g npm@X` (e.g. `npm@10.9.2`), but the committed `package-lock.json` is regenerated locally by whatever npm the developer/agent session runs (npm 11.x). When the two diverge across a major, `npm ci --prefer-frozen-lockfile` rejects the lockfile (`Missing: <pkg> from lock file`) and every ci-publish run fails at the "Install dependencies" step — no release publishes, and the failure is a silent release-pipeline stall: the release-eligible `feat:`/`fix:` commit sits on `main` unreleased with no loud signal that the pipeline is wedged.

Observed 2026-07-25: an npm-11-generated lockfile against CI's `npm@10.9.2` pin failed 3 consecutive ci-publish runs before the pins were aligned to `11.13.0` (commit `f0cb373`). The `feat(deprecation)` P029 minor bump (commit `7e77036`) was blocked the entire time and only shipped as `2.17.0` once the pins matched.

Compounding factor: the `publish` job historically ran `npm ci` with **no npm pin at all** — it used node 22's default npm (~10.x). So even a corrected `build-and-test` pin would not have covered the release step; `f0cb373` added an explicit "Install specific npm version" step to the publish job to close that gap.

## Symptoms

- Every `ci-publish` run fails at "Install dependencies" with `npm ci` error `Missing: <pkg> from lock file` (e.g. `conventional-commits-parser@7.1.0`).
- `main` accumulates unreleased `feat:`/`fix:` commits; `npm view <pkg> version` stays behind the source.
- Local `npm ci` / `npm run check:lockfile` pass (developer runs the matching npm), so the drift is invisible until CI.

## Workaround

Align every CI npm pin (`build-and-test`, `publish`, `auto-update`) to the npm major that generated the committed lockfile — done in `f0cb373` (all three at `11.13.0`). This is a manual, reactive alignment; it re-drifts the next time a session regenerates the lockfile under a newer npm.

## Impact Assessment

- **Who is affected**: the project-maintainer shipping releases of dry-aged-deps (release pipeline wedged); transitively, adopters who get no updates while the pipeline is stalled.
- **Frequency**: per npm-major boundary crossing between the lockfile generator and the CI pin.
- **Severity**: Moderate — no data loss, but the release pipeline is fully blocked and the failure mode is silent (no alert; discovered only by inspecting CI or noticing the version didn't bump).
- **Analytics**: 3 consecutive ci-publish failures on 2026-07-25 (runs `30178298922`, `30178731150`, `30179611319`-predecessors) before the pin alignment.

## Root Cause Analysis

No invariant ties the CI npm pin to the npm version that generates `package-lock.json`. A lockfile regeneration under a newer npm major is invisible to the pinned CI until `npm ci` fails at install time — there is no local guard that fails fast when the pin and the lockfile generator disagree.

### Investigation Tasks

- [ ] Decide the loud-surfacing point: a `check:lockfile` extension or a dedicated prepush step comparing the CI npm pin (grepped from `.github/workflows/*.yml`) against the `lockfileVersion` field (or an npm-major fingerprint) of `package-lock.json`.
- [ ] Create a reproduction test: a fixture with a pin/lockfile-major mismatch that the guard fails on, and a matching pair it passes.
- [ ] Consider whether a single source of truth for the npm version (e.g. a `packageManager` / `.nvmrc`-adjacent pin the workflows read) removes the drift class entirely rather than detecting it.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P030 (`--update` leaves package-lock.json stale, breaking `npm ci` for adopters) — both concern `npm ci` rejecting a lockfile, but P030 is the CLI's `--update` apply path for adopters whereas this ticket is this repo's own CI npm-pin drift; distinct surfaces.

## Related

Captured via `/wr-itil:capture-problem` (lightweight aside). Immediate remediation (align all three npm pins to `11.13.0`) shipped in commit `f0cb373`; the Option-B decision that remediation embodies — "the CI npm pin must equal the npm version that generates the committed lockfile" — is recorded in the sibling ADR-0024. Persona: project-maintainer (maintainer-side release concern). No existing product JTBD covered _releasing dry-aged-deps itself_ (the corpus jobs are all about _using_ the tool), so rather than shoehorn, a new job was created and ratified: **JTBD-012** (ship a release without the pipeline stalling silently), 2026-07-26.
