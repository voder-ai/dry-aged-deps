---
status: 'proposed'
date: 2026-05-30
decision-makers: ['Tom Howard']
consulted: []
informed: []
reassessment-date: 2026-08-30
supersedes: '0015-test-placement-co-location-exception-for-tdd-hook'
---

# 0020. Test placement: co-locate paired tests beside their `src/` module

## Context and Problem Statement

The project's prior convention placed test files (~55 paired tests) under `test/` mirroring the `src/` layout, with ADR-0015 carving out narrow exceptions for individual `src/` modules whose TDD workflow needed co-located tests. ADR-0015's own §Reassessment 2 named the third-trigger event as the natural moment to escalate the narrow-exception pattern.

The third trigger fired empirically in iter 4 of the 2026-05-30 `/wr-itil:work-problems` AFK loop. RFC-001 T4 (wire `runOverridesHygiene` into the CLI pipeline) needed to edit three more `src/` modules — `src/cli-options.js`, `src/load-package-json.js`, `src/print-outdated.js`. Each would have required a fresh narrow ADR exception under the ADR-0015 framing. The TDD-gate friction at the third trigger crossed the threshold ADR-0015 documented as the forcing function.

User direction 2026-05-30 chose ADR-0015's previously-rejected Option 3 (restructure all paired tests to co-locate). This ADR records the new convention and supersedes ADR-0015.

## Decision Drivers

