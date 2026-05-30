# Problem 016: push:watch declares CI failure on network timeout — should verify with gh run view

**Status**: Open
**Reported**: 2026-05-30
**Priority**: 6 (Medium) — Impact: Minor (2) x Likelihood: Possible (3)
**Origin**: internal
**Effort**: S — single shell-script edit at `scripts/push-watch.sh` (network-flake fallback to `gh run view`) + bounded-retry block + test
**WSJF**: 6.0 = (6 × 1.0) / 1
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

- [x] Re-rate Priority and Effort at next /wr-itil:review-problems (2026-05-30: Impact 2 × Likelihood 3 = 6 (Medium), Effort S — single shell-script edit + bounded-retry block + test; root cause + fix shape already documented in Fix Strategy, kept Open pending implementation)
- [ ] Investigate root cause
- [ ] Create reproduction test

## Fix Strategy

**Kind**: improve. **Shape**: shell script.

**Target file**: `scripts/push-watch.sh`.

**Observed flaw**: when the GitHub API call to fetch job details returns `read: operation timed out` (or any non-200 / connectivity error) mid-poll, the script declares `Pipeline failed` and exits non-zero — even when the underlying CI run actually completed successfully. Conflates network flakes with real CI failures; would halt an unattended AFK loop unnecessarily.

**Edit summary**: after the watch script's gh API call returns non-zero AND the failure message matches a network-flake pattern (`error connecting`, `read: operation timed out`, similar), fall back to a single `gh run view <run-id> --json status,conclusion` and only declare failed if `status=completed AND conclusion=failure`. Otherwise warn-and-retry the watch (bounded retries, e.g. 3 attempts with 30s backoff) before declaring failure. Routing target: this project's own `scripts/push-watch.sh` (no skill routing — local shell-script edit).

**Evidence**:

- This session iter 5 — final push of the AFK work-problems loop. `failed to get jobs: ... read: operation timed out`. `gh run view 26668291165 --json status,conclusion` returned `status:completed conclusion:success`; every job was green.
- `docs/briefing/releases-and-ci.md` entry first-written 2026-05-16 noting an earlier instance (`error connecting to api.github.com`); re-occurrence this session promotes signal-score to 2.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

(captured via /wr-itil:capture-problem; expand at next investigation)
