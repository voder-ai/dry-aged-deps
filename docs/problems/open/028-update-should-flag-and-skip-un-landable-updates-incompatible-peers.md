# Problem 028: dry-aged-deps --update should flag and skip un-landable updates (incompatible peer deps / ERESOLVE) instead of attempting them

**Status**: Open
**Reported**: 2026-06-17
**Priority**: 3 (Medium) — Impact: 3 x Likelihood: 1 (deferred — re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: M (deferred — re-rate at next /wr-itil:review-problems)
**JTBD**: JTBD-104, JTBD-106
**Persona**: ci-automation-engineer

## Description

`dry-aged-deps --update` (and the CI auto-update loop that consumes it) currently attempts every safe-and-aged update without checking whether the update can actually land. When an update is **not possible to install** — the peer-dependency graph won't resolve without `--force` / `--legacy-peer-deps` — it should be flagged and skipped rather than attempted-then-failed (or landed-then-reverted).

### Motivating scenario (downstream `bbstats`)

A major bump in the safe-update batch had no resolvable peer graph: `vite` 8 could not land because `clerk-sveltekit` (latest `0.4.3`, ~3 years stale) predates vite 8 and does not declare a compatible peer range — an ERESOLVE. Because `dry-aged-deps` applies the whole batch at once, the one un-landable major poisoned the others, and the armed cron would **land + revert daily**, spawning a stale release PR each time. An agent ran ~30 min trying to fix it and correctly declined to force a broken commit — there was no fix to make, because the blocker is an unmaintained upstream library.

(That the blocking library is _also_ deprecated is a separate, independently-useful signal — split out as **P029**. This ticket is specifically about detecting un-landable peer graphs, which applies whether or not the blocker is deprecated.)

### What npm exposes (evidence)

- Peer compatibility is detectable up-front by resolving the prospective install — e.g. an `npm install --dry-run` / `--package-lock-only` of the target version set, or reading the candidate's `peerDependencies` ranges against the installed tree. An ERESOLVE means the update is not possible without `--force` / `--legacy-peer-deps`, which is exactly what should be flagged-and-skipped, not forced.

### Proposed behaviour (to refine at investigation)

- Before attempting / proposing an update, check whether it is landable (peer graph resolves without `--force`).
- For un-landable updates: flag them in output (table / JSON / XML) with a reason (`incompatible-peers`) and skip them, rather than attempt-and-fail.
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
- [ ] Decide detection mechanism for un-landable updates (peer-resolution dry-run vs `peerDependencies` range check)
- [ ] Decide output shape for flagged-and-skipped updates (reason column / JSON field) across table / JSON / XML formatters
- [ ] Decide whether a single un-landable major should be skipped in isolation so the rest of the batch can still land (avoid one bad bump poisoning the batch)

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P029 (detect deprecated dependencies + surface them loudly, no auto-remediation) — sibling "should we attempt this update?" signal split from the same capture.

## Related

- **JTBD-104** (`docs/jtbd/ci-automation-engineer/JTBD-104-open-pr-for-safe-updates.proposed.md`) — open a PR only for updates that can actually land; don't push branches for doomed upgrades.
- **JTBD-106** (`docs/jtbd/ci-automation-engineer/JTBD-106-recover-from-pr-failures.proposed.md`) — recover from auto-PR failures autonomously; flag-and-skip an un-landable bump rather than churn land/revert.
- **JTBD-002** (`docs/jtbd/project-maintainer/JTBD-002-apply-safe-updates.proposed.md`) — the manual `--update`/apply surface this capability also serves.
- **P029** — sibling ticket: deprecation detection (split from this capture per user direction 2026-06-17).
- Captured via /wr-itil:capture-problem; split into P028 + P029 per user direction; expand at next investigation.
