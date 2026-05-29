# Problem 014: the age soak is unconditional — it ignores the severity of the vulnerability the project is _currently exposed to_, so it can hold you on a known-vulnerable version while a fix ages

**Status**: Open
**Reported**: 2026-05-25
**Priority**: 9 (Medium) — Impact: Moderate (3) x Likelihood: Possible (3)
**Effort**: L — product-shape RFC (severity→soak policy decision) + new logic combining npm audit current-exposure data with age-gate semantics
**WSJF**: 2.25 = (9 × 1.0) / 4
**Type**: technical (design / product)

## Description

`dry-aged-deps`' core value is a risk trade: it makes you wait `min-age` days (default 7) before adopting an update, so that a fresh release's _unknown_ risks — a supply-chain compromise or a regression that hasn't surfaced yet — have time to come to light. Time-on-registry is the cheap proxy for "this release has been vetted by the ecosystem."

But that soak is currently **absolute**. It does not account for the _other_ side of the trade: the **known** risk of the vulnerability in the version you are _currently sitting on_. The right amount of aging is not a constant — it is a balance:

- **Wait longer** → more confidence the new version is clean, but more exposure to the known vuln.
- **Adopt sooner** → clears the known vuln faster, but you adopt an unvetted release.

The fulcrum is the **profile of the vulnerability you are currently exposed to** — severity × exploitability × actual reachability. A known _critical, remotely-exploitable, runtime_ vuln in your current version should justify adopting even a freshly-published fix (the known present risk dominates the unknown fresh-release risk). A _moderate, dev-only, no-attacker-input_ vuln should not (the unknown fresh-release risk dominates → wait the full soak).

`dry-aged-deps` cannot express this today. Its `min-age` gate is unconditional, and `--severity` / `prodMinSeverity` / `devMinSeverity` only govern how _clean the candidate_ must be — not whether the project is _currently exposed_ and how badly. So the tool can recommend "wait" even when you are sitting on a high-severity exploitable vulnerability whose fix is one freshly-published release away.

Discovered 2026-05-25 reasoning through the brace-expansion remaining advisory: npm@11.15.0 bundles the patched `brace-expansion@5.0.6` and satisfies `@semantic-release/npm`'s `^11.6.2` range, but it is only ~4 days old — under the 7-day soak. For _that_ case (moderate, dev/CI-only, no attacker input) waiting is correct. But the same mechanism would also force "wait" if the current exposure were critical and exploitable, which would be the wrong call. The decision should depend on the known vulnerability; the tool treats age as independent of it.

## Symptoms

- A project sitting on a known-vulnerable version, with a fix available but younger than `min-age`, gets the same "wait / not yet safe" treatment regardless of whether the known vuln is `low`/dev-only or `critical`/exploitable/runtime.
- There is no flag or config to say "shorten or waive the soak for an update that fixes a vulnerability I am currently exposed to, scaled by its severity."
- Operators must reason about this trade-off entirely by hand, which is exactly the cognitive toil the tool exists to remove.

## Workaround

Manual judgement: when a known vuln is severe/exploitable enough to justify jumping the soak, the operator bypasses `dry-aged-deps`' recommendation and updates directly (or lowers `--min-age` globally for that run, which is a blunt instrument — it relaxes aging for _every_ package, not just the one with the exposure).

## Impact Assessment

- **Who is affected**: any user relying on `dry-aged-deps` to make the wait-vs-adopt call for them. The tool currently under-serves the "I'm exposed to something serious and the fix is fresh" scenario — arguably the highest-stakes decision it could help with.
- **Frequency**: every time a security fix lands in a release younger than `min-age` while the current version is known-vulnerable. Common for actively-exploited advisories (fixes ship fast; the vulnerable window is exactly when the fix is freshest).
- **Severity**: Medium — no incorrect _action_ is taken (the tool errs toward caution), but it gives sub-optimal _guidance_ on the highest-stakes case, and the blunt workaround (global `--min-age` drop) trades away the soak for unrelated packages.

## Root Cause Analysis

### Initial hypothesis

`min-age` and the security filter were designed as independent axes: age gates maturity; severity gates candidate cleanliness. Neither axis encodes _current exposure_ — "what vulnerability does my installed version have, and how bad is it." So the two risks (unknown-fresh-release vs known-current-vuln) are never weighed against each other; age always wins.

Candidate design directions (for a future RFC — not decided here):

1. **Exposure-aware / severity-scaled soak** — when the _current_ installed version has a known vuln, scale the required `min-age` _down_ as that vuln's severity rises (e.g. critical → 0-day soak, high → 1–2 days, moderate → reduced, low/none → full soak). The fixing update is then recommended sooner in proportion to how badly you are exposed.
2. **Per-exposure soak override** — a narrower flag/config (`--min-age-when-vulnerable=<days>` or a severity→days map) that relaxes the soak _only_ for the specific package(s) whose current version is vulnerable, leaving every other package on the full soak (avoids the blunt global `--min-age` drop).
3. **Surface the trade-off, let the human decide** — rather than auto-relaxing, explicitly report "package X has a known <severity> vuln in your current version; a fix exists at version Y (N days old, under your M-day soak)" so the operator makes the informed call. Lower-risk; complements 1/2.

Requires: a reliable read of the _current_ version's vulnerabilities (npm audit already provides this — it is the same data the unfixable surface uses), and a severity→soak policy. Composes with the exit-code and output contracts (ADR-0003/0004) and the security threshold semantics (prompts/006).

### Investigation Tasks

- [x] Re-rate Priority and Effort at next /wr-itil:review-problems (2026-05-30: Impact 3 × Likelihood 3 = 9 (Medium), Effort L, kept Open — product-shape RFC required before fix direction is selected)
- [ ] Decide direction (1 / 2 / 3 or combination) via RFC; this is a product-shape decision, not just an implementation detail.
- [ ] Define the severity→soak policy (what does "critical" buy you — 0 days? — and is it configurable?).
- [ ] Confirm npm audit reliably reports the _current_ installed version's vulns (vs only candidate versions) for the affected package.

## Dependencies

- **Composes with**: ADR-0018 (unfixable surface — same npm-audit current-exposure data), P013 (overrides/transitive blindness — both are "the tool's risk model is narrower than the real decision"), prompts/005 (configurable age threshold), prompts/006 (configurable security threshold).

## Related

- `src/filter-by-age.js` — the unconditional age gate.
- `src/filter-by-security.js` / `src/apply-filters.js` — severity governs candidate cleanliness, not current exposure.
- prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md, prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md — the two independent axes that this ticket argues should interact.
- P013 — sibling "risk model too narrow" gap (overrides + transitive visibility).
- Session log: 2026-05-25 — surfaced reasoning through the brace-expansion / npm@11.15.0 wait-vs-adopt decision (fix bundled in a 4-day-old npm, under the 7-day soak; waiting correct here _because_ the known vuln is moderate/dev-only — but the decision visibly depends on the known vuln's profile).

(captured manually in the /wr-itil:capture-problem lightweight format — the wr-itil skill was unavailable in this session; expand at next investigation. README.md refresh deferred to /wr-itil:review-problems per the capture contract.)
