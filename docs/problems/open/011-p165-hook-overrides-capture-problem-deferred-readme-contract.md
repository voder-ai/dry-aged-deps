# Problem 011: P165 README-refresh PreCommit hook overrides `/wr-itil:capture-problem`'s deferred-README contract

**Status**: Open
**Reported**: 2026-05-17
**Priority**: 3 (Medium) — Impact: 3 x Likelihood: 1 (deferred — re-rate at next /wr-itil:review-problems)
**Effort**: M (deferred — re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

The `/wr-itil:capture-problem` skill's contract (SKILL.md Step 6) explicitly states: _"**Stage list**: ONLY the new ticket file. **Do NOT** stage `docs/problems/README.md`. The deferred-README-refresh contract is the load-bearing distinction from `/wr-itil:manage-problem` — capture-time speed depends on skipping the regenerate-and-stage cycle."_

The project's P165 PreCommit hook fires on `git commit` when a new problem ticket is staged without a corresponding `docs/problems/README.md` update, with the error: `BLOCKED: P165. P<NNN> needs docs/problems/README.md refresh. Run: git add docs/problems/README.md.`

The two contracts conflict. The hook wins (it blocks the commit), forcing the agent to either refresh the README (violating capture-problem's deferred contract) or bypass via `BYPASS_README_REFRESH_GATE=1` (defeating the hook's intent). Hit this session on P010 capture: capture-problem's commit attempt was blocked; the agent updated README + README-history to satisfy the hook, then re-committed successfully. The deferred-README contract was effectively dead in this adopter.

This is a SKILL-contract-vs-hook-contract drift in upstream `@windyroad/itil`. The capture-problem skill's deferred-README design is documented at SKILL.md Step 6 (lines ~580-590 of `packages/itil/skills/capture-problem/SKILL.md` in `@windyroad/itil@0.29.0`) and is the load-bearing distinction from `/wr-itil:manage-problem`. The P165 hook's contract overrides it without coordination.

## Symptoms

- `/wr-itil:capture-problem <description>` succeeds at Step 5 (writes the new ticket file) and Step 6 (`git add` the ticket only).
- The Step 6 commit attempt is BLOCKED by the P165 PreCommit hook demanding README refresh.
- Recovery: regenerate `docs/problems/README.md` to include the new ticket row + update the line-3 fragment + rotate displaced fragment to `README-history.md`, then re-commit. Burns ~3 turns + ~1 min wall-clock per affected capture.
- Hit twice this session (P010 capture during `/wr-itil:work-problems` Step 2.5 follow-up; observed in the project's recent capture history per `git log --grep=^docs.problems..capture`).

## Workaround

Two options:

1. **Treat capture-problem as manage-problem-lite**: regenerate README inline alongside the ticket capture (defeats the deferred-refresh speedup; matches manage-problem's full intake cost).
2. **`BYPASS_README_REFRESH_GATE=1` bypass**: documented in the hook's BLOCKED message. Skips the refresh; capture lands cleanly. But the README is now transiently stale and downstream tooling that reads it (e.g. `/wr-itil:work-problems` Step 1 fast path) gets misleading data until `/wr-itil:review-problems` runs.

This session picked option 1 for P010 (regenerate inline) because the user was observably present and the README refresh fit naturally into the same commit's audit trail.

## Impact Assessment

- **Who is affected**: every adopter of `@windyroad/itil` whose project also wires the P165 PreCommit hook. The hook is shipped with the plugin per `@windyroad/itil@0.32.1`'s `packages/itil/hooks/`. Maintainers using the upstream plugin verbatim get this conflict by default.
- **Frequency**: every `/wr-itil:capture-problem` invocation in such projects. Almost certain.
- **Severity**: Minor (2) — friction-only; no correctness risk. Adds 3 turns + 1 min per capture.
- **Analytics**: count of `BLOCKED: P165` lines in session pre-commit hook output is the proxy.

## Root Cause Analysis

### Initial hypothesis

The P165 hook was authored before capture-problem's deferred-README design landed (or in a parallel design thread that didn't coordinate with capture-problem's SKILL contract). Two fix shapes:

1. **Amend P165 hook**: detect the `capture` verb in the commit message (`docs(problems): capture P<NNN>`) and skip the README-refresh requirement for that commit class. Aligns with capture-problem's deferred design.
2. **Amend capture-problem SKILL**: drop the deferred-README contract; require capture to stage README + history (matching manage-problem's full intake). Simpler hook contract; capture-problem becomes a thin lifecycle convenience over manage-problem rather than a fast aside-invocation.

Option 1 preserves capture-problem's "capture-and-continue" performance promise (the user direction that drove the original deferred design — P155). Option 2 simplifies the hook surface but undoes the capture-vs-manage speedup. The architect's call on which to ship lives upstream.

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Confirm P165 hook source location in `@windyroad/itil` (likely `packages/itil/hooks/itil-readme-refresh-precommit.sh` or similar) and read its current contract.
- [ ] Read capture-problem SKILL.md Step 6 verbatim to confirm the "Do NOT stage README" intent vs the hook's "Must stage README" requirement.
- [ ] Decide on fix path (Option 1 hook-skips-capture-commits vs Option 2 capture-stages-README).
- [ ] File upstream report via `/wr-itil:report-upstream P011`.

## Dependencies

- **Blocks**: capture-problem's documented deferred-README performance promise in adopter projects with the P165 hook installed.
- **Blocked by**: upstream `@windyroad/itil` design decision on fix path.

## Related

- **Upstream report pending** — external dependency identified; invoke /wr-itil:report-upstream when ready
- **P165** — the hook's upstream ticket (in `@windyroad/itil`'s problem ledger).
- **P155** — drove the original `/wr-itil:capture-problem` skill design with the deferred-README contract as a load-bearing distinction.
- **P010** — the same-day adjacent capture commit (this session) where the conflict was observed.
- Commit `b63b536` (this session) — P010 capture commit; final body shows the README refresh that was needed to land per P165, contradicting capture-problem's SKILL.md Step 6 contract.

(captured during `/wr-retrospective:run-retro` Step 4b Stage 1; expand at next investigation)

## Fix Strategy

- **Kind** — improve
- **Shape** — hook
- **Target file** — `packages/itil/hooks/itil-readme-refresh-precommit.sh` (or equivalent in `@windyroad/itil@<current>`)
- **Observed flaw** — hook fires on every problem-ticket commit, including `capture` verb commits where capture-problem's SKILL.md Step 6 says README refresh is deferred.
- **Edit summary** — detect the `capture` verb in the commit message (`docs(problems): capture P<NNN>`) and skip the README-refresh requirement for that commit class. Preserves capture-problem's capture-time-speed promise.
- **Evidence** — P010 capture commit `b63b536` this session: capture-problem Step 6 explicitly says "Do NOT stage README"; commit blocked by P165 demanding README refresh; agent updated README inline to satisfy hook. Documented contract violation.
