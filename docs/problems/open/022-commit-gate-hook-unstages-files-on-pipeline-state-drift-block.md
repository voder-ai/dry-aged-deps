# Problem 022: commit-gate hook unstages files on "Pipeline state drift" block — manual re-stage needed after rescore

**Status**: Open
**Reported**: 2026-05-30
**Priority**: 6 (Medium) — Impact: Minor (2) x Likelihood: Possible (3) — hit 4× across this session (cron-arming, test-relocation, P023 capture cycle, P024 capture cycle) and iter 10 dispatch
**Origin**: internal
**Effort**: S — block message could add a "Recovery: git add <file> + retry" line; root cause investigation is the harder half
**Type**: technical
**WSJF**: 6.0 = (6 × 1.0) / 1

## Description

The risk-scorer commit-gate hook (PreToolUse:Bash on `git commit`) blocks commits when "Pipeline state drift" is detected (working tree changed since the last commit risk assessment). Observed behaviour during the 2026-05-30 session: after the block, the previously-staged file appears as `Changes not staged for commit` rather than remaining staged. Recovery requires `git add` + retry.

Empirical evidence — hit twice in this session:

1. Cron-arming commit attempt — `git add .github/workflows/auto-update.yml` → `git commit` blocked → delegate to `wr-risk-scorer:pipeline` → retry commit failed with "no changes added to commit"; file showed as `modified` not staged. Re-`git add` + retry succeeded (commit `85fad8f`).
2. Test-relocation commit attempt — same pattern with 60 staged files. Re-`git add -A` + retry succeeded (commit `a34aebe`).

Not deterministically reproducible — sometimes the staging persists across the block + rescore. Either the commit-gate hook itself unstages OR a downstream PreCommit hook mishandles a partially-blocked state.

## Symptoms

(deferred to investigation)

## Workaround

(deferred to investigation — `git add` + retry works; the block message could mention this in recovery steps)

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: (deferred to investigation)
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### 2026-06-04 iter 3 investigation (AFK)

Static audit of the risk-scorer hook chain + empirical scratch-repo reproduction. Ruled out the leading hypothesis (commit-gate hook unstages files).

**Hook-chain audit — no staging-mutating commands found:**

- `packages/risk-scorer/hooks/risk-score-commit-gate.sh` — pure-check gate; emits `permissionDecision: "deny"` JSON. No git state mutation.
- `packages/risk-scorer/hooks/lib/risk-gate.sh::check_risk_gate` — reads score file + computes hash; no mutation.
- `packages/risk-scorer/hooks/lib/pipeline-state.sh` (called by `--hash-inputs`) — invokes `git stash create` at line 52. Per git docs, `stash create` builds a stash commit object but does NOT touch HEAD, index, or working tree. Confirmed empirically (see below).
- `packages/risk-scorer/hooks/risk-hash-refresh.sh` (PostToolUse:Bash) — only writes the hash file under `.claude/.risk-scorer/`.
- `packages/risk-scorer/hooks/risk-score-mark.sh` (PostToolUse:Agent) — only writes score/bypass marker files.
- `packages/risk-scorer/hooks/risk-slide-marker.sh` — `touch`-only on score files.
- `packages/risk-scorer/agents/pipeline.md` — subagent declares tools `Read` + `Glob` only. Cannot run Bash. Cannot mutate git.

Grep across the full plugin hooks tree for `git (restore|reset|rm --cached|update-index|stash (push|save|pop|apply)|checkout)` returns zero matches.

**Empirical reproduction — `pipeline-state.sh --hash-inputs` does NOT unstage:**

Scratch repo, file `feature.js` staged (`A  feature.js`):

- Status BEFORE `--hash-inputs`: `A  feature.js`
- Status AFTER `--hash-inputs`: `A  feature.js` (unchanged)
- Hash deterministic across two consecutive calls
- `git stash list`: empty (stash create writes a dangling object, not a stash entry)

Partial-staging variant — staged then modified in working tree (`AM feature.js`):

- Status BEFORE: `AM feature.js`
- Status AFTER: `AM feature.js` (unchanged)
- Hash deterministic

**Conclusion — leading hypothesis falsified:**

The commit-gate hook chain does NOT unstage files. The deny path is fail-fast; the bash command never executes; husky pre-commit never fires on the blocked commit; the pipeline subagent cannot run git commands. There is no code path between (block) and (retry) inside the risk-scorer chain that touches the index or working tree.

**Re-framed hypotheses for the "files appear modified not staged" observation:**

1. **Partial-staging misperception** — when a file is `git add`ed then subsequently modified in the working tree (e.g., by an Edit tool call, or by a prior commit's husky pre-commit auto-write that landed AFTER the staging was conceptually "done"), `git status` shows the file in BOTH "Changes to be committed" AND "Changes not staged for commit" sections. Reading just the second section gives the false impression that staging was lost. The staged content IS still there — `git diff --cached` would show it.
2. **Inter-tool working-tree mutation** — between the original `git add` and the retry `git commit`, some unrelated tool call (Edit, Write, or a documentation-write hook) modified a file that was previously staged. This is real "drift" but not "unstaging" — the original staged content is still in the index; the new working-tree content is just diverged.
3. **Aggregate `git add -A` on large file sets** — the test-relocation commit was 61 files (lots of `git mv`). Across a multi-step staging sequence, individual files could end up in mixed states. The recovery (`git add -A` + retry) re-uploads working-tree state for everything, which is what was intended anyway.

The empirical evidence in the ticket (`85fad8f`, `a34aebe`) supports hypothesis 1 or 2 over hypothesis 3 — the cron-arming commit was a single file. The most likely cause: the file was staged, then the agent's subsequent work (e.g., a Read followed by an Edit to add a missing trailing newline, or a prior commit's husky prettier-write) modified the working tree, producing the partial-staging state. Block fired correctly (hash drift detected real working-tree change). Retry's `git add` re-uploads the new content, which is what was wanted.

**Implication for the workaround / enhancement:**

The block message already says "(1) stage files with git add, (2) delegate to wr-risk-scorer:pipeline". That's the correct recovery sequence. An enhancement to also include the phrase `(or git add -A if multiple files have drifted since the last add)` would close the multi-file recovery gap without falsely implying the gate itself unstaged anything.

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems (current rating may be too high — this is a UX/recovery-clarity issue, not a correctness bug in the gate)
- [x] Reproduce: stage file → run `--hash-inputs` → snapshot status — staging persists, hash deterministic (2026-06-04 iter 3)
- [x] Determine source: NOT commit-gate hook; NOT husky pre-commit (never runs on denied commit); most likely partial-staging misperception or inter-tool working-tree mutation (2026-06-04 iter 3)
- [ ] Enhancement candidate: block message could append `Recovery tip: if multiple files drifted, use git add -A before retrying.`
- [ ] Watch for a NEW empirical hit with `git status --porcelain` captured BEFORE the recovery `git add`, to confirm or refute the partial-staging hypothesis with concrete evidence

## Dependencies

- **Blocks**: smooth retry experience after commit-gate "Pipeline state drift" block
- **Blocked by**: a fresh empirical hit captured with `git status --porcelain` snapshots at each step — without that, the partial-staging hypothesis remains plausible but not confirmed

## Related

- `wr-risk-scorer:pipeline` — subagent type the block message points at for rescoring.
- `packages/risk-scorer` — likely owner of the commit-gate hook.
- `.husky/pre-commit` — post-block hook chain that might be involved.
- 2026-05-30 session — empirical evidence (`85fad8f` cron-arming + `a34aebe` test-relocation).

(captured via /wr-itil:capture-problem; expand at next investigation)
