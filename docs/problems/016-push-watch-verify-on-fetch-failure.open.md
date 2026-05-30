# Problem 016: push:watch declares CI failure on network timeout — should verify with gh run view

**Status**: Open
**Reported**: 2026-05-30
**Priority**: 3 (Medium) — Impact: 3 x Likelihood: 1 (deferred — re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: M (deferred — re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

push:watch declares pipeline failure on api.github.com network read-timeout fetching job details — should verify with `gh run view` before declaring CI failed.

Local fix path (scripts/push-watch.sh).

Evidence: this session's iter 5 — push:watch reported "Pipeline failed" with `failed to get jobs: ... read: operation timed out` after Build & Test + CodeQL + Release jobs were running. `gh run view 26668291165 --json status,conclusion` showed `status:completed conclusion:success` with every job green. Briefing entry (docs/briefing/releases-and-ci.md) has this entry first-written 2026-05-16 noting an earlier instance of the same shape (different error message — `error connecting to api.github.com`); this session's re-occurrence promotes the entry's signal-score to 2. Fix shape: after the watch script's gh API call returns non-zero, fall back to a single `gh run view <run-id> --json status,conclusion` and only declare failed if status=completed AND conclusion=failure. Otherwise warn-and-wait or warn-and-retry.

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

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

(captured via /wr-itil:capture-problem; expand at next investigation)
