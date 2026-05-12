---
status: 'proposed'
date: 2026-05-12
decision-makers: ['Tom Howard']
consulted: []
informed: []
reassessment-date: 2026-08-12
---

# 0014. `--update` writes the latest-safe version, not the semver-range-satisfying version

## Context and Problem Statement

`dry-aged-deps --update` reads `npm outdated --json`, which reports three versions per outdated package:

- `current` — what is installed in `node_modules`.
- `wanted` — the highest version that satisfies the range declared in `package.json` (`^1.2.0` → highest `1.x`; an exact pin `1.2.0` → `1.2.0`).
- `latest` — the highest version published on the registry, regardless of the range in `package.json`.

`prompts/011.0-DEV-AUTO-UPDATE.md` REQ-SAFE-ONLY says updates target the "latest safe version" filtered by maturity (≥7 days old by default) and security (no vulnerabilities above the configured severity threshold). The phrase is genuinely ambiguous: it could mean "the `latest` column, conditional on passing the filters" or "the `wanted` column, conditional on passing the filters". The current implementation in `src/update-packages.js applyUpdates()` writes the `wanted` column.

For projects whose policy is to pin exactly (no caret, no tilde) — including this repository itself — the consequence is severe: `wanted` equals `current` by construction, so `--update --yes` lists the package in its "will be updated" preview but writes `X → X` to `package.json` (no change). The autonomous workflow defined in ADR-0009 (Scheduled Autonomous Dependency-Update Workflow) short-circuits at the "nothing to commit" branch and never opens a PR.

P001 (`docs/problems/001-update-skips-exact-pinned-deps.known-error.md`) is the originating ticket. `.dry-aged-deps.json` currently excludes `typescript` and `globals` as workarounds — misuse of the exclude feature (`prompts/015.0-DEV-EXCLUDE-PACKAGES.md`) per the project-maintainer JTBD-007 outcome that policy should be reproducible and not carry stale misuse.

ADR-0009 §Confirmation criteria 2 and 7 implicitly presume the second semantic ("`--update --yes` … applies updates … two consecutive successful scheduled runs land their PRs onto `main`"). ADR-0004 (Check Mode for CI/CD Enforcement) requires that "safe updates are available" (exit 1) implies `--update` produces a non-empty diff. Neither ADR records this disambiguation explicitly. This ADR records the decision.

## Decision Drivers

- **Spec-before-code (CLAUDE.md).** The `--update` target version is a policy-bearing choice that affects every downstream consumer of the tool; it should be documented in an ADR before the implementation diverges.
- **Project's stated upgrade policy.** This repository pins exactly and uses `dry-aged-deps` as the upgrade engine. The default behaviour must serve that policy.
- **ADR-0009 contract preservation.** The autonomous workflow's Confirmation criteria 2 and 7 require `--update --yes` to produce a diff when `--check` exits 1.
- **ADR-0004 `--check`/`--update` coherence.** A row that survives `applyFilters()` MUST be applied by `--update`; otherwise `--check` becomes a false positive and the CI gate becomes brittle.
- **Maturity + security filters are the safety gate.** `applyFilters()` rejects rows whose `latest` is below the age threshold OR carries CVEs above the severity threshold. When smart-search runs (`filter-by-security.js trySmartSearchFallback` line 146), it replaces the row's 4th tuple element with the highest mature, vulnerability-free version it could find. By construction, the 4th tuple element of any row that reaches `applyUpdates()` is "the latest version we have proven safe" — exactly the spec's "latest safe version".
- **JTBD-002 / JTBD-104 outcomes.** A single command applies all currently safe updates; the autonomous workflow opens a PR for safe updates without human intervention. Both require `--update` to produce a diff for exact-pinned packages.
- **No-silent-failure rule (CLAUDE.md).** Writing `X → X` to `package.json` is silent failure dressed up as success. The preview line `${name}: ${current} → ${wanted}` actively misleads the user when `wanted === current`.
- **Exclude feature should not be a bug-workaround surface (`prompts/015.0-DEV-EXCLUDE-PACKAGES.md`).** The exclude feature is for ecosystem-blocked packages with documented reasons (e.g. peer-dep constraints, known incompatibility under independent investigation). Using exclude to silence "the tool cannot bump this exact pin" misuses the feature and accumulates noise that hides the underlying defect.

