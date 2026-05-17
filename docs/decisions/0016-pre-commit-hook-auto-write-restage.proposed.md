---
status: 'proposed'
date: 2026-05-17
decision-makers: ['Tom Howard']
consulted: []
informed: []
reassessment-date: 2027-05-17
supersedes: 0013-pre-commit-hook-read-only-policy
---

# 0016. Pre-commit hook auto-write and re-stage policy

## Context and Problem Statement

ADR-0013 (now superseded) chose a read-only `format:check` abort over a write-and-re-stage hook on the basis that "a commit should not leave the working tree dirty" and "no silent mutation behind the developer's back". The reassessment criterion encoded into ADR-0013 was: "≥ 2 sessions in a row where a developer hits the format-check abort and has to manually run `npm run format` + re-stage — at that point, switch to Option 2 (`lint-staged`)."

That criterion has demonstrably fired. P009 (`Edit-tool markdown writes skip prettier; pre-commit format:check fails`) documents ≥5 abort hits in the P008 verification session alone, and 6 further hits in a single `/wr-itil:work-problems` AFK loop (3 iters plus 3 retro commits) on 2026-05-16/17. The Edit tool used by the Claude Code agent does not pre-format markdown writes; every markdown-touching commit cycle pays a ~2-minute `npm run format` + re-stage tax.

The decision to revisit was authorised by the user with a narrowing design constraint that resolves ADR-0013's "no silent mutation" concern: _"the reason auto-write was not allowed is because it would fix the issue, but the fix would not be included in the commit, leaving the repo unclean. If you can include the fix in the commit, then no worries."_ In other words: auto-write is acceptable if and only if the formatted output is re-staged BEFORE the commit completes, so the commit ships the formatted content and the working tree is clean post-commit.

This ADR records the decision to adopt that pattern, supersedes ADR-0013, and specifies the implementation shape.

## Decision Drivers

