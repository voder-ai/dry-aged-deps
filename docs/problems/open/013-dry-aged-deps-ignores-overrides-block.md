# Problem 013: dry-aged-deps ignores the package.json `overrides` block — stale/vulnerable override pins go undetected, and override-fixable vulns are mislabeled "unfixable"

**Status**: Open
**Reported**: 2026-05-25
**Priority**: 9 (Medium) — Impact: Moderate (3) x Likelihood: Possible (3)
**Effort**: L — new module (overrides parser + advisory-range cross-reference) + new prompt/ADR (RFC scope: overrides hygiene surface plus `fixAvailable`-aware unfixable reason)
**WSJF**: 2.25 = (9 × 1.0) / 4
**Type**: technical

## Description

`dry-aged-deps`' analysis pipeline never reads the `package.json` `overrides` block. Its inputs are:

- `npm outdated --json` — direct dependencies with newer versions available,
- `package.json` `dependencies` / `devDependencies` — for prod/dev classification (`src/load-package-json.js`),
- `npm audit --json` — vulnerabilities (`src/check-vulnerabilities.js`, `src/run-project-audit.js`).

Nothing parses `overrides`. As a result the tool — whose entire value proposition is "surface safe, mature, non-vulnerable dependency state" — is blind to a whole class of project-controlled dependency hygiene: a stale `overrides` entry that pins a (often transitive) package to a version that is now behind-latest and/or within a known advisory range.

Discovered 2026-05-25 while reviewing the brace-expansion advisories on this repo. `package.json` carries `"overrides": { "brace-expansion": "^4.0.1", ... }`, added 2025-11-18 (commit `4664227`, "override glob and brace-expansion to secure patched versions") as a security pin to a then-safe version. Two advisories disclosed since make 4.x vulnerable:

- GHSA-f886-m6hf-6m8v (1115543): zero-step hang, affected `>= 4.0.0 < 5.0.5`, patched 5.0.5.
- GHSA-jxxr-4gwj-5jf2 (1119088): numeric-range DoS, affected `>= 5.0.0 < 5.0.6`, patched 5.0.6.

The `^4.0.1` pin now forces the tree onto a vulnerable version (safe target is `^5.0.6`). The override that once meant "secure" now means "vulnerable" — and as a hard pin it actively blocks the fix. A dependency-hygiene tool should flag exactly this: "override X pins Y to Z, which is outdated and/or within advisory range — update or remove."

Two distinct gaps:

