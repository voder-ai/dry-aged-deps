# Problem 013: dry-aged-deps ignores the package.json `overrides` block — stale/vulnerable override pins go undetected, and override-fixable vulns are mislabeled "unfixable"

**Status**: Known Error
**Reported**: 2026-05-25
**Origin**: internal
**Priority**: 9 (Medium) — Impact: Moderate (3) x Likelihood: Possible (3)
**Effort**: L — new module (overrides parser + advisory-range cross-reference) + new prompt/ADR (RFC scope: overrides hygiene surface plus `fixAvailable`-aware unfixable reason)
**WSJF**: 4.5 = (9 × 2.0) / 4
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
- [x] Decide whether overrides-hygiene is a new RFC/story or an extension of the unfixable feature (ADR-0018). (2026-05-30: user direction — gap #1 is a new RFC (RFC-001, now `verifying`), gap #2 is an ADR-0018 amendment.)
- [x] Confirm the `fixAvailable` field is reliably present in `npm audit --json` across npm versions before keying behaviour off it. (2026-05-30: observed `fixAvailable: true` on the brace-expansion entry in this repo's current `npm audit --json` output under npm 11.x; field is present on the `vulnerabilities.<name>` object. RFC should still cite a minimum npm version baseline rather than assume universal presence.)
- [x] Validate against this repo's live case: bumping `overrides.brace-expansion` `^4.0.1` → `^5.0.6` should drop our copy from the audit, and the tool should both (a) have flagged the stale override and (b) not have called it unfixable. (2026-05-30: override has since been bumped to `^5.0.6` in `package.json`. Live `dry-aged-deps --check` STILL reports `brace-expansion` with reason `vulnerable transitive dependency` while `npm audit` reports `fixAvailable: true`. The residual advisory (GHSA-jxxr-4gwj-5jf2) hits the `node_modules/npm/node_modules/brace-expansion` bundled-in-npm copy, which `overrides` cannot reach — gap #2 mislabel confirmed observable; the override-staleness flag from gap #1 was not exercised because the override was already current.)
- [ ] **Confirm substance of the proposed ADR-0018 amendment**: the three-class unfixable-reason taxonomy `(a) fix-via-parent-bump` / `(b) fix-via-overrides-edit` / `(c) genuinely-unfixable`. ADR-074 substance-confirm-before-build guard fires (ADR-0018 is born-`proposed`, no `human-oversight: confirmed` marker, no amendment yet drafted). **Direction-setting; queued for loop-end Step 2.5 via `outstanding_questions` (2026-06-04 AFK iter 5).** Once confirmed, the amendment can be drafted, then `src/find-unfixable-vulns.js` edits can proceed under TDD across multiple iters.

### Findings (2026-05-30 AFK iter)

- **`fixAvailable` reliability**: present on the live `npm audit --json` output under npm 11.x for the transitive brace-expansion vuln. Safe to key reason logic off it, subject to documented npm-version floor in the eventual RFC.
- **Live mislabel confirmed**: `dry-aged-deps --check` reports `brace-expansion` as "vulnerable transitive dependency" (i.e. unfixable) while `npm audit` reports `fixAvailable: true` — exactly the contradictory guidance the ticket Symptoms section calls out.
- **`fixAvailable: true` semantics are nuanced**: in the brace-expansion case it means "fix available via npm parent bump" — overrides cannot reach `node_modules/npm/node_modules/brace-expansion` because npm bundles its own dependencies. A sharpened reason logic will likely need to distinguish at least three classes: (a) fix-via-parent-bump (npm itself can be upgraded), (b) fix-via-overrides-edit (root project can pin), (c) genuinely-unfixable (bundled by an un-upgradeable parent, or no satisfying version exists). The RFC should specify this taxonomy.
- **Override bump bypassed gap #1 surfacing**: because the live `^5.0.6` override is already current, this iter could not validate the "stale override surfaces" path against a real stale pin. The eventual reproduction test should mock a stale override to exercise that path directly rather than relying on the live tree.

### Findings (2026-06-04 AFK iter — substance-confirm-defer)

- **ADR-074 substance-confirm-before-build guard fires.** Gap #2 builds on ADR-0018 (`unfixable` surface). The predicate `wr-architect-is-decision-unconfirmed 0018 docs/decisions` returns exit 0 (`docs/decisions/0018-surface-known-vulnerable-but-unfixable-packages.proposed.md`) — ADR-0018 is born-`proposed` and lacks the `human-oversight: confirmed` marker. Per ADR-074, the AFK iter does NOT implement and does NOT guess.
- **No ADR-0018 amendment exists in the committed file.** Inspection of `docs/decisions/0018-surface-known-vulnerable-but-unfixable-packages.proposed.md` (Confirmation section, lines 113-129) shows **no** `fixAvailable`-aware reason-sharpening criterion. The ticket body's prior note ("gap #2 IS an amendment of ADR-0018 and rides its own confirmation criterion") records direction-intent but is NOT yet a confirmed ADR amendment with `human-oversight: confirmed`. Implementing the three-class taxonomy mechanically would be P315-class build-on-unconfirmed-substance.
- **Substance to confirm** (queued for loop-end Step 2.5 via `outstanding_questions`): the three-class unfixable-reason taxonomy proposed in the 2026-05-30 Findings — (a) `fix-via-parent-bump` / (b) `fix-via-overrides-edit` / (c) `genuinely-unfixable`. The amendment also needs to confirm whether ADR-0018 itself should be transitioned `proposed → accepted` as part of the same amendment commit, or kept `proposed` until the amendment lands. Until the user confirms the substance, `src/find-unfixable-vulns.js` edits are deferred.
- **No work commit beyond the ticket update.** This iter commits the substance-confirm-defer marker + the outstanding-questions entry only. No src/ edits, no ADR amendment draft (drafting the amendment text would itself be a substance choice that is the user's to make).

## Decision (2026-06-04)

User direction at `/wr-itil:work-problems` iter 5 loop-end Step 2.4 gate (a) — closes the ADR-074 substance-confirm-defer from iter 5:

**Three-class unfixable-reason taxonomy confirmed** for the ADR-0018 amendment:

- **(a) `fix-via-parent-bump`** — the vulnerable copy is bundled inside an upgradable parent (e.g. `node_modules/npm/node_modules/brace-expansion`). Overrides cannot reach it. Fix: bump the bundling parent.
- **(b) `fix-via-overrides-edit`** — the vulnerable copy is in the user's tree and reachable via `package.json` `overrides`. Fix: add or update the override pin.
- **(c) `genuinely-unfixable`** — no satisfying version exists yet, or the bundling parent is itself un-upgradable. Fix: wait for upstream patch.

Each class surfaces a different actionable advice string to the user. Aligns with the 2026-05-30 ticket Findings analysis of the live `brace-expansion` case (npm reports `fixAvailable: true`, dry-aged-deps reports "vulnerable transitive dependency" — the mislabel this amendment closes).

Selected alternatives rejected: two-class collapses parent-vs-overrides distinction (loses actionable advice); binary `fixAvailable` passthrough loses human-readable context (essentially what `npm audit` already provides); RFC-first deferral is unnecessary scope inflation — ADR-0018 amendment grain suffices.

**ADR-0018 lifecycle**: open question for the next iter — should the amendment commit transition ADR-0018 `proposed → accepted` in the same change, or keep it `proposed` until the amendment lands? Architect input at next iter dispatch.

**Next iter should** (substance confirmed; ADR-074 substance-confirm gate clears):

1. Draft the ADR-0018 amendment with the three-class taxonomy + Confirmation criterion + the lifecycle-transition decision.
2. Architect review of the draft amendment.
3. TDD: failing test per class against `src/find-unfixable-vulns.js`.
4. Implement the classifier extension — read `npm audit`'s `fixAvailable` field + tree-walk for parent-bundled detection.
5. Document the user-facing reason strings in README.md.
6. Multi-iter ship-signal per CLAUDE.md: chore commits across iters, then a `feat:` commit surfacing the new reason strings in the README "Options" / "What's new" table to trigger semantic-release.

## Fix Strategy

**Direction selected** (AFK loop 2026-05-30 — Option 3 "Both, full scope"): combine both candidate shapes — (1) add a new `overrides-hygiene` module that reads the `overrides` block, ages each pin, and surfaces stale/vulnerable override pins, AND (2) sharpen the "unfixable" reason logic to be `fixAvailable`-aware so override-fixable vulns aren't mislabelled as "vulnerable transitive dependency".

Implementation needs a new RFC (per Investigation Task above) that defines the `overrides-hygiene` module's contract AND amends ADR-0018 to incorporate the `fixAvailable`-aware reason logic. Largest scope of the three candidates.

**RFC scope confirmed** (AFK loop 2026-05-30 Step 2.5 surfacing — user direction): the overrides-hygiene module is a **new RFC/story** (standalone surface with its own RFC, story map, and acceptance criteria) — NOT an extension of ADR-0018. ADR-0018 is the unfixable-surface decision; the overrides-hygiene module is an adjacent new capability with its own product-shape. The `fixAvailable`-aware reason sharpening (gap #2) IS an amendment of ADR-0018 and rides its own confirmation criterion.

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

## RFCs

| RFC     | Status    | Title                    |
| ------- | --------- | ------------------------ |
| RFC-001 | verifying | Overrides Hygiene Module |