- **The user's design constraint is load-bearing**: silent mutation is acceptable only when its output lands in the same commit. Any pattern that leaves unstaged deltas after commit is excluded.
- **Predictability (carried forward from ADR-0013)**: a commit must not leave the working tree dirty. The new pattern preserves this invariant by re-staging.
- **Zero new dependencies if avoidable (carried forward from ADR-0013)**: the project has zero runtime dependencies and a minimal devDependency surface. A new tool is justified only if a plain-shell option cannot meet the requirement.
- **Reversibility**: the chosen pattern must be easy to swap out if it produces friction in practice (e.g., reverting to ADR-0013's read-only check, or upgrading to `lint-staged`).
- **Gate integrity (ADR-0010)**: the auto-formatting contract must not weaken any existing CI / pre-push gate. The pre-push and CI `format:check` mirrors must continue to pass.
- **Throughput**: the friction cost of the current read-only abort is ~2 minutes per markdown-touching commit and was paid 11+ times across two sessions. The new policy targets zero-friction markdown commits.

## Considered Options

1. **Plain-shell write-and-restage on staged files only** — pre-commit identifies staged files matching prettier's scope, runs `npx prettier --write` on them, and `git add`s the result. Implementation is ~5 lines of shell. No new devDependency.
2. **`lint-staged` devDependency** — pre-commit delegates to `lint-staged`, which runs `prettier --write` on staged paths and re-stages. Battle-tested across many adopter projects. Adds one devDependency tree.
3. **Status quo (revert to ADR-0013's read-only check)** — accept the recurring abort friction; reject the user's new design constraint. Documented for completeness.

## Decision Outcome

Chosen option: **Option 1 — plain-shell write-and-restage on staged files only**, because it honours the project's zero-runtime-dep / minimal-devDep posture (carried forward from ADR-0013), the implementation is small enough to read in one screen, and the staged-files-only scope means the hook touches exactly the files the developer is committing — never the wider tree. The `lint-staged` upgrade path is preserved as a deferred reassessment trigger if the plain-shell loop proves brittle in practice (filename quoting edge cases, performance on large staged diffs, scope expansion to new file types).

The user's design constraint is satisfied: the hook runs `prettier --write` then `git add` on the same files in sequence, both before the commit completes. The formatted content is what the commit ships. The working tree is clean post-commit. ADR-0013's "no silent mutation" concern is preserved in spirit — mutation occurs only in service of the in-progress commit, and the developer sees the formatted output in the commit's own diff.

ADR-0010 gate integrity is preserved: the hook strengthens the auto-formatting contract (formatted output is guaranteed in every commit, not merely checked-for-conformance) without weakening any gate. The pre-push and CI `format:check` mirrors continue to pass because the hook now produces conforming output.

## Consequences

### Good

- Pre-commit hook produces a clean working tree post-commit, AND markdown commits stop hitting the format-check abort. P009's recurring friction is structurally eliminated.
- No new devDependency. Reverting to ADR-0013's policy or upgrading to `lint-staged` is a small edit to `.husky/pre-commit`.
- Consistent with ADR-0010: the hook strengthens auto-formatting without weakening any CI gate; pre-push and CI `format:check` mirrors continue to enforce the same standard.
- The Claude Code Edit-tool friction (the root cause of P009) becomes a no-op at commit time — agent writes land in commits formatted, regardless of the writing tool's pre-format behaviour.
- The staged-files-only scope means the hook NEVER touches files outside the commit's scope, so a developer working on multiple changes in parallel never has the hook mutate an unrelated file.

### Neutral

- The same `format:check` runs in `prepush` and CI; the pre-commit hook is now a write-mode local mirror of the read-mode CI gate. The contracts remain consistent (formatted output is required everywhere) but the local enforcement is now corrective rather than aborting.
- Developers who relied on the pre-commit abort as a "did I run format?" signal now see formatted output land automatically. The commit diff is the new signal.

### Bad

- The plain-shell write-restage loop has known edge cases: filenames containing whitespace, quotation marks, or backslashes require careful shell quoting. The current implementation uses `xargs` with default whitespace splitting, which fails on filenames containing spaces. Mitigation: the project's filename convention does not use spaces in tracked source paths today, and any introduction of such would surface as a test failure before the hook is invoked. The reassessment trigger #2 below converts this into an explicit upgrade path.
- Silent auto-fix means a developer's incorrect formatting choice is silently corrected rather than surfaced. ADR-0013's "developer must run `npm run format` explicitly" pedagogical benefit is lost. Mitigation: the commit diff still shows the formatted output, so the developer can review what the hook changed.
- If `prettier --write` fails (config error, parse error in a file), the commit aborts before the lint/type-check phase. Failure surface is the same as the prior abort path, but the error message is now from prettier itself rather than the hook's friendly message. Mitigation: prettier's parse errors are typically self-explanatory.

## Confirmation

This decision is implemented when:

1. `.husky/pre-commit` runs `npx prettier --write` (or `npm run format` against staged files) BEFORE `npm run format:check`, AND runs `git add` on the formatted output, AND the subsequent `format:check` therefore passes for any input that prettier can fix.
2. `.husky/pre-commit` operates on the staged file set only — it MUST NOT format files outside `git diff --cached --name-only --diff-filter=ACM`.
3. A test under `test/` asserts the new contract: the hook writes formatted output to staged paths and `git add`s them. The test SHOULD additionally assert that unstaged files are NOT touched.
4. Running `git commit` against a tree whose markdown is unformatted produces a clean working tree afterward (no unstaged prettier deltas), and the resulting commit's diff includes the formatted content.
5. `npm run prepush` and CI continue to pass `format:check` after the hook change (the CI gate is unaffected by the change in the local hook policy).

## Pros and Cons of the Options

### Option 1 — Plain-shell write-and-restage on staged files only

- Good: zero new dependencies, consistent with the project's runtime+devDep minimalism.
- Good: implementation is ~5 lines of shell, readable and reviewable in one screen.
- Good: staged-files-only scope means the hook NEVER touches unrelated files.
- Bad: filename-edge-case risk (whitespace, quotes) — known limitation, upgrade trigger #2 below.
- Bad: re-implementing a wheel that `lint-staged` already polishes.

### Option 2 — `lint-staged` devDependency

- Good: battle-tested across the npm ecosystem; filename-edge-case correctness is solved.
- Good: declarative config in `package.json` is concise and readable.
- Bad: adds a devDependency tree (`lint-staged` pulls ~10 transitive packages today).
- Bad: contradicts ADR-0013's "Zero new dependencies if avoidable" driver, carried forward verbatim here.

### Option 3 — Revert to ADR-0013's read-only check

- Good: zero churn, zero new behaviour.
- Bad: directly rejects the user's narrowing design constraint and the reassessment criterion that has demonstrably fired.
- Bad: P009's friction continues to be paid every markdown commit, ~2 minutes each, indefinitely.

## Reassessment Criteria

Review this decision when:

1. **Filename edge case bites**: a commit fails because a staged filename contains whitespace, a quotation mark, or a backslash that the `xargs` pipeline cannot handle. At that point, upgrade to `lint-staged` (Option 2 above).
2. **Performance regression**: the hook's wall-clock cost exceeds the prior `format:check` abort's net cost for a typical commit (rough envelope: > 2 seconds added on a single-file markdown commit). At that point, scope-narrow or profile.
3. **CI drift**: if `prepush` / CI's `format:check` ever passes while the pre-commit hook does not (or vice versa).
4. **New file-type scope**: if formatting expands to file types not covered by `prettier --write` (e.g., a different formatter for a new language).
5. **One year from this ADR's date** (2027-05-17) as the default review checkpoint per the frontmatter `reassessment-date`.

## Related Decisions

- **ADR-0013** (superseded) — the prior read-only policy. Its decision drivers carry forward into this ADR's drivers list; only its conclusion is replaced. Its reassessment criterion #1 is the trigger for this ADR.
- **ADR-0010** (proposed) — AI agent CI trust boundary. This ADR's hook change is within the human-led `.husky/` edit envelope; no AI agent surface is touched.
- **ADR-0011** (proposed) — ADR Format and Lifecycle Convention. This ADR is the first real proposed → accepted → superseded sequence the project has executed; the lifecycle ceremony followed here exercises ADR-0011's mandates.
- **P009** (Open, to be transitioned to `.verifying.md` in the implementation commit) — the originating problem ticket. The Fix Released contract is satisfied when this ADR is implemented and `husky-pre-commit.test.js` passes against the new hook shape.
- **P003** (closed) — the prior friction ticket that motivated ADR-0013. P003's original failure mode (unstaged prettier deltas after commit) is preserved as a constraint here: the staged-files-only re-stage design prevents the unstaged-delta failure mode from recurring.
- **CLAUDE.md** — "No silent failures" workflow rule. This ADR records the user's narrowing of that principle: silent mutation IS acceptable when it lands in the same commit as the change it formats.

## References

- Prettier CLI: `--write` mode ([prettier.io/docs/en/cli](https://prettier.io/docs/en/cli)).
- Git hook contract: the pre-commit hook runs after the index is captured; `git add` invocations inside the hook update the in-progress commit's index.
- `lint-staged` (deferred upgrade path): [github.com/okonet/lint-staged](https://github.com/okonet/lint-staged).
- The user's design constraint (2026-05-17 AskUserQuestion response): "the reason the auto-write was not allowed is because it would fix the issue, but the fix would not be included in the commit, leaving the repo unclean. If you can include the fix in the commit, then no worries."