1. **No `overrides` awareness at all.** The override block is invisible to detection, so stale/vulnerable/no-longer-needed override pins are never surfaced or recommended for update/removal.
2. **The unfixable surface (ADR-0018, shipped v2.10.0) mislabels override-pinned / transitive vulns.** `npm audit` reports brace-expansion with `fixAvailable: true`, but `src/find-unfixable-vulns.js` ignores `fixAvailable` and stamps any transitive dep `vulnerable transitive dependency` (implying no fix). It reported brace-expansion as _unfixable_ when npm itself says a fix exists. The reason logic should distinguish "genuinely no fix" (e.g. npm's own bundled copy, which `overrides` cannot reach) from "fix exists but needs a tree change (parent bump or `overrides` edit)".

## Symptoms

- `dry-aged-deps --check` on this repo surfaces `brace-expansion` under "Known vulnerabilities without safe fix" with reason `vulnerable transitive dependency`, despite the vuln being fixable by changing the `overrides` pin from `^4.0.1` to `^5.0.6`.
- No output anywhere flags that the `overrides` entry itself is stale / pinning to a vulnerable version.
- `npm audit` reports `fixAvailable: true` for brace-expansion while dry-aged-deps reports it as unfixable — contradictory guidance.

## Workaround

Manual: read `npm audit` advisory ranges, cross-reference against `package.json` `overrides`, and hand-edit stale pins. (This is exactly the toil the tool is meant to eliminate.)

## Impact Assessment

- **Who is affected**: any project using `dry-aged-deps` that also uses `overrides` for security pins (a common pattern). Self-inflicted, project-controlled vulnerabilities from stale overrides go undetected.
- **Frequency**: whenever a previously-safe override target is later flagged by a new advisory or simply falls behind — i.e. exactly the drift `dry-aged-deps` exists to catch.
- **Severity**: Medium — no runtime break, but a correctness/trust gap in the tool's core value proposition (it gives misleading "unfixable" guidance and misses a whole class of remediable risk).

## Root Cause Analysis

### Initial hypothesis

`dry-aged-deps` was scoped to `npm outdated` + `npm audit` + direct-dep classification. The `overrides` block was never in scope because the original feature set (age filter, security filter, update, output formats) operated on direct dependencies. The unfixable surface (ADR-0018) added transitive-vuln visibility but keys purely off "absence from the safe-update set" and ignores `npm audit`'s `fixAvailable` signal — so it cannot tell an override-fixable vuln from a genuinely-unfixable one.

Candidate fix shapes (for a future RFC):

1. **Overrides hygiene surface** — parse `overrides`, cross-reference each pin against `npm outdated`/registry (behind-latest?) and `npm audit` advisory ranges (vulnerable?), and emit an "overrides to update or remove" section. Likely a new prompt/ADR + a new module analogous to `find-unfixable-vulns.js`.
2. **Sharpen the unfixable reason** — incorporate `npm audit`'s `fixAvailable` so transitive/override-pinned vulns with `fixAvailable: true` are reported as "fix available via tree change (override/parent)" rather than "no fix". Smaller, complements #1.
3. **Both** — #2 corrects the mislabel immediately; #1 delivers the missing capability.

### Investigation Tasks

- [x] Re-rate Priority and Effort at next /wr-itil:review-problems (2026-05-30: Impact 3 × Likelihood 3 = 9 (Medium), Effort L, kept Open — root cause hypothesised but fix direction needs RFC; candidate shapes are mutually exclusive product decisions)
- [ ] Decide whether overrides-hygiene is a new RFC/story or an extension of the unfixable feature (ADR-0018).
- [ ] Confirm the `fixAvailable` field is reliably present in `npm audit --json` across npm versions before keying behaviour off it.
- [ ] Validate against this repo's live case: bumping `overrides.brace-expansion` `^4.0.1` → `^5.0.6` should drop our copy from the audit, and the tool should both (a) have flagged the stale override and (b) not have called it unfixable.

## Fix Strategy

**Direction selected** (AFK loop 2026-05-30 — Option 3 "Both, full scope"): combine both candidate shapes — (1) add a new `overrides-hygiene` module that reads the `overrides` block, ages each pin, and surfaces stale/vulnerable override pins, AND (2) sharpen the "unfixable" reason logic to be `fixAvailable`-aware so override-fixable vulns aren't mislabelled as "vulnerable transitive dependency".

Implementation needs a new RFC (per Investigation Task above) that defines the `overrides-hygiene` module's contract AND amends ADR-0018 to incorporate the `fixAvailable`-aware reason logic. Largest scope of the three candidates.

Next AFK iter should invoke `/wr-itil:capture-rfc` (or `/wr-itil:manage-rfc`) with a problem-trace to P013 to formalise the product-shape spec before implementation begins. This satisfies ADR-074 substance-confirm-before-build.

## Dependencies

- **Composes with**: ADR-0018 (unfixable-vuln surface) — gap #2 is a refinement of that feature; gap #1 is adjacent new capability.

## Related

- ADR-0018 — `docs/decisions/0018-surface-known-vulnerable-but-unfixable-packages.proposed.md` (the surface that mislabels override-fixable vulns).
- `src/find-unfixable-vulns.js` — ignores `fixAvailable`; reason logic stamps transitive deps "vulnerable transitive dependency".
- `src/load-package-json.js`, `src/run-project-audit.js`, `src/check-vulnerabilities.js` — the inputs, none of which read `overrides`.
- `package.json` `overrides.brace-expansion` `^4.0.1` — the live stale pin (added commit `4664227`, 2025-11-18); safe target `^5.0.6`.
- Session log: 2026-05-25 — discovered while reviewing brace-expansion advisories GHSA-f886-m6hf-6m8v / GHSA-jxxr-4gwj-5jf2 immediately after shipping the unfixable surface (v2.10.0 / v2.10.1).

(captured manually in the /wr-itil:capture-problem lightweight format — the wr-itil skill was unavailable in this session; expand at next investigation. README.md refresh deferred to /wr-itil:review-problems per the capture contract.)
