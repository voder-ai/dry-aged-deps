# Problem 004: `@windyroad/tdd` hook only recognises same-dir or `__tests__/` test associations

**Status**: Open
**Reported**: 2026-05-13
**Priority**: 3 (Medium) — Impact: 3 x Likelihood: 1 (deferred — re-rate at next /wr-itil:review-problems)
**Effort**: M (deferred — re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

The `@windyroad/tdd` PreToolUse hook's `tdd_find_test_for_impl()` function (resolved via the plugin cache at `~/.claude/plugins/marketplaces/windyroad/packages/tdd/hooks/lib/tdd-gate.sh`) maps an implementation file to its test by checking two locations only: same-directory (`src/foo.js` → `src/foo.test.js`) and `__tests__/`-adjacent (`src/foo.js` → `src/__tests__/foo.test.js`). It does NOT recognise a `test/`-mirror convention (`src/foo.js` → `test/foo.test.js`), which is the dominant layout in this project (~70 tests under `test/`).

Iter 3 of the 2026-05-13 `/wr-itil:work-problems` session hit this directly: a new test for `src/update-packages.js` was needed to validate the ADR-0014 fix, but the TDD hook (state IDLE) blocked Edits on `src/update-packages.js` until a co-located test existed. Under the AFK "Do NOT call AskUserQuestion mid-loop" constraint, the iter's only path was to create `src/update-packages.test.js` co-located (deviating from the project convention). ADR-0015 records the project-side narrow exception; this ticket captures the upstream gap so the workaround is reversible once the hook supports mirror-directory mapping.

Initial estimate (per capture invocation): Impact 2 (Minor — dev-tooling friction, no CLI behaviour, no CI semantics) × Likelihood 4 (Likely — fires on every new src-module test until upstream lands the fix). Effort S (filing the upstream issue is the project-side task; upstream fix scope is unknown). The placeholder Priority/Effort lines above will be re-rated at next `/wr-itil:review-problems`.

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
- [ ] File the upstream report against `@windyroad/tdd` via `/wr-itil:report-upstream P004`. Suggested framing: add a configurable test-mapping override (e.g. `WR_TDD_TEST_MIRROR=test`) so adopter projects can declare their convention without forking the hook.
- [ ] When upstream lands the fix: relocate `src/update-packages.test.js` → `test/update-packages.test.js`, supersede ADR-0015, transition P004 to `.verifying.md` per ADR-022, then `.closed.md` after a real upstream-fix-exercise.

## Dependencies

- **Blocks**: (none — the project-side ADR-0015 exception is the unblock for this codebase)
- **Blocked by**: upstream `@windyroad/tdd` (capability gap; report-upstream pending)
- **Composes with**: ADR-0015 (the project-side narrow exception this gap drives)

## Related

- **ADR-0015** (`docs/decisions/0015-test-placement-co-location-exception-for-tdd-hook.proposed.md`) — the project-side narrow exception this ticket's upstream gap drives.
- `@windyroad/tdd` plugin — upstream framework code (`tdd_find_test_for_impl()` in `tdd-gate.sh`).
- `src/update-packages.test.js` — the single co-located test under ADR-0015's exception; relocates to `test/` when this ticket closes upstream.
- **Reported upstream**: <https://github.com/windyroad/agent-plugins/issues/123> (2026-05-13)

(captured via /wr-itil:capture-problem; expand at next investigation)

## Reported Upstream

- **URL**: <https://github.com/windyroad/agent-plugins/issues/123>
- **Reported**: 2026-05-13
- **Template used**: problem-report.yml (problem-shaped, matched per ADR-033 classifier)
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes — upstream issue body includes `voder-ai/dry-aged-deps` cross-reference URL and P004 reference per Step 7 contract
