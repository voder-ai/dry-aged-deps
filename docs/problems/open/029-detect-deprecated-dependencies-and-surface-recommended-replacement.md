# Problem 029: dry-aged-deps should detect deprecated dependencies and surface the deprecation message + recommended replacement

**Status**: Open
**Reported**: 2026-06-17
**Priority**: 3 (Medium) — Impact: 3 x Likelihood: 1 (deferred — re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: M (deferred — re-rate at next /wr-itil:review-problems)
**JTBD**: JTBD-001, JTBD-009
**Persona**: project-maintainer

## Description

`dry-aged-deps` does not currently detect or surface when a dependency (installed or update-candidate) has been **deprecated** on the npm registry. A deprecated dependency is a standing risk — often unmaintained, and sometimes superseded by a named replacement — that the maintainer should see, and that the auto-update loop should not blindly churn on.

This is the sibling of **P028** (un-landable peer graphs). The two were split because they are independent signals: a deprecated dependency may still install cleanly (landable), and a non-deprecated dependency may be un-landable. Each answers a different "should we attempt / keep this?" question.

### Motivating scenario (downstream `bbstats`)

`clerk-sveltekit` (the library blocking the vite 8 major in P028) is deprecated. npm already knows this:

```
$ npm view clerk-sveltekit deprecated
This package is deprecated. Please use svelte-clerk instead: https://github.com/wobsoriano/svelte-clerk
```

The recommended successor (`svelte-clerk`, at v1.1.9 vs the dead `clerk-sveltekit@0.4.3`) is named in the message. Surfacing this would let the maintainer plan a migration instead of receiving daily failed-PR noise from an upgrade blocked by a dead dependency.

### What npm exposes (evidence)

- Deprecation is set by the package **maintainer** via `npm deprecate <pkg>@<range> "<message>"`, which writes a `deprecated` free-text string onto each matching version in the registry **packument** (`https://registry.npmjs.org/<pkg>` → `versions[<ver>].deprecated`).
- It is readable via `npm view <pkg> deprecated`, in the packument JSON, and as `npm warn deprecated <pkg>@<ver>: <message>` during install. `npm outdated --json` does **not** carry it.
- **Low marginal cost for this tool**: `dry-aged-deps` already fetches each package's packument from the registry to compute update age (`fetchVersionTimes` in `src/build-rows.js` reads the `time` map). The same packument carries the `deprecated` field per version — so deprecation detection reuses data the tool already downloads, no extra round-trip per package.
- **No structured successor field**: the replacement is conveyed only in the free-text message by convention (`"Please use svelte-clerk instead: <url>"`). Surfacing a suggested replacement therefore requires heuristic parsing of that string (e.g. `use <name> instead`, or extracting a repo/package URL).

### Proposed behaviour (to refine at investigation)

- Read the `deprecated` field from the packument the tool already fetches; flag deprecated dependencies (installed and/or update-candidate) in output (table / JSON / XML).
- Surface the deprecation message verbatim, and — where a replacement is heuristically extractable — surface it as advisory context.
- Optionally feed the signal into the auto-update loop so it does not churn on upgrades blocked by a deprecated/dead dependency (composes with P028).

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
- [ ] Confirm the packument `deprecated` field is available in the data `fetchVersionTimes` already pulls (reuse vs extra request)
- [ ] Decide the heuristic for extracting a recommended replacement from the free-text deprecation message (and accept that some messages name none)
- [ ] Decide the output surface: a deprecation column / JSON field in the default read-only listing, the `--update` apply path, or both
- [ ] Decide whether deprecation is advisory-only or can influence filtering (e.g. never auto-apply an update whose package is deprecated)

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P028 (flag and skip un-landable updates / incompatible peers) — sibling "should we attempt this update?" signal split from the same capture.

## Related

- **JTBD-001** (`docs/jtbd/project-maintainer/JTBD-001-see-safe-updates.proposed.md`) — surfacing that a dependency is deprecated is part of seeing what is (un)safe to take or keep.
- **JTBD-009** (`docs/jtbd/project-maintainer/JTBD-009-see-unfixable-vulnerabilities.proposed.md`) — analogous risk-surfacing: a deprecated dep with no clean successor is a risk to see, not silently carry.
- **JTBD-106** (`docs/jtbd/ci-automation-engineer/JTBD-106-recover-from-pr-failures.proposed.md`) — secondary: the auto-update loop should not churn on upgrades blocked by a deprecated dependency.
- **P028** — sibling ticket: un-landable peer-graph detection (split from this capture per user direction 2026-06-17).
- Motivating scenario: downstream `bbstats` project — deprecated, ~3-year-stale `clerk-sveltekit` (recommended successor `svelte-clerk`) blocking the vite 8 major.
- Captured via /wr-itil:capture-problem; split into P028 + P029 per user direction; expand at next investigation.
