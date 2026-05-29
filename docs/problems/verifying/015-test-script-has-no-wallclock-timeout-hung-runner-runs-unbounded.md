# Problem 015: the `test` script has no wall-clock timeout — a hung test runner runs unbounded (silent zombie instead of loud failure)

**Status**: Verification Pending
**Reported**: 2026-05-25
**Priority**: 4 (Low) — Impact: Minor (2) x Likelihood: Unlikely (2)
**Effort**: S — wrap `test` script with `timeout 180 vitest run --coverage` (or equivalent vitest config wall-clock bound)
**WSJF**: 0 (excluded — verification pending per ADR-022)
**Type**: technical

## Fix Released

Released in the next dry-aged-deps semver-release. `npm test` and `npm run test:cli` are now wrapped with a 300-second wall-clock bound via `node scripts/run-with-timeout.mjs 300 -- vitest run …`. A hung test runner now exits 124 (GNU `timeout` convention) instead of running unbounded; SIGTERM is sent first, then SIGKILL after a 5-second grace window. `npm run prepush` inherits the bound transitively (it invokes `npm test` and `npm run test:cli`).

Exercise evidence in the releasing session: `test/run-with-timeout.test.js` (5 / 5 passing) covers both the pass-through path (child exits 7 → wrapper exits 7; child exits 0 → wrapper exits 0) and the timeout path (child sleeps 30 s with a 1 s budget → wrapper exits 124 with `timed out` on stderr). Full vitest suite runs through the wrapper without regression (coverage 90.84 %, above the 80 % threshold).

Awaiting user verification — the persistent transferable guard (any future hang in vitest setup / teardown, e2e network stalls, env-file blocks) now converts to a bounded loud failure instead of a silent zombie.

## Description

`npm test` (`vitest run --coverage`) and, by extension, `npm run prepush` have no wall-clock timeout. A hung test runner therefore runs unbounded rather than failing loud.

This session it bit hard: a stray `.env` **named pipe (FIFO)** in the working directory caused vite 8 (vitest 4.1.x's bundled vite) to block forever in its env-file loader — `vite:env loading env files` was the last log line before the hang, because reading a FIFO blocks waiting for a writer that never comes. The hang was compounded because the validating `npm run prepush` had been launched as an **unbounded background job** that then orphaned across a multi-day session pause and sat "running" for days with zero output.

Root cause of _that_ hang was the FIFO — a fluke local file (untracked, gitignored, so CI was never affected). But the **persistent, transferable gap** is that nothing bounds the test runner's wall-clock. Any future hang — an infinite loop in a test, a network-stalled e2e (`cli.e2e.real-fixture.test.js` does a real `npm install` in its `beforeAll`), an env-file block — becomes a silent zombie. In CI it would burn the full GitHub Actions job timeout (~6h) before failing.

## Symptoms

- A hung `vitest run --coverage` (any cause) produces zero output and never exits; the process must be SIGKILL'd manually.
- Backgrounding `npm run prepush` (`run_in_background`) makes the hang invisible — the job orphans and survives session pauses.
- Diagnostic contamination observed this session: `--reporter=basic` is invalid in vitest 4.x and itself hangs/errors, which masked the real (FIFO) cause until the flag was dropped.

## Workaround

- Run prepush/tests foreground with a hard `timeout`: `timeout --kill-after=10 180 npm run prepush`.
- Never launch `npm run prepush` as an unbounded background job (it orphans across pauses).

## Impact Assessment

- **Who is affected**: anyone running `npm test` / `npm run prepush` locally; CI (where a hang burns the full job timeout).
- **Frequency**: rare (needs a genuinely hanging test), but high-cost per occurrence (multi-hour wall-clock waste).
- **Severity**: low-moderate — no incorrect output; the cost is wasted time and a confusing failure mode (zero-output hang reads as "still working").

## Root Cause Analysis

### Initial hypothesis

The `test` script (`vitest run --coverage`) trusts the runner to terminate. Vitest has per-test `testTimeout` (set to 60000 in `vitest.config.js`) and a `beforeAll` hook timeout, but neither bounds the _whole-process_ wall-clock, and a startup-phase block (config/env loading, before any test runs) is outside per-test timeouts entirely.

Candidate fix shapes (Stage 2 — Option 3, script/CI):

1. Wrap the `test` script: `"test": "timeout 180 vitest run --coverage"` (or a `scripts/`-hosted runner per the script-centralisation rule). Converts a hang into a bounded, loud failure.
2. Set vitest `teardownTimeout` / `hookTimeout` in `vitest.config.js` to bound the e2e `beforeAll` npm-install (already bumped to 180s inline this session as a point fix).
3. Behavioural memory: never background `npm run prepush`; run foreground with a hard timeout. (Memory-shape, not code.)

### Investigation Tasks

- [x] Re-rate Priority and Effort at next /wr-itil:review-problems (2026-05-30: Impact 2 × Likelihood 2 = 4 (Low), Effort S, auto-transitioned Open → Known Error — root cause + workaround documented, candidate fix shapes enumerated)
- [ ] Decide between `timeout`-wrap (shell, not cross-platform — `timeout` is GNU/coreutils; macOS needs `gtimeout` or a node wrapper) vs a node-based runner for portability
- [ ] Confirm CI (`ci-publish.yml` on ubuntu) has `timeout` available (it does — GNU coreutils)

## Dependencies

- **Composes with**: the `.env`-FIFO / vite-8 env-loader hang is the triggering instance (a one-off local fluke, not itself ticket-worthy); this ticket is the persistent guard gap it exposed.

## Related

- `package.json` `scripts.test` (`vitest run --coverage`) and `scripts.prepush` — the unbounded invocations.
- `vitest.config.js` — has `testTimeout: 60000` but no whole-process / teardown bound.
- `test/cli.e2e.real-fixture.test.js` — `beforeAll` does a real `npm install`; its hook timeout was bumped 60s → 180s inline this session (commit `46e3d14`) as a point fix.
- Session log: 2026-05-25 — `.env` FIFO blocked vite 8's env-loader; backgrounded prepush orphaned across the multi-day pause; resolved by `rm .env` + foreground `timeout`-bounded reruns.

(captured via /wr-itil:capture-problem; expand at next investigation. README.md refresh deferred to /wr-itil:review-problems per the capture contract.)
