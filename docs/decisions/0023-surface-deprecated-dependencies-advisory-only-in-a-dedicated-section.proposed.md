---
status: 'proposed'
date: 2026-07-25
human-oversight: confirmed
oversight-date: 2026-07-25
decision-makers: [Tom Howard]
consulted: []
informed: []
reassessment-date: 2026-10-25
---

# Surface deprecated dependencies advisory-only in a dedicated section

> Captured via /wr-architect:capture-adr (foreground-lightweight aside-invocation per ADR-032, derived-substance amendment 2026-07-06 / RFC-045). Section content was derived by the capturing agent from the in-session decision context; human-oversight: unconfirmed until ratified at the /wr-architect:review-decisions drain.

## Context and Problem Statement

`dry-aged-deps` surfaces dependency-health signals (update age, known vulnerabilities, override hygiene, un-landable peer graphs). It does **not** surface when a dependency has been **deprecated** on the npm registry — a standing risk (often unmaintained or superseded) the maintainer should see. P029 confirmed the root cause: the tool reads only the `time` field from the registry (via `src/fetch-version-times.js`); the per-version `deprecated` free-text message is available but never requested.

Two design questions gate the fix: **(1)** how to surface the verbatim deprecation message across the three output formats (table / JSON / XML), and **(2)** whether deprecation stays purely advisory or also influences the `--update` apply path. Both were resolved with the maintainer via `AskUserQuestion` on 2026-07-25.

## Decision Drivers

- **User design direction (2026-06-17)**: _"If something is deprecated just be loud about that. Leave it to the human or LLM to decide what to do about it."_ — surface the signal; do not decide the response.
- **Consistency with existing informational surfaces**: the tool already has dedicated "loud block" sections for unfixable vulnerabilities (ADR-0018) and overrides hygiene — deprecation is the same shape of signal.
- **The verbatim message is long**: npm deprecation strings routinely contain a replacement package name plus a URL (e.g. `Please use svelte-clerk instead: https://…`) — they do not fit a table column without truncation.
- **Minimal first cut**: ship the loud-surfacing value without entangling the `--update` CLI contract; leave room to add filtering influence later only if a real need emerges.

## Considered Options

Decision 1 — output shape:

1. **Dedicated deprecation section (chosen)** — a `Deprecated dependencies` block listing each deprecated package + its verbatim message; JSON/XML carry a `deprecated` array of `{name, version, message}`.
2. **Column in the main outdated table (rejected)** — inline per row, but the verbatim message is too long for a table cell.

Decision 2 — advisory vs filtering:

1. **Advisory-only (chosen)** — surface loudly everywhere; never influence age/security filtering or the `--update` apply path.
2. **Advisory + flag-and-skip in `--update` (deferred)** — also stop `--update` from silently auto-applying a deprecated package's update. Deferred: it adds `--update`-contract complexity beyond the loud-surfacing MVP and can be added later.

## Decision Outcome

Chosen: **surface the verbatim npm deprecation message in a dedicated section (table) / `deprecated` array (JSON, XML), advisory-only** — deprecation never influences filtering or `--update`. This is the strictest reading of the user's "just be loud, leave the decision to the human/LLM" direction, matches the tool's established dedicated-informational-section pattern (ADR-0018 unfixable vulns; overrides hygiene), and keeps the first cut minimal. The per-version `deprecated` field is read by widening the existing per-package `npm view` call in `src/fetch-version-times.js` (no extra round-trip).

Explicitly out of scope: heuristic replacement extraction from the free-text message, migration recommendations, and any auto-remediation. The tool surfaces the signal verbatim; the human or LLM decides the response.

## Consequences

### Good

- Maintainers see deprecated dependencies loudly and verbatim, in every output format, without the signal being buried in `npm install` noise.
- Zero new CLI-contract surface: `--check` exit codes and `--update` behaviour are unchanged, so no existing automation breaks.
- Reuses data the tool already fetches per package (one `npm view` call, widened field list) — no extra registry round-trip.
- Consistent with the existing unfixable-vulns / overrides-hygiene informational sections, so the output stays coherent.

### Neutral

- The `deprecated` field is read for every package regardless of whether the user acts on it; cost is negligible (same call, wider projection).

### Bad

- Advisory-only means `--update` can still auto-apply a bump to a package that is itself deprecated (the deprecation is shown, not acted on). Accepted deliberately per the user's direction; revisited only if this proves surprising in practice (see Reassessment).
- Verbatim surfacing means a maliciously-crafted deprecation message is printed as-is; acceptable because it is registry-published text the user would see via `npm` anyway, and no parsing/execution is performed on it.

## Confirmation

- A project depending on a known-deprecated package (e.g. `clerk-sveltekit`) shows a `Deprecated dependencies` section in table output with the verbatim npm message, and a `deprecated` array in `--format=json` / `--format=xml`.
- `--update` applied to such a project produces the same package.json/lockfile result as before this change (deprecation is surfaced, never acted on) — asserted by a behavioural test.
- The `deprecated` value is read from the same per-package registry call as `time` (no second `npm view` per package) — asserted by the fetch layer's test.

## Pros and Cons of the Options

### Dedicated deprecation section (chosen)

- Good, because it fits the long verbatim message and matches the existing informational-section pattern.
- Bad, because it is a separate block to scan rather than inline with the package row.

### Column in the main table (rejected)

- Good, because deprecation would sit inline with each package.
- Bad, because the verbatim message (name + URL) does not fit a table cell without truncation, defeating "surface it verbatim".

### Advisory-only (chosen)

- Good, because it is the strictest reading of the user's direction and touches no CLI contract.
- Bad, because `--update` can still bump a deprecated package.

### Advisory + flag-and-skip in `--update` (deferred)

- Good, because it would stop auto-upgrading deeper into a deprecated package.
- Bad, because it complicates the `--update` contract before there is evidence the simpler advisory-only shape is insufficient.

## Reassessment Criteria

- Reopen if advisory-only proves surprising in practice — e.g. users report `--update` silently upgrading them within a deprecated package and expect a flag-and-skip guard (the deferred Decision-2 option).
- Reopen if a dedicated section proves worse than an inline indicator once real output is in front of users.
- Reopen if npm changes how it exposes deprecation (the packument `versions[].deprecated` field) such that the widened `npm view` call no longer carries it.
