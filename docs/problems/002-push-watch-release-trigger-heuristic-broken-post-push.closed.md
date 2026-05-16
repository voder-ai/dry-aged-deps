# Problem 002: push:watch's release-trigger heuristic is empty post-push

**Status**: Closed
**Reported**: 2026-05-13
**Closed**: 2026-05-16 — verified by the v2.7.3 release-driving push (commit `6e77c59`, fix(ci):) which printed "Commits include release-triggering types — expect a new release version above" as the heuristic's expected success path. Third successful release-triggering push since the fix shipped in v2.7.1.
**Priority**: 8 (Medium) — Impact: Minor (2) x Likelihood: Likely (4)
**Effort**: S — single-file patch to scripts/push-watch.sh capturing PRE_PUSH_REMOTE before push, plus vitest contract test
**WSJF**: 0 (Closed; excluded per ADR-022)
**Type**: technical

## Description

`scripts/push-watch.sh` (this project's, ported from windyroad and trimmed) reports `"No release-triggering commit types in this push (semantic-release will skip publish)"` even when a release IS cut. Observed this session: a push containing `feat(ci): adopt OIDC token-exchange for workflow auth` and `fix(deps): npm audit fix...` triggered `dry-aged-deps@2.7.0` to be published, but push:watch's trailing heuristic claimed no triggers were present.

**Root cause**: the heuristic uses `git log --format=%s "@{push}.."`, which after a successful push returns the commits between the previous remote head and the current local head. _After_ `git push` succeeds, `@{push}` points at the new remote head — same as the local head — so `@{push}..HEAD` is empty. The grep then matches zero lines and the script reports "no release-triggering commits".

**Fix shape**: capture the pre-push remote head into a variable BEFORE `git push` runs (`PRE_PUSH_REMOTE=$(git rev-parse @{push})` or equivalent), then use `${PRE_PUSH_REMOTE}..HEAD` for the heuristic. Test: a push of a `fix:` commit should report "Commits include release-triggering types".

## Symptoms

- `npm run push:watch` succeeds end-to-end with green CI.
- The "Commits include release-triggering types — expect a new release version above" branch never fires.
- The "No release-triggering commit types in this push (semantic-release will skip publish)" branch fires unconditionally post-push, regardless of actual commit types.

## Workaround

Read the "Latest GitHub release" and "Latest npm version" lines that push:watch DOES print correctly (they fetch via `gh api` and `npm view`, not via the broken heuristic). Compare against the prior release manually.

## Impact Assessment

(deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [x] Re-rate Priority and Effort at next `/wr-itil:review-problems` (held: 8 Medium / S, WSJF 16.0 — fix landed at marginal cost; no scope expansion)
- [x] Patch `scripts/push-watch.sh`: capture `PRE_PUSH_REMOTE=$(git rev-parse @{push})` before `git push` runs; use that as the range start for the release-trigger heuristic.
- [x] Add a vitest contract test (`test/push-watch.script-contract.test.js`) asserting the structural fix — static script-content assertions, mirroring `test/husky-pre-commit.test.js` (chose this over bats since the project has no bats infrastructure and the contract is static).

## Fix Released

Patched in this commit (next push will exercise the fixed heuristic). Fix shape: `PRE_PUSH_REMOTE=$(git rev-parse @{push})` captured before `git push "$@"` runs; release-trigger heuristic at step 6 now uses `git log --format=%s "${PRE_PUSH_REMOTE}..HEAD"` instead of the post-push-empty `git log --format=%s "@{push}.."`. Vitest contract test (`test/push-watch.script-contract.test.js`) asserts both the capture-before-push ordering and the corrected range. Awaiting user verification: next `npm run push:watch` that includes a `feat:` / `fix:` / `BREAKING CHANGE:` commit should print "Commits include release-triggering types — expect a new release version above" instead of the previous false-negative.

## Dependencies

- **Blocks**: (none — cosmetic reporting bug)
- **Blocked by**: (none)
- **Composes with**: P001 (push:watch's other heuristic for stale deps is unrelated; this one is the release-trigger axis).

## Related

- `scripts/push-watch.sh` — the wrapper this project ported from windyroad.
- ADR-0005 — semantic-release's commit-type-to-release mapping that the heuristic is trying to predict.
- Discovered while pushing 12 commits ending with `d05aa4d` that included `feat(ci):` and `fix(deps):` types yet push:watch reported "no triggers".

(captured via retro Step 4b Stage 1; expand at next investigation)
