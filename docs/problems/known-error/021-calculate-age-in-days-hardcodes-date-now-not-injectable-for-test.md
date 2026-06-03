# Problem 021: `calculateAgeInDays` hardcodes `Date.now()` — not injectable for testability

**Status**: Known Error
**Reported**: 2026-05-30
**Priority**: 3 (Low) — Impact: Moderate (3) x Likelihood: Rare (1) — implementation already landed; remaining work is the K→V transition
**Origin**: internal
**Effort**: S — single function-signature extension; implementation tasks done
**WSJF**: 6.0 = (3 × 2.0) / 1
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

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [x] Extend `calculateAgeInDays` signature (TDD: failing test injects custom `now` → add parameter)
- [x] Swap inline arithmetic in `src/overrides-hygiene.js` back to helper
- [x] Remove JSDoc divergence comment in `src/overrides-hygiene.js` post-swap

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
