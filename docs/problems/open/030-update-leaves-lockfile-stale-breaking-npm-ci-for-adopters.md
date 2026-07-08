# Problem 030: `dry-aged-deps --update` leaves package-lock.json stale, breaking `npm ci` for adopters

**Status**: Open
**Reported**: 2026-07-08
**Priority**: 9 (Medium) — Impact: 3 × Likelihood: 3 — derived at capture from the description per Step 4a
**Origin**: internal
**Effort**: M — derived at capture per Step 4a
**JTBD**: JTBD-104
**Persona**: ci-automation-engineer

## Description

`dry-aged-deps --update` writes the new versions into `package.json` and prints
"Run 'npm install' to install the updates", but does NOT touch
`package-lock.json`. An adopter whose CI uses the standard
`npm ci --prefer-frozen-lockfile` then fails with EUSAGE "package.json and
package-lock.json are out of sync".

If the adopter reconciles by deleting `node_modules` + `package-lock.json` and
running `npm install` from scratch, the regenerated lockfile can have an
unstable nested optional/peer dedupe structure where
`npm install --package-lock-only` (lockfile-drift gates) and
`npm ci --prefer-frozen-lockfile` demand _incompatible_ forms — no single
committed lockfile passes both. We hit this exact failure this session (2026-07-08):
the auto-update pipeline went red on `npm ci` EUSAGE, and only an INCREMENTAL
reconciliation (`npm audit fix` / `npm install` without `rm`, preserving the
existing lockfile structure) produced a lockfile that passed both `npm ci` and
the drift check.

Impact: every adopter using `dry-aged-deps --update` in an automated/CI context
(the ci-automation-engineer persona) is exposed. Notably, the tool's own
auto-update workflow already carries a "normalize lockfile" step
(`npm install --ignore-scripts --package-lock-only`) as a workaround — direct
evidence that the base `--update` command leaves this gap.

Suggested direction (not prescriptive): have `--update` reconcile
`package-lock.json` itself via an incremental `npm install --package-lock-only`,
OR at minimum document/warn that the lockfile must be reconciled _incrementally_
and never via `rm`-and-reinstall.

## Symptoms

- `npm ci --prefer-frozen-lockfile` fails EUSAGE ("out of sync") immediately after `dry-aged-deps --update`, before any dep-related test failure.
- From-scratch lockfile regen fails a `npm install --package-lock-only && git diff --exit-code` drift gate (the pruned form) while a full-install form fails `npm ci` (the un-pruned form) — the two are mutually exclusive.

## Workaround

Reconcile the lockfile incrementally after `--update`: `npm install` (no `rm`) or `npm audit fix`. Never `rm -rf node_modules package-lock.json && npm install`. Verify all three: `npm ci --prefer-frozen-lockfile` exits 0, `npm install --package-lock-only` is idempotent through the full validation sequence, and `npm audit` is clean.

## Impact Assessment

- **Who is affected**: adopters running `--update` in CI/automation (ci-automation-engineer persona); anyone whose install step uses `npm ci --prefer-frozen-lockfile`.
- **Frequency**: every `--update` run whose result is consumed by `npm ci` without an intervening incremental `npm install`.
- **Severity**: Moderate — publishing/CI pipeline disrupted; a documented workaround exists but is non-obvious (the from-scratch reflex actively makes it worse).
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Decide scope: reconcile-lockfile-in-`--update` vs. documentation/warning only.
- [ ] If reconciling: implement incremental `npm install --package-lock-only` post-write in `src/update-packages.js` (guard against the from-scratch trap).
- [ ] Create a reproduction test: `--update` then `npm ci --prefer-frozen-lockfile` on a fixture.
- [ ] Confirm the fix keeps the lockfile a dual fixpoint (npm ci AND `--package-lock-only` idempotent).

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P028 (`--update` should flag/skip un-landable ERESOLVE updates) — sibling `--update`-hardening concern, distinct axis.

## Related

- **P028** — `--update` flag/skip un-landable updates. Distinct: P028 is about updates that _cannot_ land (ERESOLVE); P030 is about _landable_ updates that leave an inconsistent lockfile. Sibling hardening of the same command.
- **P013** — overrides block ignored / vuln mislabelling. Adjacent (both surfaced during the same 2026-07-08 session), different subsystem.
- Captured via `/wr-itil:capture-problem`; expand at next investigation. Duplicate-check surfaced P001/P008/P017/P028 on keyword overlap — none are the same problem (P028 noted above).

## RFCs

| RFC     | Status   | Title                                   |
| ------- | -------- | --------------------------------------- |
| RFC-003 | proposed | `--update` reconciles package-lock.json |
