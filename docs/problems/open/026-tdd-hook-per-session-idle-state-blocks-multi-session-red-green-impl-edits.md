# Problem 026: @windyroad/tdd hook per-session IDLE state blocks multi-session RED→GREEN impl edits

**Status**: Open
**Reported**: 2026-06-05
**Priority**: 3 (Medium) — Impact: 3 x Likelihood: 1 (deferred — re-rate at next /wr-itil:review-problems)
**Origin**: external (`@windyroad/tdd` hook contract)
**Effort**: M (deferred — re-rate at next /wr-itil:review-problems)
**JTBD**: JTBD-001
**Persona**: developer

## Description

The `@windyroad/tdd` PreToolUse Edit hook tracks RED/GREEN/IDLE state via per-session file-write events. When a RED-phase test commit lands in one session and the corresponding GREEN-phase impl edit happens in a SUBSEQUENT session, the new session starts in IDLE — there has been no file-write event for the paired test this session to transition IDLE → RED. The hook then blocks the impl edit with `Cannot edit '<impl>' -- no tests written for this file yet. TDD state is IDLE.` even though the paired test exists on disk AND `npx vitest run` confirms it is in RED.

Evidence (2026-06-05 P013 iter 5):

- Iter 4 (commit f2425d2) landed the failing class (a) test for `src/find-unfixable-vulns.js` in a prior subprocess session.
- Iter 5 (this session) attempted impl edit, was blocked: `Cannot edit 'find-unfixable-vulns.js' -- no tests written for this file yet. TDD state is IDLE.`
- `npx vitest run src/find-unfixable-vulns.test.js` confirmed the test was in RED (1 failed) — the impl edit was correctly TDD-incomplete; the issue is the hook's per-session state machine did not recognise the prior-session RED state.
- Workaround: touch + trivial Edit on the test file in the current session to fire a fresh PostToolUse hook event → state advanced to RED → impl edit unblocked.
- Cost per multi-session GREEN: one extra Edit call (trivial — e.g. comment-wrap rewrap).

Recurring class: any TDD workflow where RED and GREEN phases land in separate sessions (overnight pause, AFK iter-boundary, manual review break, the explicit RED→GREEN split AFK orchestration uses).

Distinct from P020 (`@windyroad/tdd` hook stem-match strict matching) per hang-off-check verdict 2026-06-05: P020 is path-pairing strictness; P026 is per-session lifecycle handling. Same upstream package, distinct subsystems.

Possible fix shapes:

- **A — hook reads test runner state directly** at session start (run the paired test once to seed RED/GREEN from observed reality).
- **B — hook treats "test file exists and runs red" as a sufficient IDLE → RED signal** regardless of session boundary (on-disk RED is the source of truth, not in-memory file-write tally).
- **C — SKILL guidance documents the touch-the-test-file workaround** as the canonical multi-session pattern (lightweight; preserves hook simplicity; documents the surprise).

## Symptoms

(deferred to investigation)

## Workaround

(deferred to investigation — touch + trivial Edit on the paired test file in the current session unblocks the impl edit; cost is one extra Edit call per multi-session GREEN phase)

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: (deferred to investigation)
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Investigate root cause in `@windyroad/tdd` hook (PreToolUse Edit gate + PostToolUse state-update path)
- [ ] Decide on fix shape (A runner-state-seed vs B on-disk-RED-detection vs C SKILL guidance workaround)
- [ ] File upstream report via `/wr-itil:report-upstream P026`

## Dependencies

- **Blocks**: smooth multi-session TDD flow (RED iter + GREEN iter in separate AFK subprocesses)
- **Blocked by**: upstream `@windyroad/tdd` for the durable fix
- **Composes with**: P020 (sibling — same package, distinct subsystem — path-pairing strictness vs per-session lifecycle); P006 (assistant-defers-to-next-session — orthogonal but adjacent friction surface)

## Related

- **P013** (`docs/problems/known-error/013-...md`) — the substantive feature the new evidence fired against (ADR-0018 class (a) `fix-via-parent-bump` classifier extension); iter 5 GREEN-phase commit 8631270.
- **P020** (`docs/problems/open/020-tdd-hook-stem-match-strict-matching-causes-variant-named.md`) — sibling ticket on the same upstream package, different subsystem. Hang-off-check 2026-06-05 verdict PROCEED_NEW (different fix locus).
- **ADR-0018** (`docs/decisions/0018-...proposed.md`) — three-class unfixable-reason taxonomy; the RED/GREEN pair this evidence comes from.
- Captured via `/wr-itil:capture-problem`; expand at next investigation.
