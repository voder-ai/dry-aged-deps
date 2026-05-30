# Problem 020: `@windyroad/tdd` hook stem-match strict matching causes variant-named tests to fail to pair with their source modules

**Status**: Open
**Reported**: 2026-05-30
**Priority**: 3 (Medium) — Impact: 3 x Likelihood: 1 (deferred — re-rate at next /wr-itil:review-problems)
**Origin**: external (`@windyroad/tdd`)
**Effort**: M (deferred — re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

`@windyroad/tdd` hook stem-match strict matching causes variant-named tests to fail to pair with their source modules (e.g. `src/cli-options.unfixable.test.js` does not pair with `src/cli-options.js`) — discovered iter 5 of 2026-05-30 work-problems when RFC-001 T4 wiring required canonical paired test files for `cli-options.js` + `print-outdated.js` + `bin/dry-aged-deps.js`. ADR-0020 (universal co-location) closed the same-dir mapping layer of P004 but not the stem-match strictness layer. Two fix shapes: upstream `tdd_find_test_for_impl` prefix-match extension OR project-level convention requiring canonical `<stem>.test.js` file always exists.

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

## Dependencies

- **Blocks**: (none — workaround per-iter)
- **Blocked by**: upstream `@windyroad/tdd` for durable fix
- **Composes with**: P004 (same-dir mapping gap, closed at project level by ADR-0020); ADR-0020

## Related

- **P004** — sibling upstream gap (same-dir mapping); ADR-0020 closed at project level.
- **ADR-0020** — universal test co-location; closed P004 but not stem-match strictness.
- Iter 5 of 2026-05-30 `/wr-itil:work-problems` — empirical evidence (3 hits in one iter).
- `docs/briefing/hooks-and-gates.md` — workaround captured per-iter.

(captured via /wr-itil:capture-problem; expand at next investigation)
