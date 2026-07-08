---
status: 'proposed'
date: 2026-07-08
human-oversight: confirmed
oversight-date: 2026-07-08
decision-makers: ['Tom Howard']
consulted: ['Tom Howard (via wr-architect:agent review)']
informed: []
reassessment-date: 2026-10-08
---

# 0021. `--update` reconciles package-lock.json via incremental `npm install --package-lock-only`

## Context and Problem Statement

`dry-aged-deps --update` writes the safe target versions into `package.json`
(`src/update-packages.js` `applyUpdates()`) and prints `Run 'npm install' to
install the updates`, but never touches `package-lock.json`. An adopter whose CI
uses the standard `npm ci --prefer-frozen-lockfile` then fails with EUSAGE
("package.json and package-lock.json are out of sync") — the `--update` command
leaves the project in a non-installable state. Worse, an adopter who reconciles
by deleting `node_modules` + `package-lock.json` and running `npm install` from
scratch can produce a lockfile whose nested optional/peer dedupe structure fails
both `npm ci` and `npm install --package-lock-only` drift checks (observed
2026-07-08, P030). The tool's own auto-update workflow (ADR-0017 §Workflow step 3) already carries an external `npm install --ignore-scripts --package-lock-only`
"normalize lockfile" step as a workaround — direct evidence that the base
`--update` command leaves this gap.

Problem tracked as P030 (Origin: internal; JTBD-104 open-PR-for-safe-updates,
ci-automation-engineer persona).

## Decision Drivers

- **Functional completeness** — a `package.json` that fails `npm ci` is an
  incomplete `--update`. The tool's value is helping adopters land safe updates;
  landing them in a non-installable state defeats that.
- **Existing subprocess precedent** — the tool already shells out to
  `npm outdated --json` (`src/build-rows.js`) and `npm audit --json`
  (`src/check-vulnerabilities.js`, ADR-0008). A reconcile subprocess is the same
  pattern, not a new dependency (no-production-dependencies constraint untouched
  — npm is spawned, not imported).
- **Dogfooding** — the auto-update workflow (ADR-0017 step 3) already runs the
  exact reconcile step externally; moving it into the tool removes duplication.
- **Supply-chain safety** — `--ignore-scripts` keeps the tool's core posture:
  no lifecycle scripts run during the reconcile.
- **Incremental-only** — a from-scratch (`rm`-and-reinstall) regen produces an
  unstable lockfile (P030); `--package-lock-only` on the existing lockfile
  preserves the stable nested structure.

## Considered Options

1. **Reconcile in `--update`** — after writing package.json, run
   `npm install --ignore-scripts --package-lock-only` to sync the lockfile
   incrementally.
2. **Warn-only** — keep package.json-only behaviour; replace the "Run npm
   install" line with a warning to reconcile incrementally (never
   rm-and-reinstall). Aligns with "surface loudly, don't auto-remediate" but
   leaves the reconcile as a manual step for every adopter on every run.
3. **Both** — reconcile by default plus a `--no-lockfile` opt-out flag.

## Decision Outcome

Chosen option: **"Reconcile in `--update`"** (Option 1), selected by the
maintainer on 2026-07-08. After `applyUpdates()` writes `package.json`, `--update`
spawns `npm install --ignore-scripts --package-lock-only` in the project
directory to bring `package-lock.json` into sync, so the post-update project is
immediately installable via `npm ci --prefer-frozen-lockfile`.

Option 3's `--no-lockfile` opt-out was not adopted: per ADR-0014's YAGNI bar
(which rejected a `--target` flag as persona-unmotivated), no persona currently
needs the escape hatch. It can be added later if one emerges.

### Behaviour

- The reconcile runs ONLY when at least one update was applied (skip on the
  no-safe-updates path).
- `--ignore-scripts` is mandatory — no lifecycle scripts run.
- `--package-lock-only` — the reconcile updates lockfile metadata only; it does
  NOT install `node_modules` (the 011.0 Story Note's "doesn't run npm install
  automatically" intent is preserved in spirit: no node_modules install, no
  scripts; only the lockfile metadata that MUST match package.json is synced).
- On reconcile failure (npm error, offline), `--update` surfaces the error and
  leaves package.json written — the exit code reflects the failure so CI notices
  rather than silently shipping a stale lockfile.

## Consequences

### Good

- `--update` output is immediately installable; adopter `npm ci` no longer breaks.
- Removes the from-scratch-reconcile footgun (the tool does the safe incremental
  reconcile itself).
- Lets ADR-0017's external step 3 become belt-and-braces (it stays for defence in
  depth; not removed by this ADR).

### Neutral

- `--update` now runs an extra npm subprocess (latency + network), consistent with
  the existing `npm outdated` / `npm audit` subprocess cost.

### Bad

- Amends the `prompts/011.0-DEV-AUTO-UPDATE.md` Story Note intent ("doesn't run
  npm install automatically") — the narrower `--package-lock-only` sync is now in
  scope. Recorded here rather than left as silent drift.
- Adds a subprocess failure surface to the base command (mitigated by the
  fail-loud behaviour above).

## Confirmation

- `REQ-POST-UPDATE` (prompts/011.0) is amended: post-update reconciles the
  lockfile; a test asserts `--update` on a fixture leaves `npm ci
--prefer-frozen-lockfile` passing.
- A test asserts the reconcile spawns npm with `--ignore-scripts` and
  `--package-lock-only` (supply-chain posture + incremental-only).
- A test asserts the no-safe-updates path does NOT spawn the reconcile.

## Pros and Cons of the Options

### Option 1 — Reconcile

- Good: complete fix; dogfooded; narrow install-free sync.
- Bad: subprocess side-effect; amends 011.0 Story Note; needs an RFC (multi-commit).

### Option 2 — Warn-only

- Good: tiny; aligns with "surface loudly, don't auto-remediate".
- Bad: leaves the mandatory reconcile to every adopter; does not fix the npm-ci break.

### Option 3 — Both

- Good: best coverage.
- Bad: opt-out flag fails ADR-0014's YAGNI bar (no persona needs it yet).

## Reassessment Criteria

- Reassess if a persona emerges that needs package.json-only `--update` (revisit
  the Option 3 `--no-lockfile` flag).
- Reassess if the reconcile subprocess proves flaky enough to warrant a retry or
  a graceful-degrade-to-warning fallback.

## Related

- P030 — the driver problem (docs/problems/open/030-...).
- ADR-0014 — governs the `--update` target version (latest-safe), NOT side-effects; unchanged.
- ADR-0017 §Workflow step 3 — the external reconcile step this internalises; stays as belt-and-braces.
- ADR-0008 — npm-subprocess precedent (`npm audit`).
- prompts/011.0-DEV-AUTO-UPDATE.md — REQ-POST-UPDATE + Story Note amended by this ADR.
