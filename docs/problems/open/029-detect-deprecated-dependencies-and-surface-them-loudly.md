# Problem 029: dry-aged-deps should detect deprecated dependencies and surface them loudly (verbatim npm deprecation message) — no auto-remediation

**Status**: Open
**Reported**: 2026-06-17
**Priority**: 3 (Medium) — Impact: 3 x Likelihood: 1 (deferred — re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: M (deferred — re-rate at next /wr-itil:review-problems)
**JTBD**: JTBD-001, JTBD-009
**Persona**: project-maintainer

## Description

`dry-aged-deps` does not currently detect or surface when a dependency (installed or update-candidate) has been **deprecated** on the npm registry. A deprecated dependency is a standing risk — often unmaintained, and sometimes superseded — that the maintainer should see.

The desired behaviour is narrow and deliberate: **detect deprecation and be loud about it.** Surface the verbatim npm deprecation message and stop there. `dry-aged-deps` must **not** decide what to do about it — no heuristic parsing of a recommended replacement out of the free-text message, no migration recommendation, no auto-remediation. Surfacing the signal is the tool's job; deciding the response is the human's or LLM's job. (Design direction from the user, 2026-06-17: _"If something is deprecated just be loud about that. Leave it to the human or LLM to decide what to do about it."_)

This is the sibling of **P028** (un-landable peer graphs). The two were split because they are independent signals: a deprecated dependency may still install cleanly (landable), and a non-deprecated dependency may be un-landable. Each answers a different "what should the human know about this dependency?" question.

### Motivating scenario (downstream `bbstats`)

`clerk-sveltekit` (the library blocking the vite 8 major in P028) is deprecated. npm already knows this:

```
$ npm view clerk-sveltekit deprecated
This package is deprecated. Please use svelte-clerk instead: https://github.com/wobsoriano/svelte-clerk
```

Note the replacement (`svelte-clerk`) is right there in the verbatim message. Surfacing that message as-is is enough — the maintainer (or an LLM agent acting for them) reads it and decides. `dry-aged-deps` does **not** need to parse "svelte-clerk" out into a structured field; doing so would be fragile guessing on free-text, and is explicitly out of scope.

### What npm exposes (evidence)

- Deprecation is set by the package **maintainer** via `npm deprecate <pkg>@<range> "<message>"`, which writes a `deprecated` free-text string onto each matching version in the registry **packument** (`https://registry.npmjs.org/<pkg>` → `versions[<ver>].deprecated`).
- It is readable via `npm view <pkg> deprecated`, in the packument JSON, and as `npm warn deprecated <pkg>@<ver>: <message>` during install. `npm outdated --json` does **not** carry it.
- **Low marginal cost for this tool**: `dry-aged-deps` already fetches each package's packument from the registry to compute update age (`fetchVersionTimes` in `src/build-rows.js` reads the `time` map). The same packument carries the `deprecated` field per version — so deprecation detection reuses data the tool already downloads, no extra round-trip per package.

### Proposed behaviour (to refine at investigation)

- Read the `deprecated` field from the packument the tool already fetches; flag deprecated dependencies (installed and/or update-candidate) loudly in output (table / JSON / XML).
- Surface the deprecation message **verbatim**. Do not parse, summarise, or extract a replacement from it; do not emit a recommendation.
- Out of scope (explicit): heuristic replacement extraction, migration suggestions, or any auto-remediation. The tool surfaces the signal; the human or LLM decides the response.
- Open question for investigation: whether a deprecated package should also influence filtering (e.g. never silently auto-apply an update whose package is deprecated) or remain purely advisory-and-loud.

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
- [ ] Decide the loud-surfacing output shape: a deprecation column / JSON field carrying the verbatim message, in the default read-only listing and/or the `--update` apply path
- [ ] Decide whether deprecation is advisory-and-loud only or can also influence filtering (never silently auto-apply a deprecated package's update)

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P028 (flag and skip un-landable updates / incompatible peers) — sibling "what should the human know about this dependency?" signal split from the same capture.

## Related

- **JTBD-001** (`docs/jtbd/project-maintainer/JTBD-001-see-safe-updates.proposed.md`) — surfacing that a dependency is deprecated is part of seeing what is (un)safe to take or keep.
- **JTBD-009** (`docs/jtbd/project-maintainer/JTBD-009-see-unfixable-vulnerabilities.proposed.md`) — analogous risk-surfacing: a deprecated dep is a risk to see loudly, not silently carry; the tool surfaces, the human decides.
- **P028** — sibling ticket: un-landable peer-graph detection (split from this capture per user direction 2026-06-17).
- Motivating scenario: downstream `bbstats` project — deprecated, ~3-year-stale `clerk-sveltekit` (the verbatim npm message names `svelte-clerk`) blocking the vite 8 major.
- Captured via /wr-itil:capture-problem; split into P028 + P029, then scoped to loud-surfacing-only (no heuristic extraction) per user direction 2026-06-17.
