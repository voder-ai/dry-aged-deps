# Problem 020: `@windyroad/tdd` hook stem-match strict matching causes variant-named tests to fail to pair with their source modules

**Status**: Known Error
**Reported**: 2026-05-30
**Priority**: 3 (Low) — Impact: Moderate (3) x Likelihood: Rare (1) — ADR-0020 canonical-pair workaround in place; the strictness gap only fires when a source module gains variant-only tests with no canonical `<stem>.test.js`
**Origin**: external (`@windyroad/tdd`)
**Effort**: M — upstream `@windyroad/tdd` hook stem-match relaxation for the durable fix. Re-rated at the Known-Error transition (2026-07-11): held at M — the durable fix is a glob relaxation in one upstream file (`hooks/lib/tdd-gate.sh`), but a zero-code project-side workaround (canonical `<stem>.test.js` per module, per ADR-0020) already fully mitigates and is now applied to the lone live gap (`src/build-rows.js`).
**WSJF**: 3.0 = (3 × 2.0) / 2
**Type**: technical

## Description

`@windyroad/tdd` hook stem-match strict matching causes variant-named tests to fail to pair with their source modules (e.g. `src/build-rows.additional.test.js` does not pair with `src/build-rows.js`) — discovered iter 5 of 2026-05-30 work-problems when RFC-001 T4 wiring required canonical paired test files for `cli-options.js` + `print-outdated.js` + `bin/dry-aged-deps.js`. ADR-0020 (universal co-location) closed the same-dir mapping layer of P004 but not the stem-match strictness layer: co-location is necessary but **not sufficient** — the hook additionally requires a canonical `<stem>.test.js` file to exist. Two fix shapes: upstream `tdd_find_test_for_impl` glob relaxation (durable, upstream-blocked) OR project-level convention requiring a canonical `<stem>.test.js` file always exists (workaround, ADR-0020, now applied).

## Symptoms

- A source module whose tests are ALL variant-named (`src/foo.<variant>.test.js`) with no canonical `src/foo.test.js` is associated with NO test by the TDD hook — `tdd_find_test_for_impl` returns empty.
- TDD-gated edits to that source module hit the enforce-edit deny (`no tests written for this file yet. TDD state is IDLE`) even though comprehensive variant tests exist and pass under vitest.
- vitest still discovers and runs the variant tests (its default tree scan is unaffected); only the TDD hook's per-module association fails.

## Workaround

