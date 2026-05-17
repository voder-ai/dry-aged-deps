---
status: 'accepted'
date: 2026-05-13
decision-makers: ['Tom Howard']
consulted: []
informed: []
reassessment-date: 2027-05-13
---

# 0013. Pre-commit hook read-only policy

## Context and Problem Statement

`.husky/pre-commit` ran `npm run format` (= `prettier --write .`). Git captures the index at the start of the commit, then runs the hook. Prettier writes its reformatting to the working tree AFTER the index is captured, so the commit ships the un-reformatted content and the prettier deltas remain as unstaged working-tree changes immediately after every commit. Working pattern observed across ~13 commits in one session (see P003).

The result is recurring `style: apply prettier reformatting from previous commit` follow-up commits and visible working-tree noise after every substantive change.

We need to decide how the pre-commit hook should treat formatting.

## Decision Drivers

- **Predictability**: a commit should not leave the working tree dirty.
- **No silent mutation**: per CLAUDE.md ("No silent failures — let commands fail so you can address the root cause"), the hook should not write to the working tree behind the developer's back.
- **Zero new dependencies if avoidable**: the project has no runtime dependencies and a minimal devDependency surface. A new tool is justified only if a zero-dep option cannot meet the requirement.
- **Reversibility**: the chosen pattern should be easy to swap out if it produces friction in practice.

## Considered Options

1. **Read-only check (`format:check` abort)** — pre-commit runs `prettier --check`; on failure, abort the commit with guidance to run `npm run format` and re-stage. No working-tree writes by the hook.
2. **`lint-staged` (write + re-stage)** — pre-commit delegates to `lint-staged`, which runs `prettier --write` on staged paths only and re-stages the output into the same commit. Adds a new devDependency.
3. **Status quo (`prettier --write .`)** — keep auto-fixing the entire tree, accept the unstaged-delta side effect, and clean up via follow-up `style:` commits.

## Decision Outcome

Chosen option: **Option 1 — read-only check (`format:check` abort)**, because it eliminates the silent-mutation foot-gun with a one-line change to the hook and no new dependency. The auto-fix path remains available to the developer as a deliberate action (`npm run format`), and the hook surfaces formatting drift instead of masking it.

`lint-staged` (Option 2) is the documented upgrade path if the abort-and-re-stage friction becomes routine.

## Consequences

### Good

- Pre-commit hook never modifies the working tree. Commits are clean post-condition.
- No new devDependency. Reverting the decision is a one-line edit to `.husky/pre-commit`.
- Consistent with CLAUDE.md's "no silent failures" principle.
- Removes the recurring need for `style: apply prettier reformatting from previous commit` follow-up commits.

### Neutral

- Developer must run `npm run format` explicitly when they want to apply prettier's fixes (no longer automatic at commit time).
- The same `format:check` runs in `prepush` and CI, so the pre-commit check is a fast local mirror of the CI gate.

### Bad

- Developers used to auto-fix-at-commit may be surprised by an abort. The hook output must clearly say "run `npm run format` and re-stage".
- If multiple files need reformatting frequently, the manual re-stage step adds friction (the trigger for reassessing → Option 2).

## Confirmation

This decision is implemented when:

1. `.husky/pre-commit` invokes `npm run format:check` (read-only) instead of `npm run format` (write).
2. `.husky/pre-commit` contains no `prettier --write` or `npm run format` (without `:check`) invocation.
3. A test under `test/` asserts the hook's read-only contract by reading the hook source.
4. Running `git commit` against a tree whose formatting is already clean produces a clean working tree afterward (no unstaged prettier deltas).

## Reassessment Criteria

Review this decision when:

1. **Abort friction becomes routine**: ≥ 2 sessions in a row where a developer hits the format-check abort and has to manually run `npm run format` + re-stage — at that point, switch to Option 2 (`lint-staged`).
2. **CI drift**: if `prepush` / CI's `format:check` ever passes while the pre-commit hook does not (or vice versa).
3. **New file-type scope**: if formatting expands to file types not covered by `prettier --check .` (e.g., a different formatter for a new language).

## Related Decisions

- **CLAUDE.md** — "No silent failures" workflow rule.
- **ADR-0010** (proposed) — AI agent CI trust boundary; guards `.husky/` integrity. This decision strengthens the hook (removes a silent-mutation foot-gun) rather than weakening it.
- **P003** (Known Error) — the originating problem ticket.

## References

- Prettier CLI: `--check` vs `--write` modes ([prettier.io/docs/en/cli](https://prettier.io/docs/en/cli)).
- Git hook contract: the hook runs after the index is captured; working-tree writes by the hook are not picked up by the in-progress commit.
- `lint-staged` (deferred upgrade path): [github.com/okonet/lint-staged](https://github.com/okonet/lint-staged).
