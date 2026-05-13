---
status: 'proposed'
date: 2026-05-13
decision-makers: ['Tom Howard']
consulted: []
informed: []
reassessment-date: 2026-08-13
---

# 0015. Test placement: co-location exception for `src/update-packages.test.js`

## Context and Problem Statement

The project's test convention places most test files (~70) under `test/` mirroring the `src/` layout. Iter 3 of the 2026-05-13 `/wr-itil:work-problems` session created `src/update-packages.test.js` co-located beside its impl. The reason was a PreToolUse-hook constraint: `@windyroad/tdd`'s `tdd_find_test_for_impl()` recognises only same-dir or `__tests__/` test-association mappings, not a `test/`-mirror layout. A new test for `src/update-packages.js` therefore cannot satisfy the TDD gate from `test/`; the iter's only path forward (under the "Do NOT call `AskUserQuestion` mid-loop in AFK" constraint) was co-location.

P004 (`docs/problems/004-tdd-hook-only-recognises-same-dir-tests.open.md`) captures the upstream gap for future `/wr-itil:report-upstream` invocation against `@windyroad/tdd`. This ADR records the project-side accommodation while P004 is open.

The decision: how to handle the existing co-located file, and what rule applies to future new tests for `src/` modules?

## Decision Drivers

- **The TDD hook is upstream framework code.** This project doesn't own `@windyroad/tdd`'s test-association logic; we can only file P004 and wait, or work around.
- **Test-discovery is permissive.** Vitest globs (`vitest.config.js`) discover both `test/**/*.test.js` and `src/**/*.test.js`; no test runner reconfiguration is needed for either choice.
- **`test/` convention is well-established.** ~70 test files live there. Relocating them would be high-churn for zero value — the TDD hook's same-dir mapping doesn't fire on tests for files that don't have a TDD-gated state.
- **The exception's blast radius should be bounded.** Only NEW tests for `src/` modules need the carve-out, and only while P004 is open. Broadening to a general "co-location allowed" pattern would survive its trigger, which is policy-creep dressed as documentation.

## Considered Options

1. **Narrow exception**: `src/update-packages.test.js` is the single approved co-located file. Future `src/` tests require fresh approval (open a new ADR or amend this one).
2. **Broad permission**: any future test for a `src/` module MAY co-locate while P004 is open.
3. **Restructure**: move ALL tests to co-locate beside their impls. Resolves the hook constraint everywhere.
4. **Lobby/patch upstream only**: revert `src/update-packages.test.js` to `test/update-packages.test.js`, file P004, and accept that future TDD-gated work on `src/` files is blocked until P004 closes.

## Decision Outcome

