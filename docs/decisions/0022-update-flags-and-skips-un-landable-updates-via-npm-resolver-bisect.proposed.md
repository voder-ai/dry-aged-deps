---
status: 'proposed'
date: 2026-07-09
human-oversight: confirmed
oversight-date: 2026-07-09
decision-makers: ['Tom Howard']
consulted: ['Tom Howard (via wr-architect:agent review + AskUserQuestion)']
informed: []
reassessment-date: 2026-10-09
---

# 0022. `--update`/`--check` flag and skip un-landable updates via npm-resolver bisect

## Context and Problem Statement

`dry-aged-deps` filters updates to those that are mature + vulnerability-free
("safe"), but never checks whether a safe update can actually **land** — i.e.
whether its peer-dependency graph resolves without `--force` /
`--legacy-peer-deps`. When one safe update in a batch is un-landable (an
ERESOLVE), it poisons the rest: post-ADR-0021, `--update` writes package.json and
reconciles the lockfile, and a single ERESOLVE fails the whole reconcile — so
**nothing lands**. The auto-update cron then churns land/revert daily and spawns
a stale release PR each time (P028; motivating case: `bbstats`, where `vite` 8
could not land because a ~3-year-stale peer `clerk-sveltekit` predates it).

Problem tracked as P028 (Origin: internal; JTBD-104 open-PR-for-safe-updates,
JTBD-106 recover-from-PR-failures, JTBD-002 apply-safe-updates).

## Decision Drivers

- **Isolate the culprit** — one un-landable major must not block the landable rest.
- **npm's resolver is ground truth** — the tool already shells `npm outdated` /
  `npm audit` / `npm install --package-lock-only` rather than re-implementing npm
  logic (ADR-0008, ADR-0021). Peer/optional/meta-peer + overrides interplay is
  exactly the resolver logic not to re-implement.
- **`--check`/`--update` coherence (ADR-0014)** — ADR-0014 closed the gap where
  `--check` exit-1 and `--update` disagreed. An un-landable "safe" row that
  `--check` counts but `--update` skips would reopen that gap.
- **Surface loudly, don't auto-remediate** — flag+skip is correct; auto-applying
  `--force` / `--legacy-peer-deps` to force a broken graph is not.

## Considered Options

**Detection mechanism:**

1. **npm-resolver bisect** — attempt the reconcile; on ERESOLVE, bisect the safe
   set (subset re-reconciles) to isolate the culprit(s), using npm's resolver.
2. **Per-update `peerDependencies` range check** — read each candidate's peer
   ranges against the installed tree ourselves. Re-implements npm's resolver.
3. **Single `npm install --dry-run` + parse the ERESOLVE report** — one run, but
   brittle human-readable-output parsing.

**Where landability sits:**

- **A. In the filter pipeline** (both `--check` and `--update` respect it).
- **B. At `--update` time only** (cheaper `--check`, but reopens the ADR-0014 gap).

## Decision Outcome

Chosen (maintainer, 2026-07-09, via AskUserQuestion):

- **Detection: Option 1 — npm-resolver bisect.** Attempt an incremental
  `npm install --ignore-scripts --package-lock-only` of the safe target set; if it
  ERESOLVEs, bisect to isolate the un-landable package(s). Extra npm runs happen
  ONLY on a failing batch (rare in steady state); bisect keeps the common
  single-culprit case to ~O(log n) reconciles. npm's resolver is ground truth for
  both detection and attribution.
- **Placement: Option A — in the filter pipeline.** Landability is a new filter
  dimension after age + security. Un-landable rows are removed from `safeRows`
  (so they do NOT count toward `--check`'s exit-1) and moved to a flagged
  `incompatible-peers` set surfaced separately — `--check` and `--update` agree,
  and the cron stops churning on a never-landable batch.

### Behaviour

- Un-landable rows surface with reason `incompatible-peers` in table / JSON / XML,
  ADR-0018-style: a **separate section, never a new column** (JTBD-005);
  per-package grouping in the table, per-item granularity in JSON/XML; additive to
  the ADR-0002 schemas (unknown-field-tolerant consumers unaffected).
- **Never auto-apply `--force` / `--legacy-peer-deps`.** The un-landable graph is
  surfaced, not forced.
- **ADR-0021 fail-loud is NARROWED, not repealed:** an **ERESOLVE** during the
  reconcile is recoverable-by-isolation (land the landable subset, flag the rest);
  **any other npm error** (offline, EACCES, registry failure) stays fail-loud —
  a stale lockfile from a genuine failure still exits non-zero.

## Consequences

### Good

- One un-landable major no longer poisons the batch; the landable rest lands.
- The auto-update cron stops the daily land/revert + stale-PR churn (JTBD-106).
- `--check` no longer reports "safe updates available" for updates that can't land.

### Neutral

- `--check` now runs the landability probe (an `npm install --package-lock-only`
  resolve) — a heavier CI gate, accepted for coherence.

### Bad

- Bisect worst-case (many independent culprits) is O(n) reconciles; bounded by the
  safe-batch size and only on a failing batch.
- Narrows ADR-0021's Confirmation ("rejects on any npm error"): now qualified —
  ERESOLVE is isolated, other errors fail loud. Recorded as an ADR-0021 amendment.

## Confirmation

- A fixture batch with one ERESOLVE-inducing update classifies that update
  `incompatible-peers`, skips it, and lands the rest; `--check` does not count it
  toward exit-1.
- A non-ERESOLVE npm error during reconcile still fails loud (ADR-0021 preserved).
- No code path passes `--force` / `--legacy-peer-deps`.
- The `incompatible-peers` surface is additive across table/JSON/XML.

## Pros and Cons of the Options

- **Detection 1 (bisect)** — Good: npm ground truth, cost only on failure. Bad: worst-case O(n).
- **Detection 2 (peer check)** — Good: fast. Bad: re-implements the resolver; can disagree with reality.
- **Detection 3 (parse ERESOLVE)** — Good: one run. Bad: brittle output parsing (against CLAUDE.md "read full results, no jq").
- **Placement A (pipeline)** — Good: coherent. Bad: heavier `--check`.
- **Placement B (--update only)** — Good: cheap `--check`. Bad: reopens the ADR-0014 gap.

## Reassessment Criteria

- Reassess if the `--check` landability probe proves too heavy for CI cadence
  (consider caching by lockfile hash or an opt-out).
- Reassess bisect worst-case if real batches routinely carry many independent culprits.

## Related

- P028 — the driver problem.
- ADR-0021 — reconcile contract; this ADR amends its fail-loud to ERESOLVE-isolates / other-errors-fail-loud.
- ADR-0018 — the flag-and-skip-with-reason surface precedent (separate section, reason vocabulary, additive schemas).
- ADR-0014 — `--check`/`--update` coherence; landability enters the same pipeline.
- ADR-0002/0003/0004 — output schemas + exit-code contract (preserved; un-landable rows are exit-code-neutral, removed from the exit-1 count).
- P029 — sibling (deprecation surfacing); distinct signal.
