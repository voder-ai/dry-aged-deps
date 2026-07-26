# Problem 033: CI npm pin drifts from the lockfile-generator npm version, silently stalling the release pipeline

**Status**: Verification Pending
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

### Findings (2026-07-26)

- **`lockfileVersion` is NOT a usable drift fingerprint.** The committed lockfile is `lockfileVersion: 3`, which is written by BOTH npm 10 and npm 11 (lockfileVersion 3 = npm 7+). So the originally-proposed "compare the CI pin against `lockfileVersion`" detection would NOT have caught the npm10-vs-npm11 drift that actually broke the pipeline. The reliable "which npm generated this lockfile" signal is the npm **version that ran the install**, not any field inside the lockfile.
- **The controllable knob is the CI pin, not the generator** (per ADR-0024): dev/agent sessions run current npm; CI is the side that must track them. The guard must therefore compare the CI pin against the **locally-running npm** (the generator) and fail loudly BEFORE the drift reaches CI.
- **Three pins exist**: `ci-publish.yml` build-and-test (line 46) + publish (line 120), and `auto-update.yml` (line 77) — all currently `npm@11.13.0`. A guard asserting every CI pin's major equals the local npm major transitively guarantees the three pins agree with each other too (closes the compounding "publish job unpinned" factor).
- **Compare majors, not exact versions**: only the npm major boundary changes lockfile shape; a dev on `11.13.1` vs a CI pin of `11.13.0` must NOT fail. Major-only comparison avoids false-positive churn on every patch bump.

### Investigation Tasks

- [x] Decide the loud-surfacing point → a dedicated `check:npm-pin` prepush step comparing the CI npm pins (grepped from `.github/workflows/*.yml`) against the local `npm --version` **major** (the lockfile generator). `lockfileVersion` rejected as a fingerprint (see Findings).
- [x] Reproduction test → unit test over the guard's pure comparison: a mismatched (CI-major ≠ local-major) pair fails, a matching pair passes. Co-located with the guard script.
- [x] Single source of truth (`packageManager`) → **deferred, not chosen** for this fix. ADR-0024 flags SSOT as warranting its own investigation (peer-dep/engine interactions, adopter portability) and the fail-fast guard fully serves JTBD-012's "fails at prepush / locally" outcome and closes ADR-0024's named residual risk with far less surface. SSOT remains an available future reassessment per ADR-0024 (a).

## Fix Strategy

A `check:npm-pin` guard wired into `prepush` (before `check:lockfile`), backed by `scripts/check-npm-pin.js`:

1. Grep every `npm install -g npm@<X>` pin out of `.github/workflows/*.yml`.
2. Read the local `npm --version` (the lockfile generator).
3. Assert every CI pin's **major** equals the local npm major. On mismatch, exit non-zero with a message naming the drift and the remediation ("bump the CI pins in `.github/workflows/*.yml` to npm <local-major>.x, or regenerate the lockfile under npm <pin-major>").

This is the fail-fast drift guard ADR-0024 defers to P033 and the prepush-local surface JTBD-012 requires. Serves JTBD-012 (ship a release without the pipeline stalling silently).

**Release vehicle**: none — `ci:` internal-tooling change (no npm publish); ships on merge to `main`.

## RFCs

| RFC     | Status   | Title                                                                                                                    |
| ------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| RFC-006 | proposed | `check:npm-pin` prepush drift guard — fail fast when a CI npm pin's major diverges from the local lockfile-generator npm |

## Fix Released

Shipped 2026-07-26 via RFC-006. `scripts/check-npm-pin.js` greps every `npm install -g npm@<X>` pin from `.github/workflows/*.yml`, reads the local (lockfile-generator) `npm --version`, and fails loudly + locally at `prepush` (before `check:lockfile`) when any pin's **major** diverges — naming the drift + the two remediations. Asserts ≥1 pin discovered (no vacuous pass). ADR-0024's convention-only "Bad" consequence amended to reflect the automated guard.

Verified in-session: `npm run check:npm-pin` exits 0 at the current aligned state (3 pins all npm 11.x, local npm 11.13.0); `test/check-npm-pin.test.js` — 7/7 pass (pin extraction ×3, major parse, no-drift, minor/patch-ignored, drift-flagged).

Awaiting user verification that the guard fires red on a real npm-major drift (observable only when a future lockfile regen crosses a major boundary).

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P030 (`--update` leaves package-lock.json stale, breaking `npm ci` for adopters) — both concern `npm ci` rejecting a lockfile, but P030 is the CLI's `--update` apply path for adopters whereas this ticket is this repo's own CI npm-pin drift; distinct surfaces.

## Related

Captured via `/wr-itil:capture-problem` (lightweight aside). Immediate remediation (align all three npm pins to `11.13.0`) shipped in commit `f0cb373`; the Option-B decision that remediation embodies — "the CI npm pin must equal the npm version that generates the committed lockfile" — is recorded in the sibling ADR-0024. Persona: project-maintainer (maintainer-side release concern). No existing product JTBD covered _releasing dry-aged-deps itself_ (the corpus jobs are all about _using_ the tool), so rather than shoehorn, a new job was created and ratified: **JTBD-012** (ship a release without the pipeline stalling silently), 2026-07-26.
