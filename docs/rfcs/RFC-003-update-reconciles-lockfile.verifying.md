---
status: verifying
rfc-id: update-reconciles-lockfile
reported: 2026-07-08
decision-makers: [Tom Howard]
problems: [P030]
adrs: [ADR-0021]
jtbd: []
stories: []
---

# RFC-003: `--update` reconciles package-lock.json

**Status**: verifying
**Reported**: 2026-07-08
**Problems**: P030
**ADRs**: ADR-0021
**JTBD**: (deferred — cited JTBD-104 is unratified locally; body Related preserves the descriptive reference per the RFC-001 inverse-P078 precedent.)

## Summary

Make `dry-aged-deps --update` reconcile `package-lock.json` in the same run, so
the post-update project is immediately installable via
`npm ci --prefer-frozen-lockfile`. After `applyUpdates()` writes the safe target
versions into `package.json`, `--update` spawns
`npm install --ignore-scripts --package-lock-only` to sync the lockfile
incrementally. Implements the decision recorded in ADR-0021.

## Driving problem trace

- **P030** (`dry-aged-deps --update` leaves package-lock.json stale, breaking
  `npm ci` for adopters) — `applyUpdates()` writes package.json and prints
  "Run 'npm install'" but never touches the lockfile, so adopter CI running
  `npm ci --prefer-frozen-lockfile` fails EUSAGE. The from-scratch reconcile
  reflex (`rm`-and-reinstall) makes it worse by producing an unstable lockfile.

## Scope

### In scope

1. **Reconcile after apply** — in `src/update-packages.js`, after
   `applyUpdates()` writes package.json, spawn
   `npm install --ignore-scripts --package-lock-only` in the project directory
   to bring `package-lock.json` into sync. Runs ONLY when ≥1 update was applied.
2. **Fail loud** — on reconcile failure (npm error / offline), surface the error
   and reflect it in the exit code so CI notices, rather than silently shipping a
   stale lockfile. package.json stays written (the update itself succeeded).
3. **Spec amendment** — amend `prompts/011.0-DEV-AUTO-UPDATE.md` (REQ-POST-UPDATE
   and the Story Note "doesn't run npm install automatically") to record the new
   `--package-lock-only` sync, which does NOT install node_modules or run scripts.
4. **README / --help** — surface the new post-update behaviour.

### Out of scope

- A `--no-lockfile` opt-out flag (ADR-0021 declined it per ADR-0014's YAGNI bar;
  revisit if a persona emerges).
- Installing `node_modules` (only lockfile metadata is synced).

## Tasks

- [~] T1 — end-to-end `npm ci --prefer-frozen-lockfile` passing after `--update`:
  covered indirectly by the deterministic unit tests (T2) plus the auto-update
  pipeline that dogfoods this exact `npm install --ignore-scripts
--package-lock-only` reconcile (shipped green this session). A dedicated
  real-`npm ci` fixture e2e is DEFERRED (slow / network) — noted, not silently
  dropped.
- [x] T2 — unit tests: reconcile spawns npm with `--ignore-scripts` +
      `--package-lock-only`; no-safe-updates path does NOT spawn; fail-loud on
      npm error (`src/update-packages.reconcile.test.js`, 4 tests).
- [x] T3 — GREEN: `reconcileLockfile()` + injectable reconcile wired into
      `updatePackages()` in `src/update-packages.js`.
- [x] T4 — amended `prompts/011.0-DEV-AUTO-UPDATE.md` (REQ-POST-UPDATE + Story Note).
- [x] T5 — surfaced in README Options table + example + `bin/dry-aged-deps.js`
      `--help`; ships as the `feat:` release signal.

## Related

- ADR-0021 — the decision this RFC implements.
- ADR-0017 §Workflow step 3 — the external reconcile step this internalises (stays as belt-and-braces).
- P030 — the driver problem.
- JTBD-104 (open PR for safe updates — ci-automation-engineer) — the anchor job; a stale lockfile breaks the CI validation it depends on.
