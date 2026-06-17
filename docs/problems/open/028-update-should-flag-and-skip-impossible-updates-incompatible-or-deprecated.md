# Problem 028: dry-aged-deps --update should flag and skip impossible updates (incompatible peers / deprecated deps) instead of attempting them

**Status**: Open
**Reported**: 2026-06-17
**Priority**: 3 (Medium) — Impact: 3 x Likelihood: 1 (deferred — re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: M (deferred — re-rate at next /wr-itil:review-problems)
**JTBD**: JTBD-104, JTBD-106
**Persona**: ci-automation-engineer

## Description

`dry-aged-deps --update` (and the CI auto-update loop that consumes it) currently attempts every safe-and-aged update without checking whether the update can actually land. When an update is **not possible**, it should flag it and skip it rather than attempt-then-fail (or land-then-revert).

Two distinct "not possible / not advisable" signals motivated this capture, observed in a downstream project (`bbstats`):

1. **Peer-dependency incompatibility (ERESOLVE).** A major bump in the safe-update batch had no resolvable peer graph — e.g. `vite` 8 could not land because `clerk-sveltekit` (latest `0.4.3`, ~3 years stale) predates vite 8 and does not declare a rolldown-compatible peer range. Because `dry-aged-deps` applies the whole batch, the one un-landable major poisoned the others, and the armed cron would **land + revert daily**, spawning a stale release PR each time. The agent ran ~30 min trying to fix it and correctly declined to force a broken commit — there was no fix to make, because the blocker is an unmaintained upstream auth library.

2. **Deprecated dependencies.** `clerk-sveltekit` is deprecated. npm already knows this — the registry carries a `deprecated` free-text field per version, and `npm view clerk-sveltekit deprecated` returns:

   > "This package is deprecated. Please use svelte-clerk instead: https://github.com/wobsoriano/svelte-clerk"

   A smarter `--update` would detect the deprecation, **not** churn on an upgrade blocked by a dead dependency, and surface the deprecation message (including any recommended replacement) so the maintainer can plan a migration instead of receiving daily failed-PR noise.

### What npm exposes (evidence)

- **Peer compatibility:** detectable up-front by resolving the prospective install (e.g. an `npm install --dry-run` / `--package-lock-only` of the target version set, or reading `peerDependencies` ranges) — an ERESOLVE means the update is not possible without `--force`/`--legacy-peer-deps`, which is exactly what should be flagged-and-skipped, not forced.
- **Deprecation:** the npm registry stores a `deprecated` field on each published version (set by the maintainer via `npm deprecate <pkg>@<range> "<message>"`). It is surfaced via `npm view <pkg> deprecated`, in the packument JSON (`deprecated` key per version), and as `npm warn deprecated <pkg>@<ver>: <message>` during install. **There is no structured "successor/replacement" field** — the replacement is conveyed in the free-text message by convention (`"Please use svelte-clerk instead: <url>"`), so surfacing a suggested replacement requires heuristic parsing of that string.

### Proposed behaviour (to refine at investigation)

- Before attempting / proposing an update, check whether it is landable (peer graph resolves without `--force`) and whether the current-or-target package is deprecated.
- For not-possible updates: flag them in output (table/JSON/XML) with a reason (`incompatible-peers` / `deprecated`) and skip them rather than attempt-and-fail.
- Where a deprecation message names a replacement, surface it as advisory context so the maintainer can plan a migration.
- This keeps the auto-update loop from the daily land/revert + stale-release-PR churn (JTBD-106) and avoids opening doomed PRs in the first place (JTBD-104).

## Symptoms

(deferred to investigation)

## Workaround

(deferred to investigation)

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: (deferred to investigation)
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Investigate root cause
- [ ] Create reproduction test
- [ ] Decide detection mechanism for un-landable updates (peer-resolution dry-run vs peerDependencies range check)
- [ ] Decide deprecation-detection surface (`npm view deprecated` / packument `deprecated` field) and whether to heuristically extract a recommended replacement from the free-text message
- [ ] Decide output shape for flagged-and-skipped updates (reason column / JSON field) across table / JSON / XML formatters
- [ ] Confirm whether this belongs in `--update`/apply only, or also in the default read-only listing (surface deprecation as a column)

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

- **JTBD-104** (`docs/jtbd/ci-automation-engineer/JTBD-104-open-pr-for-safe-updates.proposed.md`) — open a PR only for updates that can actually land; don't push branches for doomed upgrades.
- **JTBD-106** (`docs/jtbd/ci-automation-engineer/JTBD-106-recover-from-pr-failures.proposed.md`) — recover from auto-PR failures autonomously; flag-and-skip an un-landable bump rather than churn land/revert.
- **JTBD-002** (`docs/jtbd/project-maintainer/JTBD-002-apply-safe-updates.proposed.md`) — the manual `--update`/apply surface this capability also serves.
- Motivating scenario: downstream `bbstats` project — `vite` 8 major blocked by deprecated, ~3-year-stale `clerk-sveltekit` auth library (recommended successor `svelte-clerk`); `dry-aged-deps` applying all majors at once meant the cron landed+reverted daily and spawned a stale release PR each time.
- Captured via /wr-itil:capture-problem; expand at next investigation.