ADR-0020 (universal co-location) + a canonical `<stem>.test.js` per module. Every `src/foo.js` with paired tests keeps at least one file named exactly `src/foo.test.js` (the hook's `${STEM}.test.*` glob matches it); additional edge-case suites use `src/foo.<variant>.test.js`. When a module has only variant suites, rename the primary suite to the canonical name (`git mv src/foo.success.test.js src/foo.test.js`).

Applied 2026-07-11: `src/build-rows.js` was the only module in the repo with variant-only tests and no canonical pair; its happy-path suite was renamed `src/build-rows.success.test.js` → `src/build-rows.test.js` so the hook associates it.

## Impact Assessment

- **Who is affected**: the maintainer/agent making TDD-gated edits to a `src/` module whose tests are all variant-named.
- **Frequency**: Rare — fires only when a new source module gains variant-only tests without a canonical `<stem>.test.js`. One live instance found and fixed (`build-rows.js`); no others in the repo.
- **Severity**: Low — bounded by a reliable, zero-code project-side workaround (ADR-0020 canonical-pair convention); no data loss; vitest coverage unaffected.
- **Analytics**: N/A (governance-tooling friction, not a product-analytics surface).

## Root Cause Analysis

The TDD hook associates a source module with a test only by an exact single-segment infix glob on the module stem. It does not treat variant-named test files (extra `.variant.` segment between stem and `.test.`) as paired.

### Confirmed against upstream source (2026-07-11)

Root cause confirmed by reading the installed upstream helper (latest version, carries the defect):

- `~/.claude/plugins/cache/windyroad/wr-tdd/0.4.7/hooks/lib/tdd-gate.sh` — `tdd_find_test_for_impl()` (lines ~132–229).

The impl stem is derived by stripping only the final extension:

```bash
case "$BASENAME" in
  *.js)  STEM="${BASENAME%.js}";  EXT="js" ;;
  # ...
esac
```

so for `src/build-rows.js`, `STEM="build-rows"`. Every association branch (same-dir, `__tests__/`, parent-`__tests__`, `test/`-mirror per P201) matches a tracked test only via:

```bash
case "$tracked_base" in
  "${STEM}.test."*|"${STEM}.spec."*) echo "$tracked"; return ;;
esac
```

The glob `build-rows.test.*` does NOT match `build-rows.additional.test.js` (nor `.success.`, `.fetchError.`, etc.) — the extra `.additional.` segment sits between the stem and `.test.`, outside the fixed infix. So a variant-only test set never satisfies the glob and the source module pairs with no test.

**Reproduction** (runnable — the exact glob the hook uses):

```bash
STEM="build-rows"
for tracked_base in build-rows.test.js build-rows.success.test.js; do
  case "$tracked_base" in
    "${STEM}.test."*|"${STEM}.spec."*) echo "MATCH:   $tracked_base" ;;
    *)                                  echo "NO MATCH: $tracked_base" ;;
  esac
done
# => MATCH:   build-rows.test.js
# => NO MATCH: build-rows.success.test.js
```

This is external/upstream root cause: the glob lives in `@windyroad/tdd`, not this repo. The durable fix (relax the glob to accept a `.variant.` segment, or match `${STEM}.*.test.` in addition to `${STEM}.test.`) is upstream-blocked. The project-side workaround (ADR-0020 canonical-pair) fully mitigates and requires no upstream change.

### Investigation Tasks

- [x] Re-rate Priority and Effort at next /wr-itil:review-problems — re-rated at Known-Error transition: Impact 3 × Likelihood 1, Effort M, WSJF 3.0 (Known-Error multiplier).
- [x] Investigate root cause — **confirmed** against `hooks/lib/tdd-gate.sh` `tdd_find_test_for_impl()`; the `${STEM}.test.*` / `${STEM}.spec.*` glob rejects any `.variant.`-infixed test (see "Confirmed against upstream source" above).
- [x] Create reproduction test — the runnable glob reproduction above demonstrates the mismatch deterministically without depending on the external hook's session state.
- [x] Apply the project-side workaround to the lone live instance — `git mv src/build-rows.success.test.js src/build-rows.test.js`.
- [ ] Report upstream against `@windyroad/tdd` — deferred; see `- **Upstream report pending**` marker in `## Related`.

## Fix Strategy

- **Durable (upstream, blocked)**: relax `tdd_find_test_for_impl()`'s association glob in `@windyroad/tdd`'s `hooks/lib/tdd-gate.sh` to also accept variant-infixed tests (`${STEM}.*.test.` / `${STEM}.*.spec.`) so a module with only variant suites still pairs. Tracked as the upstream report below.
- **Project-side (workaround, applied)**: ADR-0020 universal co-location plus the invariant "every `src/foo.js` with paired tests keeps a canonical `src/foo.test.js`". Applied 2026-07-11 to the one gap (`build-rows.js`). The fix-proposal RFC (per ADR-072) is deferred until the upstream report has a response — the workaround holds and no project-side code fix is pending.

## Dependencies

- **Blocks**: (none — workaround per-module)
- **Blocked by**: upstream `@windyroad/tdd` for the durable glob relaxation
- **Composes with**: P004 (same-dir mapping gap, closed at project level by ADR-0020); ADR-0020

## Related

- **P004** — sibling upstream gap (same-dir mapping); ADR-0020 closed at project level.
- **ADR-0020** — universal test co-location; closed P004 but not stem-match strictness. This ticket documents the residual stem-match layer and the canonical-`<stem>.test.js` invariant that completes the workaround.
- Iter 5 of 2026-05-30 `/wr-itil:work-problems` — empirical evidence (3 hits in one iter).
- `docs/briefing/hooks-and-gates.md` — workaround captured per-iter.
- **Upstream report pending** -- external dependency identified; invoke /wr-itil:report-upstream when ready. Deferred at the 2026-07-11 Open→Known-Error transition: filing a public issue against `@windyroad/tdd` is outward-facing and was not auto-fired in the AFK loop (orchestrator owns external-comms cadence). Upstream target: `@windyroad/tdd`, `hooks/lib/tdd-gate.sh` `tdd_find_test_for_impl()`.

(captured via /wr-itil:capture-problem; expanded + transitioned to Known Error 2026-07-11)
