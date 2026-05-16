# Problem 009: Edit-tool markdown writes skip prettier; pre-commit format:check fails

**Status**: Open
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

## Related

- **ADR-0013** (`docs/decisions/0013-pre-commit-hook-read-only-policy.proposed.md`) — pre-commit hook contract that necessitates an agent-side fix.
- **P003** — pre-commit format:check landed read-only; downstream symptom of the contract.
- `.husky/pre-commit` lines that invoke `npm run format:check` and abort with guidance.
- Session log from 2026-05-16 retro — multiple commit-retry citations.

(captured via /wr-itil:capture-problem; expand at next investigation)