## Considered Options

1. **Write `latest` (4th tuple element, post-filter / post-smart-search) into `package.json`** — the safe target the filters have already proved out.
2. **Write `wanted` (3rd tuple element) into `package.json`** — the current behaviour; stay within the semver range declared in `package.json`.
3. **Make the target configurable via a CLI flag (`--target=latest|wanted`).**
4. **Refuse to update exact-pinned packages and emit a warning** — leave them to manual intervention.

## Decision Outcome

Chosen option: **Write `latest` (4th tuple element, post-filter / post-smart-search) into `package.json`**, because it (a) is the only interpretation consistent with the spec's safety claim — the 4th element is the version the filters have actually validated; (b) restores the contract in ADR-0009 §Confirmation criteria 2 and 7 for exact-pinned projects; (c) makes `--check` and `--update` coherent per ADR-0004; (d) serves the project's own upgrade policy (pin exactly, let `dry-aged-deps` drive bumps) and the maintainer-persona JTBD-002 outcome; and (e) replaces the misleading `X → X` preview with an honest `current → latest` rendering.

### Behaviour after this decision

- `applyUpdates()` writes the 4th tuple element (`latest`) of each `safeRow` into the corresponding `package.json` entry (`dependencies` or `devDependencies`, by `depType`).
- The update-preview line prints `${name}: ${current} → ${latest}` instead of `${current} → ${wanted}`. For non-pinned packages this is identical to `wanted` in the typical case; for exact-pinned packages it is the actual change that will be applied.
- The summary log line "`Updated package.json with N safe packages`" is unchanged.
- The post-update reminder "`Run 'npm install' to install the updates`" is unchanged.
- The package.json output is written as an exact version string (no caret, no tilde). This matches the project's exact-pin policy and the dry-aged-deps trust model: the tool guarantees the specific version is safe, not that future versions of that range will be.

### Interaction with majors

`latest` may cross a semver-major boundary. The tool does not refuse major bumps; `applyFilters()` does not distinguish minor from major. Major-version breakage is caught by the existing `prepush` and `ci-publish.yml` gates per ADR-0009 §Bad consequence "No major-version safety net beyond CI". A package whose major bump is known to be breaking (e.g. `typescript` 5 → 6 pending the ADR-0006 JSDoc compatibility check) should be entered into `.dry-aged-deps.json` `exclude` with a reason that references the operative ADR, not as a workaround for this bug.

### Carving the exclude feature out of bug-workaround usage

`prompts/015.0-DEV-EXCLUDE-PACKAGES.md` describes the exclude feature for packages that genuinely need different handling (peer-dep constraints, deferred majors with documented compatibility concerns, etc.). After this decision, an exclude entry whose only reason is "tool cannot bump this exact pin" is misuse and should be removed at the next `/wr-itil:review-problems` pass. Exclude entries whose reason references a documented architectural concern (e.g. ADR-0006 on a major TypeScript bump) remain legitimate.

### Out of scope

- A `--target=wanted` opt-in flag. The chosen option does not preclude adding it later if a use case emerges; no current persona requires it.
- A separate `--range-preserving` mode that would write `^X.Y.Z` when the source range was `^X.Y.Z`. The project's upgrade policy is "pin exactly"; preserving caret ranges is not a goal.
- Changes to `npm outdated` ingestion or to `buildRows()` tuple shape. The tuple is unchanged; only the index destructured in `applyUpdates()` and in the preview line moves from 2 to 3.

## Consequences

### Good

