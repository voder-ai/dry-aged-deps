# Problem 016: push:watch declares CI failure on network timeout — should verify with gh run view

**Status**: Closed
**Reported**: 2026-05-30
**Closed**: 2026-06-03 — verified at /wr-itil:review-problems Step 4; user confirmed push:watch has run cleanly across multiple pushes since the fix shipped (RFC-002 ship today + prior releases) with no false-positive "Pipeline failed" reports on healthy CI runs.
**Priority**: 6 (Medium) — Impact: Minor (2) x Likelihood: Possible (3)
**Origin**: internal
**Effort**: S — single shell-script edit at `scripts/push-watch.sh` (network-flake fallback to `gh run view`) + bounded-retry block + test
**WSJF**: 6.0 = (6 × 1.0) / 1
**Type**: technical

## Fix Released

Released in the next dry-aged-deps semver-release. `scripts/push-watch.sh` step 5 wraps `gh run watch --exit-status` in a bounded retry loop (`WATCH_ATTEMPTS=3`, `WATCH_BACKOFF=30`). When watch returns non-zero, the script verifies the actual run state via `gh run view "$RUN_ID" --json status,conclusion` and only declares failure on `status=completed AND conclusion=failure`. A `status=completed AND conclusion=success` outcome treats the watch as a transient observation flake and breaks out of the loop with success. Any other non-terminal state retries after the backoff; exhausted attempts declare "Pipeline state unverifiable" and fail loud.

Exercise evidence in the releasing session: `test/push-watch.network-flake-fallback.test.js` (3 / 3 passing) covers the three structural contract slots — (a) the script queries both `gh run view --json status` and `--json conclusion` after a failed watch, (b) only the `status=completed AND conclusion=failure` combination declares failure, (c) the bounded retry exposes `WATCH_ATTEMPTS`, `WATCH_BACKOFF`, and a `sleep "$WATCH_BACKOFF"` step. Full vitest suite passes (264 / 264) with coverage 90.84 % (above the 80 % threshold). The pre-existing `test/push-watch.script-contract.test.js` (P002 release-trigger heuristic) still passes — the network-flake guard composes cleanly with the existing pre-push-remote-capture contract.

Awaiting user verification — the next AFK loop's iter that exits via `npm run push:watch` exercises the new path; success without a "Pipeline failed" false-positive (or a "Pipeline state unverifiable" loud-fail when the watch genuinely can't reach api.github.com) confirms the fix in production.

## Description

push:watch declares pipeline failure on api.github.com network read-timeout fetching job details — should verify with `gh run view` before declaring CI failed.

Local fix path (scripts/push-watch.sh).

Evidence: this session's iter 5 — push:watch reported "Pipeline failed" with `failed to get jobs: ... read: operation timed out` after Build & Test + CodeQL + Release jobs were running. `gh run view 26668291165 --json status,conclusion` showed `status:completed conclusion:success` with every job green. Briefing entry (docs/briefing/releases-and-ci.md) has this entry first-written 2026-05-16 noting an earlier instance of the same shape (different error message — `error connecting to api.github.com`); this session's re-occurrence promotes the entry's signal-score to 2. Fix shape: after the watch script's gh API call returns non-zero, fall back to a single `gh run view <run-id> --json status,conclusion` and only declare failed if status=completed AND conclusion=failure. Otherwise warn-and-wait or warn-and-retry.

## Symptoms

- `npm run push:watch` exits non-zero with `failed to get jobs: ... read: operation timed out` (or `error connecting to api.github.com`) while the actual CI run is still healthy.
- `show_failure_guidance` prints the "Failed checks" section but the per-job query returns empty because the run hasn't completed; the maintainer is left to verify state by hand via `gh run view <run-id> --json status,conclusion`.
- AFK orchestrators that wrap `push:watch` see the non-zero exit as a real CI failure and halt the queue even when the pipeline is green.

## Workaround

Manually re-verify with `gh run view <run-id> --json status,conclusion` after `npm run push:watch` declares failure; if `status=completed AND conclusion=success`, treat the watch failure as a network flake and proceed.

## Impact Assessment

- **Who is affected**: project maintainer and any AFK orchestrator that wraps `npm run push:watch` (per `docs/jtbd/project-maintainer/persona.md` — time-scarce maintainer cannot absorb false-positive halts).
- **Frequency**: observed twice in this session (iter 5 of 2026-05-30 AFK loop; earlier instance logged 2026-05-16 in `docs/briefing/releases-and-ci.md` — signal-score 2).
- **Severity**: Minor — friction-only; no correctness risk to the published tool, but breaks the unattended-push contract.
- **Analytics**: count of `failed to get jobs` / `read: operation timed out` lines in `push:watch` output across AFK orchestrator runs is the proxy.

## Root Cause Analysis

### Investigation Tasks

- [x] Re-rate Priority and Effort at next /wr-itil:review-problems (2026-05-30: Impact 2 × Likelihood 3 = 6 (Medium), Effort S — single shell-script edit + bounded-retry block + test; root cause + fix shape already documented in Fix Strategy, kept Open pending implementation)
- [x] Investigate root cause (2026-05-30: gh run watch returns non-zero on transient api.github.com errors; the script's `if ! gh run watch ...` block conflated this with real CI failure; confirmed by gh run view --json status,conclusion returning `completed/success` while watch had exited non-zero)
- [x] Create reproduction test (2026-05-30: `test/push-watch.network-flake-fallback.test.js` — 3 structural-contract assertions, follows the P002 structural-test precedent)

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
