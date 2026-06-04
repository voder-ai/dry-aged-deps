# Problem 021: `calculateAgeInDays` hardcodes `Date.now()` — not injectable for testability

**Status**: Verification Pending
**Reported**: 2026-05-30
**Released**: 2026-06-02 (commit `dc64c44`)
**Priority**: 3 (Low) — Impact: Moderate (3) x Likelihood: Rare (1) — fix shipped; awaiting user confirmation that the production behaviour matches the fix intent
**Origin**: internal
**Effort**: S — single function-signature extension; implementation tasks done
**WSJF**: 0 (Verification Pending — ADR-022 multiplier 0; surfaced in Verification Queue not WSJF Rankings)
**Type**: technical

## Description

`src/age-calculator.js`'s `calculateAgeInDays(publishDate)` hardcodes `Date.now()` with no way to inject a deterministic reference time for testing. The function is the canonical age-calculation primitive used by `buildRows()` (production) and should be the same primitive used by `runOverridesHygiene()` (RFC-001).

Iter 3 of 2026-05-30 `/wr-itil:work-problems` (RFC-001 T3) hit this when implementing `src/overrides-hygiene.js`. The test fixture (`src/overrides-hygiene.test.js`) injects a deterministic `now` via the function parameter so age assertions are stable. Without an injectable clock on `calculateAgeInDays`, T3 inlined the same arithmetic — `Math.floor((now - publishMs) / 86400000)` — under an explicit JSDoc divergence comment. The architect's PASS-WITH-NOTES verdict flagged this as note 1.

Fix shape: extend the signature to `calculateAgeInDays(publishDate, now = Date.now())`; default-argument shape preserves backwards compatibility for the existing `buildRows()` consumer. Then `src/overrides-hygiene.js` swaps inline arithmetic back to the helper.

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

- [x] Re-rate Priority and Effort at next /wr-itil:review-problems
- [x] Extend `calculateAgeInDays` signature (TDD: failing test injects custom `now` → add parameter)
- [x] Swap inline arithmetic in `src/overrides-hygiene.js` back to helper
- [x] Remove JSDoc divergence comment in `src/overrides-hygiene.js` post-swap

## Fix Released

Shipped 2026-06-02 in commit [`dc64c44`](../../../commit/dc64c44) `fix(age-calculator): accept optional now parameter for testability`. Released to npm as part of RFC-001 + subsequent RFC-002 ship-trains. Three coordinated changes:

1. **Signature extension** — `src/age-calculator.js` extended from `calculateAgeInDays(publishDate)` to `calculateAgeInDays(publishDate, now = Date.now())`. Default-argument shape preserves backwards compatibility for all 30+ existing single-arg consumers (`buildRows`, `security-smart-search`, etc.); `src/age-calculator.test.js` extended with a deterministic-`now` regression case.
2. **Overrides-hygiene swap-back** — `src/overrides-hygiene.js` no longer inlines `Math.floor((now.getTime() - publishMs) / MS_PER_DAY)` with a local `MS_PER_DAY` constant + `computeAgeDays` helper; it calls `calculateAgeInDays(publishDate, now.getTime())` directly. The local `MS_PER_DAY` constant + local `computeAgeDays` helper were removed.
3. **JSDoc divergence comment removal** — the inline-arithmetic divergence comment block introduced by RFC-001 T3 as a temporary workaround was removed from `src/overrides-hygiene.js` in the same commit. `docs/api.md` and `docs/architecture.md` were updated to reflect the new `(publishDate, now?)` signature.

Closure-via: architect's PASS-WITH-NOTES verdict on RFC-001 T3 flagged the inline-arithmetic divergence as note 1; this ticket was captured to track the swap-back point. The swap-back landed in `dc64c44` and is now reachable in published artifacts via the RFC-001 and RFC-002 release trains.

Awaiting user verification: next call into `runOverridesHygiene()` (production code path) should produce identical age math to the test fixture's deterministic-`now` injection — the swap-back is structural (same arithmetic, same primitive), so this is a "no observed regression" verification rather than a behavioural change.

## Dependencies

- **Blocks**: none (inline workaround in overrides-hygiene works correctly)
- **Blocked by**: nothing
- **Composes with**: RFC-001 T4/T5 (natural swap-back point); RFC-002 (will need same injectable-clock primitive)

## Related

- `src/age-calculator.js` — function to extend.
- `src/overrides-hygiene.js` — inline workaround pending extension.
- `src/overrides-hygiene.test.js` — fixture that drove the discovery.
- RFC-001 T4/T5 — swap-back point.
- Iter 3 of 2026-05-30 `/wr-itil:work-problems` — architect note 1 in commit `45340db` body.

(captured via /wr-itil:capture-problem; expand at next investigation)