- **Restores ADR-0009 contract for exact-pinned projects.** The autonomous workflow now produces a diff when `--check` says one exists. Confirmation criteria 2 and 7 become satisfiable.
- **`--check`/`--update` coherence per ADR-0004.** If `--check` exits 1, `--update --yes` produces a real diff.
- **Truthful preview output.** The line `${current} → ${latest}` shows what will actually happen. Removes the silent-failure pattern flagged in CLAUDE.md.
- **Removes need for exclude-list workarounds.** `.dry-aged-deps.json` entries that exist only because `--update` could not bump an exact pin can be lifted at the next `/wr-itil:review-problems` pass.
- **Serves the project's own upgrade policy.** Pin exactly, let `dry-aged-deps` drive bumps. The tool now performs that role for its own dependencies as well as for consumers'.
- **No new CLI surface.** Default behaviour change is contained; no new flag to document or test.

### Neutral

- **The 4th tuple element is now the canonical "target".** Readers of the codebase must remember that `safeRows` contains post-filter / post-smart-search targets in `[3]`, not `[2]`. The tuple shape comment and JSDoc on `buildRows()` already describe this; `applyUpdates()` should make the index choice explicit via its destructuring pattern.
- **Major bumps are no longer blocked by exact pinning.** This is a feature, not a bug, for projects whose policy is "pin exactly and let the soak window + audit gate drive bumps". Breaking changes that survive the soak + audit gates are caught by `prepush` / `ci-publish.yml`.

### Bad

- **Behaviour change for any consumer who relied on `--update` being a no-op on exact pins.** No such consumer is known to exist; the behaviour was a bug rather than a feature. Recorded here for completeness.
- **A user whose package.json uses caret ranges (`^1.2.0`) and who expects `--update` to preserve the caret receives an exact pin instead.** The trade-off is recorded under "Out of scope" above. Adding a range-preserving mode is deferred.
- **Cross-major bumps may land in a single PR.** ADR-0009's Bad consequence already records this; this ADR does not introduce it.

## Confirmation

This decision is implemented when:

1. `src/update-packages.js applyUpdates()` destructures `safeRows` rows so that the 4th element (`latest`) — not the 3rd (`wanted`) — is written into the corresponding `package.json` entry.
2. The update-preview line in `updatePackages()` prints `${name}: ${current} → ${latest}`. The same value (`latest`) is what gets written to `package.json`, so the preview is truthful — no row prints `X → X` unless `current === latest` (which by definition would not survive `applyFilters()` and so cannot reach the preview).
3. A test exercises an exact-pinned package (where `npm outdated` reports `wanted === current` and `latest > current`, mature and vulnerability-free) and asserts that `package.json` receives the `latest` version after `--update --yes`.
4. `prompts/011.0-DEV-AUTO-UPDATE.md` REQ-SAFE-ONLY language is clarified to remove the "latest safe version" ambiguity in line with this ADR.
5. ADR-0009 §Confirmation criteria 2 and 7 can be exercised end-to-end on a project with exact pins (an OIDC end-to-end test remains gated by the ADR-0012 preconditions noted in `.risk-reports/`; this ADR does not require that end-to-end test, only that the local `--update --yes` step now produces a diff).
6. Excluded `.dry-aged-deps.json` entries that exist solely as workarounds for the pre-fix behaviour can be lifted with no functional regression. (The `typescript` entry stays for the independent ADR-0006 5→6 major-bump concern, with its `reason` re-worded to cite ADR-0006 rather than this bug at the next `/wr-itil:review-problems` pass.)

## Pros and Cons of the Options

### Option 1 — Write `latest` (chosen)

- Good: matches the spec intent ("latest safe version") under the only reading consistent with the filter-pipeline output.
- Good: restores ADR-0009's contract for exact-pinned projects.
- Good: makes `--check` and `--update` coherent.
- Good: serves the project's own upgrade policy without needing a config flag.
- Good: removes the misleading `X → X` preview line.
- Bad: behaviour change for any consumer who depended on `--update` being a no-op on exact pins (no such consumer known).
- Bad: caret-range users lose the caret on update (deferred via "Out of scope").

