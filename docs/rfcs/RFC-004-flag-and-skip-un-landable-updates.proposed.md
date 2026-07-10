---
status: proposed
rfc-id: flag-and-skip-un-landable-updates
reported: 2026-07-09
decision-makers: [Tom Howard]
problems: [P028]
adrs: [ADR-0022]
jtbd: [JTBD-104, JTBD-106, JTBD-100, JTBD-002, JTBD-005, JTBD-010]
stories: [019.0-DEV-FLAG-UN-LANDABLE-UPDATES]
---

# RFC-004: flag and skip un-landable updates

**Status**: proposed
**Reported**: 2026-07-09
**Problems**: P028
**ADRs**: ADR-0022
**JTBD**: JTBD-010 (maintainer surface — see un-landable updates), JTBD-104 / JTBD-106 / JTBD-100 (CI path), JTBD-002 (--update), JTBD-005 (familiar output). All ratified.

## Summary

Detect safe updates that cannot land (peer graph won't resolve without
`--force` / `--legacy-peer-deps` — an ERESOLVE), flag them with reason
`incompatible-peers`, and skip them so the landable rest of the batch still
applies. Landability enters the filter pipeline, so `--check` and `--update`
agree (an un-landable "safe" update no longer counts toward `--check`'s exit-1).
Implements ADR-0022. Detection uses npm's real resolver (attempt the reconcile;
on ERESOLVE, isolate the culprit(s)).

## Driving problem trace

- **P028** — one un-landable major (bbstats: `vite` 8 vs a stale peer) poisons
  the whole safe batch; post-ADR-0021 the reconcile fails loud and nothing lands,
  and the auto-update cron churns land/revert daily.

## Scope

### In scope

1. **Detection module** (`src/compute-unlandable.js` or similar): given the safe
   target set, apply it in an isolated copy and run
   `npm install --ignore-scripts --package-lock-only`; on ERESOLVE, isolate the
   un-landable package(s) via npm's resolver (test individual rows / bisect).
   Never pass `--force` / `--legacy-peer-deps`.
2. **Filter-pipeline integration** (`src/print-outdated.js`): move un-landable
   rows out of `safeRows` into an `incompatible` set (reason `incompatible-peers`)
   BEFORE the exit-code decision, so `--check` exit-1 counts only landable rows.
3. **Output surface** (mirror the unfixable pattern): a separate
   `incompatible-peers` section in the table (per-package), and additive
   JSON/XML fields (per-item) — ADR-0018-style, JTBD-005 (no new table column).
4. **Reconcile narrowing** (`src/update-packages.js`): ERESOLVE during the
   `--update` reconcile is recoverable-by-isolation; other npm errors stay
   fail-loud (ADR-0021 preserved).
5. **README / --help** — document the flag-and-skip behaviour.

### Out of scope

- Auto-applying `--force` / `--legacy-peer-deps` (ADR-0022 prohibits it).
- Detecting un-landability for reasons other than peer-graph ERESOLVE.
- Deprecation detection (P029, sibling).

## Tasks

- [ ] T1 — RED+GREEN: `computeUnlandable()` detection module — apply-all →
      on ERESOLVE isolate culprit(s) via npm's resolver; unit tests with mocked
      npm (ERESOLVE isolates the culprit; clean batch → all landable; non-ERESOLVE
      npm error propagates fail-loud).
- [ ] T2 — wire into `print-outdated.js`: un-landable removed from `safeRows`
      (coherent `--check`), surfaced separately.
- [ ] T3 — `incompatible-peers` section in table + additive JSON/XML fields.
- [ ] T4 — narrow `updatePackages` reconcile fail-loud (ERESOLVE vs other errors).
- [ ] T5 — README / `--help`; `feat:` ship signal.

## Related

- ADR-0022 — the decision this RFC implements.
- ADR-0021 — reconcile contract narrowed by ADR-0022.
- ADR-0018 — the flag-and-skip surface precedent mirrored here.
- P028 — the driver problem. P029 — sibling (deprecation).
