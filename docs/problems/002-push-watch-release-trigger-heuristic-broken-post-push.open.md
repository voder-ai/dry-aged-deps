# Problem 002: push:watch's release-trigger heuristic is empty post-push

**Status**: Open
**Reported**: 2026-05-13
**Priority**: 3 (Medium) — Impact: 2 x Likelihood: 1 (deferred — re-rate at next /wr-itil:review-problems)
**Effort**: S (deferred — re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

`scripts/push-watch.sh` (this project's, ported from windyroad and trimmed) reports `"No release-triggering commit types in this push (semantic-release will skip publish)"` even when a release IS cut. Observed this session: a push containing `feat(ci): adopt OIDC token-exchange for workflow auth` and `fix(deps): npm audit fix...` triggered `dry-aged-deps@2.7.0` to be published, but push:watch's trailing heuristic claimed no triggers were present.

**Root cause**: the heuristic uses `git log --format=%s "@{push}.."`, which after a successful push returns the commits between the previous remote head and the current local head. *After* `git push` succeeds, `@{push}` points at the new remote head — same as the local head — so `@{push}..HEAD` is empty. The grep then matches zero lines and the script reports "no release-triggering commits".

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

- [ ] Re-rate Priority and Effort at next `/wr-itil:review-problems`
- [ ] Patch `scripts/push-watch.sh`: capture `PRE_PUSH_REMOTE=$(git rev-parse @{push})` before `git push` runs; use that as the range start for the release-trigger heuristic.
- [ ] Add a bats fixture or shell test that exercises the post-push heuristic on a known release-triggering commit and asserts the correct branch fires.

## Dependencies

- **Blocks**: (none — cosmetic reporting bug)
- **Blocked by**: (none)
- **Composes with**: P001 (push:watch's other heuristic for stale deps is unrelated; this one is the release-trigger axis).

## Related

- `scripts/push-watch.sh` — the wrapper this project ported from windyroad.
- ADR-0005 — semantic-release's commit-type-to-release mapping that the heuristic is trying to predict.
- Discovered while pushing 12 commits ending with `d05aa4d` that included `feat(ci):` and `fix(deps):` types yet push:watch reported "no triggers".

(captured via retro Step 4b Stage 1; expand at next investigation)