Chosen: **Option 1 (narrow exception)** in combination with P004 (Option 4's report-upstream path). The single existing co-located test stays where it is; future tests for `src/` modules require a fresh ADR (or amendment of this one) rather than implicit permission. When P004 closes upstream — i.e. `@windyroad/tdd` gains mirror-directory mapping — the co-located file relocates to `test/update-packages.test.js` and this ADR is superseded.

### Behaviour after this decision

- `src/update-packages.test.js` remains in place. No other `src/**/*.test.js` files exist; their absence is itself the confirmation that the narrow scope holds.
- CLAUDE.md "Test Conventions" gets a short pointer to this ADR for the exception's scope; the section's existing bullets ("Framework: Vitest", "Coverage: 80%", "Traceability", "Mocks") continue to govern test authoring.
- Future PR reviewers who see a new `src/**/*.test.js` should request an amendment or new ADR before approving.
- P004 remains open until upstream lands the fix; closing P004 is the trigger to relocate the co-located file and supersede this ADR.

## Consequences

### Good

- Preserves the `test/` convention for 99% of tests; no churn on the existing 70 files.
- Documents the exception as an architectural decision rather than implicit lore.
- Captures the path back to the convention (P004 → upstream fix → relocate → supersede this ADR) so the exception is genuinely reversible, not permanently entrenched.
- Records the framework-vs-project boundary trade-off in the same shape as ADR-0013 (pre-commit hook read-only) and ADR-0014 (`--update` writes latest-safe).

### Neutral

- The single co-located file introduces one path Vitest must discover (already covered by the existing `vitest.config.js` include glob; no config change required).
- Coverage tooling (`@vitest/coverage-v8` per `vitest.config.js`) sees the co-located test the same as a `test/`-located one; no threshold impact.

### Bad

- One file lives outside the convention until P004 closes upstream OR a future contributor opens an ADR-0015-supersede.
- A future contributor unaware of this ADR could read `src/update-packages.test.js` as precedent for general co-location and accidentally broaden the pattern; the Confirmation criteria below (specifically the "no other `src/**/*.test.js`" check) plus CLAUDE.md's pointer to this ADR are the controls against that drift.

## Confirmation

This decision is implemented when:

1. `docs/problems/004-tdd-hook-only-recognises-same-dir-tests.open.md` exists and is linked from this ADR's References.
2. CLAUDE.md "Test Conventions" section contains a short pointer to this ADR for the exception's scope (e.g. "Test placement — see ADR-0015 for the co-location exception").
3. `src/update-packages.test.js` exists and is the only `src/**/*.test.js` file in the repository. A future audit can verify the narrow scope by `find src -name '*.test.js' | wc -l` returning 1.
4. The exception's reversibility path is preserved: P004 remains open and references this ADR; closing P004 triggers a relocate + supersede pass.

## Pros and Cons of the Options

### Option 1 — Narrow exception (chosen)

- Good: matches the trigger's scope — one file needed the workaround, one file gets the exception.
- Good: preserves the `test/` convention for 99% of tests; zero churn on the existing 70 files.
- Good: pairs naturally with P004 — the exception's reversibility is anchored in a concrete upstream-resolution path.
- Good: documents the framework-vs-project boundary as architectural, following ADR-0013 / ADR-0014 precedent.
- Bad: any future `src/` module that needs a new test will trigger the same friction and require an ADR cycle (re-open this one or open a sibling).
- Bad: the single co-located file is mildly inconsistent with reader expectations after only reading the README or the CLAUDE.md "Test Conventions" section — mitigated by the new CLAUDE.md pointer bullet.

### Option 2 — Broad permission (rejected)

- Good: any future contributor adding a `src/` test would land cleanly without an ADR cycle.
- Good: matches the `@windyroad/tdd` hook's preferred shape directly.
- Bad: outlives its trigger — once P004 closes upstream, "co-location allowed for `src/`" survives the reason it was permitted, becoming permanent policy-creep dressed as documentation.
- Bad: forces the project to maintain two test-discovery conventions long-term (`test/`-mirror plus opportunistic co-location), increasing reader cognitive load.
- Bad: no clear reversibility path — once a sizeable fraction of tests are co-located, the cost of relocating back to `test/` exceeds the cost of leaving the split.
- Rejection reason: the broader permission solves a problem (TDD hook friction) by encoding a permanent stance that won't be revisited when the trigger is fixed.

### Option 3 — Restructure all tests to co-locate (rejected)

- Good: resolves the TDD hook constraint everywhere; uniform structure across the project.
- Good: no exception bookkeeping required.
- Bad: 70 file moves with no functional benefit. Vitest already discovers both layouts; relocating doesn't change runtime behaviour.
- Bad: high commit churn for a transient problem (P004 closure makes the move pointless).
- Bad: forces every existing test's `@supports` traceability + `eslint-plugin-traceability` references through validation pass.
- Rejection reason: pure churn cost without offsetting value; the trigger is upstream-fixable so a coordinated relocate is the wrong intervention.

### Option 4 — Lobby/patch upstream only; revert `src/update-packages.test.js` (rejected)

- Good: maintains the `test/` convention strictly with no exceptions.
- Good: forces the upstream fix on the critical path of any future TDD-gated `src/` work.
- Bad: blocks every future TDD-gated `src/` change until upstream lands the fix. P004's resolution timeline is not within this project's control.
- Bad: the existing 4 RED→GREEN tests for ADR-0014 (in `src/update-packages.test.js`) would have to be relocated immediately; iter 3's coverage would degrade momentarily.
- Bad: the `--update` fix is already shipped (v2.7.1); reverting the test placement without the upstream fix means the next TDD-gated work on `src/update-packages.js` re-hits the same wall and re-opens this exact decision.
- Rejection reason: pure-upstream blocks the project on an external dependency; the narrow exception keeps forward progress while preserving the path back.

## Reassessment Criteria

Reassess this decision when:

1. **P004 resolves upstream** — `@windyroad/tdd` gains mirror-directory mapping (or equivalent configuration). The path forward is: relocate `src/update-packages.test.js` → `test/update-packages.test.js`, supersede this ADR, close P004.
2. **Another `src/` module gains a new test requiring the same workaround** — open a new ADR (or amend this one) to record either (a) a second narrow exception or (b) an explicit decision to broaden to Option 2's framing. Don't silently expand the narrow scope.
3. **Three months from the date on this ADR (2026-08-13)** as a default review checkpoint.

## Related Decisions

- **ADR-0011** (ADR Format and Lifecycle Convention) — governs the MADR 4.0 shape this ADR uses.
- **ADR-0013** (Pre-commit Hook Read-Only Policy) — precedent for framework-vs-project boundary decisions captured as ADRs at this scope.
- **ADR-0014** (`--update` writes latest-safe, not wanted) — precedent for P-ticket-linked decisions captured as ADRs at this scope.

## References

- `docs/problems/004-tdd-hook-only-recognises-same-dir-tests.open.md` — the upstream report ticket capturing the TDD-hook gap.
- `src/update-packages.test.js` — the single approved co-located test.
- `CLAUDE.md` Test Conventions section — gets a short pointer to this ADR.
- `@windyroad/tdd` plugin's `tdd_find_test_for_impl()` function — the upstream code whose mapping limitation drives this exception.
- `vitest.config.js` — Vitest's test-discovery globs (cover both `test/**` and `src/**`; no change required by this ADR).