- **The TDD enforcement hook (`@windyroad/tdd`'s `tdd_find_test_for_impl()`) recognises only same-directory or `__tests__/` test association.** A `test/` mirror is invisible to the hook regardless of file existence — every TDD-gated edit on `src/` requires either the test co-located or a per-file ADR exception.
- **Per-file ADR ceremony has empirical cost.** Two amendments to ADR-0015 (2026-05-13 + 2026-05-30) plus the third trigger producing three more candidate files revealed that the narrow-exception pattern compounds friction faster than the upstream gap (P004) resolves.
- **Test-discovery is layout-permissive.** `vitest.config.js` sets no `include` glob, so vitest scans both `test/**` and `src/**` for `*.test.js` patterns — no runner config change required by either convention.
- **CLI integration / e2e tests do NOT pair with a single `src/` module.** They span the whole CLI and live outside the TDD hook's per-source gate. Relocating them would be pure churn without value.
- **The new convention satisfies the upstream tool's expectation directly.** Co-located tests are the shape `@windyroad/tdd` was designed for; the project moves into alignment rather than working around.

## Considered Options

1. **Adopt co-location universally for paired tests (chosen)** — every `src/foo.js` module that has paired tests has them at `src/foo*.test.js`. CLI integration / e2e tests stay in `test/`. No per-file ADR ceremony.
2. **Continue narrow-exception per file** — add three more narrow ADR amendments for T4's needs; continue accumulating exceptions as new src/ modules are added.
3. **Move into `src/__tests__/` subdirs** — React/Jest convention; the TDD hook recognises this pattern. Trade-off: heavier directory pattern but keeps `src/` clean of `*.test.js` files.
4. **Block all TDD-gated `src/` work until P004 closes upstream** — strict adherence to the original `test/` mirror with no exceptions, accepting that no `src/` module can be edited until upstream `@windyroad/tdd` lands the mirror-directory mapping.

## Decision Outcome

Chosen: **Option 1 (universal co-location for paired tests)**.

### Behaviour after this decision

- Every `src/foo.js` module that has paired tests has them at `src/foo*.test.js` (the existing pattern `src/update-packages.*.test.js` and `src/overrides-hygiene.test.js` already use).
- CLI integration / e2e tests + cross-cutting tests (the ~24 files matching `test/cli.*.test.js`, `test/cli-entrypoint.test.js`, `test/formatters.unfixable.test.js`, `test/functional-assessment.test.js`, `test/husky-pre-commit.test.js`, `test/lint-security.test.js`, `test/push-watch.*.test.js`, `test/run-with-timeout.test.js`) remain in `test/` because they don't pair with a single `src/` module.
- CLAUDE.md "Test Conventions" section updated to describe the new convention and the orphan-set carve-out; the pointer to ADR-0015 is replaced with a pointer to this ADR.
- `docs/problems/004-*` remains open as an upstream report — the gap still affects other adopters even though this project no longer needs the project-side workaround.

### One-time relocation cost

The landing commit relocates ~55 paired test files from `test/` → `src/` via `git mv` (preserves history). Each moved file gets its import paths flipped from `'../src/foo.js'` → `'./foo.js'`. No test-runner config change. The change is content-equivalent: vitest discovers and runs the same set; coverage thresholds unchanged; eslint-plugin-traceability validates the same `@supports` annotations.

## Consequences

### Good

- **Eliminates per-file ADR ceremony for any future `src/` test.** No more amendments when a new module gains tests.
- **Aligns with the upstream tool's design.** `@windyroad/tdd`'s same-directory lookup is universally satisfied; TDD-gated work on any `src/` module proceeds without workaround.
- **Removes a structural blocker for RFC-001 T4 onwards.** The forcing function that drove this change is resolved at the structural level.
- **Reduces cognitive load.** One convention rather than "test/ except these N narrow exceptions" — readers don't need to track the exception list.

### Neutral

- Vitest discovers tests from both layouts equally; no runner reconfiguration.
- Coverage tooling (`@vitest/coverage-v8`) discovers sources from imports, not paths; no threshold impact.
- `eslint-plugin-traceability` validates `@supports` annotation content, not file location; annotations carry through unchanged.

### Bad

- **One-time history-blame divergence on import-path lines.** `git mv` preserves history for the file as a whole, but the import-path edits (`'../src/foo.js'` → `'./foo.js'`) on the moved files show up as content modifications; `git blame` on those specific lines will point at the relocation commit rather than the original test author.
- **CLI integration / e2e tests stay in `test/`.** The project now has tests in two locations (paired tests in `src/`, integration tests in `test/`). Readers need to understand the orphan-set carve-out. This is a Neutral-trending-Bad trade-off: the alternative (relocating everything) would be pure churn for the integration tests, but the split convention does require a docs explanation.
- **ADR-0011 lifecycle convention gap exposed.** ADR-0011's `accepted → superseded` text does not anticipate this ADR's `proposed → superseded` transition for ADR-0015. The first-attempted-transition signal that ADR-0011 §Reassessment #4 anticipates is exercised here; consider a follow-up ADR-0011 amendment to cover the `proposed → superseded` path explicitly.

## Confirmation

This decision is implemented when:

1. ADR-0015 is renamed to `.superseded.md` with `superseded-by: 0020-test-placement-co-locate-with-src-module` in its frontmatter and a "Superseded by ADR-0020" note at the top of its `## Context and Problem Statement`.
2. Every `src/**/*.js` module that has paired tests has them at `src/<module>*.test.js`. The list-shape Confirmation criterion that ADR-0015 used (enumerate the N co-located files) is intentionally NOT repeated — that pattern proved brittle. The shape rule is: "paired tests beside their module."
3. CLI integration / e2e tests remain under `test/` (positive carve-out: `test/cli.*.test.js`, `test/cli-entrypoint.test.js`, `test/formatters.unfixable.test.js`, `test/functional-assessment.test.js`, `test/husky-pre-commit.test.js`, `test/lint-security.test.js`, `test/push-watch.*.test.js`, `test/run-with-timeout.test.js`).
4. CLAUDE.md "Test Conventions" section references this ADR (not ADR-0015) for test-placement guidance.
5. `npm test` passes after relocation; coverage threshold (80%) preserved.
6. `docs/problems/004-tdd-hook-only-recognises-same-dir-tests.*.md` carries a disposition note: "This project no longer needs the workaround under ADR-0020 (universal co-location); P004 remains open as an upstream report because the gap still affects other adopters."

## Pros and Cons of the Options

### Option 1 — Universal co-location for paired tests (chosen)

- Good: eliminates per-file ADR ceremony; aligns with the upstream tool's design; resolves the structural blocker at the source.
- Good: reduces convention complexity from "test/ except N exceptions" to "co-locate paired; integration stays in test/".
- Bad: one-time relocation cost (~55 files moved); split-convention requires a docs explanation for integration-test placement.

### Option 2 — Continue narrow-exception per file (rejected)

- Good: preserves the existing test/ convention for non-exceptional files.
- Bad: ADR-0015's documented third-trigger forcing function fired empirically; continuing means ~3 more ADR amendments NOW (for T4) plus an unbounded number more as the project grows. The compounding friction is the rejection signal.
- Bad: each amendment requires architect review + commit cycle; the per-trigger cost is now empirically known to exceed the one-time relocation cost.

### Option 3 — `src/__tests__/` subdirs (rejected)

- Good: keeps `src/` directory listing free of `*.test.js` files; matches React/Jest convention.
- Bad: introduces a directory pattern the project doesn't otherwise use; readers expect the React/Jest pattern under TypeScript/JSX trees, not vanilla Node ES Modules.
- Bad: every `src/foo/` would need an `__tests__/` subdir for one or two files; directory inflation outpaces the listing-cleanliness benefit.
- Rejection reason: solves a real concern (listing cleanliness) with a pattern that imports unrelated framework conventions.

### Option 4 — Block all TDD-gated `src/` work until P004 closes upstream (rejected)

- Good: maintains the original `test/` convention strictly.
- Good: forces the upstream fix on the critical path of any future TDD-gated work.
- Bad: blocks every TDD-gated `src/` change on an external resolution timeline outside this project's control.
- Bad: would have blocked iter 3 of the 2026-05-30 AFK loop entirely (RFC-001 T3) and continues to block T4 onwards. The forcing function would be backlog stagnation, not the empirical evidence the user wanted.
- Rejection reason: pure-upstream blocks the project on an external dependency that does not have a known resolution timeline.

## Reassessment Criteria

Reassess this decision when:

1. **`@windyroad/tdd` adds mirror-directory test-association** (P004 closes upstream) — at that point, both conventions work. Reassess whether to keep co-location or move back to the `test/` mirror. Recommend keeping co-location: the conventions are layout-equivalent for vitest, and reverting would re-incur the relocation cost.
2. **`src/` directory listing becomes a navigation burden** — empirical signal that the doubled `*.test.js` files in `src/` are slowing source-file discovery. The fix is Option 3 (`src/__tests__/` subdirs); revisit at that point.
3. **Three months from this ADR's date (2026-08-30)** as a default review checkpoint.

## Related Decisions

- **ADR-0011** (ADR Format and Lifecycle Convention) — governs the MADR 4.0 shape this ADR uses. This ADR's supersession of ADR-0015 exercises the `proposed → superseded` path that ADR-0011's §Lifecycle Transitions does not explicitly anticipate; the gap should be addressed in a follow-up ADR-0011 amendment.
- **ADR-0015** (Test placement: co-location exception for the TDD hook) — superseded by this ADR. The narrow-exception framing it carried is replaced by universal co-location.
- **ADR-0013** (Pre-commit Hook Read-Only Policy) — precedent for framework-vs-project boundary decisions.
- **ADR-0016** (Pre-commit hook auto-write + re-stage) — supersession precedent (ADR-0013 → ADR-0016).
- **ADR-0019** (Adopt the Problem-RFC-Story framework) — the framework whose RFC-001 T4 trigger surfaced the forcing function this ADR resolves.

## References

- `docs/problems/004-tdd-hook-only-recognises-same-dir-tests.parked.md` — the upstream report ticket; remains open per Confirmation criterion 6.
- `docs/rfcs/RFC-001-overrides-hygiene-module.in-progress.md` — the in-flight RFC whose T4 task surfaced the third-trigger forcing function.
- `CLAUDE.md` Test Conventions section — updated to reference this ADR.
- `@windyroad/tdd` plugin's `tdd_find_test_for_impl()` function — the upstream code whose mapping behaviour drives the convention choice.
- `vitest.config.js` — no change required (default tree scan covers both layouts).
- Iter 4 of `/wr-itil:work-problems` 2026-05-30 — the AFK iter whose ITERATION_SUMMARY surfaced the third-trigger forcing function as a `category: direction` outstanding question.
