# Problem 009: Edit-tool markdown writes skip prettier; pre-commit format:check fails

**Status**: Verification Pending
**Reported**: 2026-05-16
**Priority**: 3 (Medium) — Impact: 3 x Likelihood: 1 (deferred — re-rate at next /wr-itil:review-problems)
**Effort**: M (deferred — re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

Agent Edit-tool markdown writes do not pre-format via prettier; pre-commit format:check repeatedly aborts and forces a `prettier --write` + `git add` re-stage cycle. Observed ≥5 times in the P008 verification session (every Edit to a markdown file in `docs/problems/`, `docs/briefing/`, or `docs/problems/README*.md`), adding 2-3 turns per commit and burning context.

Pre-commit hook is intentionally read-only per ADR-0013 (P003 closed) so it cannot auto-write. The friction-fix path is agent-side:

- A `settings.json` PostToolUse hook for Edit that runs `npx prettier --write` on `.md` / `.yml` / `.yaml` paths whose dir falls under tracked locations.
- A memory note teaching the agent to call `prettier --write` before `git add` on markdown files.
- A script `scripts/format-staged.sh` invoked manually before commit (less automatic; same burn).

Severity: dev-friction; ~2-min cost per occurrence. Priority candidate when re-rated: Impact 2 (Minor) x Likelihood 5 (Almost certain on any session with multi-file markdown edits) = 10 (High). Effort S (single settings entry or memory note).

## Symptoms

- Every `git commit` involving a markdown Edit fails on the `npm run format:check` step of `.husky/pre-commit` with `[warn] <path>` lines + `Pre-commit aborted: prettier formatting check failed.`
- Required recovery sequence: `npx prettier --write <files> && git add <files> && git commit -m ...` — repeated per affected commit.
- Cumulative session cost: 4-5 retry cycles in P008's verification work alone; trend grows with markdown-heavy sessions (retros, problem-ticket editing, briefing updates).

## Workaround

Manual `npx prettier --write <files> && git add <files>` before each `git commit` that touches markdown. Burns ~2 minutes per commit cycle.

## Impact Assessment

- **Who is affected**: This agent (and any other agent driving the project via Edit-tool-style writes). Maintainer-side experience only; published artefacts unaffected.
- **Frequency**: Almost certain on sessions with ≥2 markdown commits. Friction scales linearly with markdown-touching commit count.
- **Severity**: Minor (2). Time-cost only; no correctness risk.
- **Analytics**: Session-log scan — count of `[warn] <path>.md` lines from prettier output is a usable proxy.

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Investigate root cause — confirm Edit tool does not invoke prettier; confirm settings.json PostToolUse hook is a viable fix surface
- [ ] Choose between fix candidates (PostToolUse hook vs memory note vs scripts/format-staged.sh wrapper) and document the choice
- [ ] Apply the chosen fix; observe regression-free format:check on subsequent commits

## Dependencies

- **Blocks**: (none — friction-only)
- **Blocked by**: (none)
- **Composes with**: ADR-0013 (P003) — pre-commit hook is intentionally read-only; this ticket's fix cannot land in the hook itself.

## Fix Released

**Released**: 2026-05-17

ADR-0013 superseded by **ADR-0016** (`docs/decisions/0016-pre-commit-hook-auto-write-restage.proposed.md`). The `.husky/pre-commit` hook now formats staged files via `npx prettier --write --ignore-unknown` and re-stages them via `git add` BEFORE the commit completes. The formatted output lands IN the commit; the working tree is clean post-commit.

Implementation shape (plain shell, no new devDependency — ADR-0016 Option 1):

```sh
staged=$(git diff --cached --name-only --diff-filter=ACM)
if [ -n "$staged" ]; then
  echo "$staged" | xargs npx prettier --write --ignore-unknown
  echo "$staged" | xargs git add
fi
```

The existing read-only contract test (`test/husky-pre-commit.test.js`) was rewritten to assert the new write-and-restage contract under requirement ID `REQ-PRECOMMIT-AUTO-WRITE-RESTAGE`. Four assertions: (i) hook invokes `prettier --write`; (ii) hook invokes `git add` to re-stage; (iii) scope is the staged set via `git diff --cached --name-only`, never the wider tree; (iv) `format:check` retained as defense-in-depth post-write.

### Verification trigger

Verification is complete when ≥ 3 consecutive markdown-touching commits land cleanly in a single session WITHOUT requiring a manual `npm run format` + `git add` retry cycle, AND the post-commit working tree is clean across the run. The user closes P009 via `/wr-itil:transition-problem P009 close` once they have observed the clean run.

### Resolution sequence (this session, 2026-05-17)

1. `git mv` ADR-0013 `.proposed.md` → `.accepted.md` (commit `6a081bc`).
2. ADR-0013 frontmatter `status: 'proposed'` → `status: 'accepted'` (commit `a2eec5b`).
3. `git mv` ADR-0013 `.accepted.md` → `.superseded.md` (commit `4c50c64`).
4. ADR-0013 frontmatter `status: 'superseded'`, add `superseded-by: 0016-...`, prepend "Superseded by" note (commit `7a945b5`).
5. Add ADR-0016 `.proposed.md` (commit `0c82d50`).
6. Update `.husky/pre-commit` to auto-write+restage; rewrite `test/husky-pre-commit.test.js` to assert the new contract (commit `ed5c0e4`).

The sequence followed ADR-0011's split-commit lifecycle convention so `git log --follow docs/decisions/0013-...md` traces the supersession cleanly.

## Related

- **ADR-0013** (`docs/decisions/0013-pre-commit-hook-read-only-policy.superseded.md`) — the prior read-only policy that this fix supersedes. Its reassessment criterion #1 ("≥ 2 sessions in a row where a developer hits the format-check abort") was the trigger for the supersession.
- **ADR-0016** (`docs/decisions/0016-pre-commit-hook-auto-write-restage.proposed.md`) — the new auto-write+restage policy; carries the user's "fix lands in the commit" design constraint as the load-bearing driver.
- **P003** (closed) — pre-commit format:check landed read-only; downstream symptom of the contract. The new hook preserves P003's failure-mode guard (no unstaged prettier deltas post-commit) by re-staging.
- **REQ-PRECOMMIT-AUTO-WRITE-RESTAGE** (`test/husky-pre-commit.test.js`) — behavioural assertion that the new contract is in force.
- Session log from 2026-05-17 `/wr-itil:work-problems` retro — captures the user's design-constraint clarification and the 5-6 commit sequence rationale.