### Option 2 — Keep writing `wanted`

- Good: zero behaviour change.
- Good: caret-range users keep their carets.
- Bad: spec is mis-implemented; "latest safe version" cannot mean "wanted" because the filters validate the `latest` column.
- Bad: ADR-0009's contract is unsatisfiable for exact-pinned projects.
- Bad: `.dry-aged-deps.json` continues to accumulate workaround entries for "tool can't bump this pin".
- Bad: `--check` and `--update` remain incoherent.
- Rejection reason: the entire purpose of the tool is to drive safe bumps; the current behaviour subverts that on the exact-pin-style projects the tool was designed for.

### Option 3 — `--target=latest|wanted` flag

- Good: explicit user choice.
- Good: backwards compatible.
- Bad: adds a CLI surface that has no persona-driven need.
- Bad: defers the policy question instead of resolving it; ADR-0009's workflow has to pick a value anyway.
- Bad: doubles test surface and documentation surface.
- Rejection reason: YAGNI; no persona requires both modes today, and ADR-0009 itself would have to take a side.

### Option 4 — Refuse to update exact-pinned packages

- Good: makes the limitation visible.
- Bad: defeats the entire `--update` UX for projects whose policy is exact pinning.
- Bad: leaves ADR-0009's workflow with no productive path on this repository.
- Rejection reason: incompatible with the project's stated upgrade policy.

## Reassessment Criteria

Reassess this decision when:

1. A caret-range or tilde-range consumer of `dry-aged-deps` files a request to preserve their range characters on update (Option 3 or a new range-preserving mode becomes warranted).
2. A consumer reports a regression caused by `--update` crossing a semver-major boundary that the existing `prepush` / CI gates failed to catch.
3. ADR-0009 changes its expectations of `--update` (e.g. the autonomous workflow moves to a different upgrade engine).
4. Three months from the date on this ADR (2026-08-12) as a default review checkpoint.

## Related Decisions

- **ADR-0009 (Scheduled Autonomous Dependency-Update Workflow).** This ADR records the version-target semantics that ADR-0009 §Confirmation criteria 2 and 7 presume.
- **ADR-0004 (Check Mode for CI/CD Enforcement).** This ADR establishes the `--check`/`--update` coherence that ADR-0004's exit-code contract relies on.
- **ADR-0006 (JSDoc Type Checking).** The TS 5→6 major bump is the kind of concern that justifies an exclude entry in `.dry-aged-deps.json`, not a workaround for THIS bug.
- **ADR-0008 (better-npm-audit for Security Exception Management).** Defines the security-side half of "safe"; this ADR clarifies that the safety claim attaches to the `latest` column.
- **`prompts/011.0-DEV-AUTO-UPDATE.md`.** REQ-SAFE-ONLY language is clarified by this ADR.
- **`prompts/015.0-DEV-EXCLUDE-PACKAGES.md`.** Exclude-feature spec; this ADR explicitly carves the bug-workaround case out of legitimate exclude usage.
- **`docs/problems/001-update-skips-exact-pinned-deps.known-error.md`.** The originating problem ticket.

## References

- `src/update-packages.js` — the fix target.
- `src/build-rows.js` — constructs the `[name, current, wanted, latest, age, depType]` tuple.
- `src/apply-filters.js` — produces `safeRows` whose 4th element is the post-filter target.
- `src/filter-by-security.js` line 146 (`trySmartSearchFallback`) — when smart-search runs, it writes the discovered safe version into the 4th element of the tuple, confirming that the 4th element is the canonical "safe target".
- `.dry-aged-deps.json` — the exclude entries to be reviewed at the next `/wr-itil:review-problems` pass.
