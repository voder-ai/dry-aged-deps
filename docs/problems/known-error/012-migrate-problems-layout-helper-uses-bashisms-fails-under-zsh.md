# Problem 012: `migrate-problems-layout.sh` helper uses bashisms but `/wr-itil:work-problems` Step 0a SKILL.md doesn't specify bash — sourcing fails under zsh

**Status**: Known Error
**Reported**: 2026-05-17
**Priority**: 2 (Very Low) — Impact: Minor (2) x Likelihood: Rare (1) — migration already complete in this repo (commit `f44c661`); future likelihood is the upstream-shipping path for other adopters
**Effort**: S — smallest delta is `bash -c '...'` wrap in upstream SKILL.md Step 0a (Option 1 of three documented fix shapes)
**WSJF**: 4.0 = (2 × 2.0) / 1
**Type**: technical

## Description

`@windyroad/itil`'s `packages/itil/lib/migrate-problems-layout.sh` helper uses bashisms (`shopt -s nullglob` / `shopt -s extglob`) but the `/wr-itil:work-problems` SKILL.md Step 0a instructs:

```bash
source packages/itil/lib/migrate-problems-layout.sh
migrate_problems_to_per_state_layout "$PWD"
```

without naming the shell. When the user's interactive shell is zsh (the macOS 10.15+ default), sourcing the helper directly into the current shell context fails immediately because `shopt` is a bash builtin that does not exist in zsh:

```
(eval):6: command not found: shopt
(eval):10: command not found: shopt
migrate_problems_to_per_state_layout:23: command not found: shopt
migrate_problems_to_per_state_layout:26: no matches found: /Users/tomhoward/Projects/dry-aged-deps/docs/problems/*.known-error.md
```

The function exits without performing the migration. The orchestrator then proceeds to Step 1 backlog scan — which is dual-tolerant per RFC-002 and reads BOTH layouts — so the user doesn't see an immediate error, but the migration silently no-ops and the AFK loop continues to operate against the flat layout indefinitely.

This session's recovery: re-run the helper via `bash -c 'source ... && migrate_problems_to_per_state_layout "$PWD"'`, which forces a bash subprocess and completes the migration cleanly (commit `f44c661`).

The friction is small per-occurrence (~2 turns + 1 retry) but **affects every zsh-using adopter on first invocation post-`@windyroad/itil@0.29.0`** until Step 0a runs successfully. Combined with the silent no-op shape (no error message percolates to the orchestrator's main turn — only the per-line `shopt: command not found` errors visible in the Bash tool output), the failure mode is easy to miss.

## Symptoms

- First invocation of `/wr-itil:work-problems` post-upgrade-to-`@windyroad/itil@0.29.0` (or any version that ships Step 0a auto-migration) on an adopter running zsh:
  - Bash output shows `command not found: shopt` errors at lines 6, 10, 23.
  - Output ends with `(eval):26: no matches found: docs/problems/*.known-error.md` (zsh's no-glob-match error).
  - Migration silently no-ops; ticket layout remains flat.
- Recovery: re-invoke under `bash -c '...'` wrapping.

## Workaround

Wrap the SKILL.md instruction in an explicit bash subprocess:

```bash
bash -c 'source packages/itil/lib/migrate-problems-layout.sh && migrate_problems_to_per_state_layout "$PWD"'
```

The helper itself uses bash-only constructs, so a bash subprocess is mandatory regardless of the caller's interactive shell.

## Impact Assessment

- **Who is affected**: every adopter of `@windyroad/itil@0.29.0` (or any version shipping the Step 0a auto-migration) whose `/wr-itil:work-problems` invocation runs under zsh. macOS default shell is zsh since 10.15 — likely affects most macOS adopters.
- **Frequency**: once per adopter (first invocation post-upgrade); after Step 0a completes, the layout is per-state and the helper no-ops on subsequent invocations.
- **Severity**: Minor (2) — friction-only; no correctness risk; the dual-tolerant glob in Step 1 backlog scan masks the silent-no-op so the AFK loop continues to function, just against the flat layout. Cost ~2 turns + 1 retry per affected first invocation.
- **Analytics**: count of `shopt: command not found` errors in `/wr-itil:work-problems` Step 0a output across adopter sessions is the proxy.

## Root Cause Analysis

### Initial hypothesis

The `migrate-problems-layout.sh` helper was authored with an implicit bash assumption — `shopt -s nullglob` / `shopt -s extglob` are bash builtins, and the function uses bash-style globbing semantics that depend on those options. The Step 0a SKILL.md instruction (`source ... && function "$PWD"`) sources the helper into the CURRENT shell context, which for zsh users is zsh — where `shopt` is undefined.

Three fix shapes:

1. **Wrap the helper invocation in `bash -c '...'`** at the SKILL.md surface so the helper always runs in a bash subprocess regardless of the caller's shell. Minimal change; preserves the helper's bash-only design.
2. **Add a bash shebang + executable bit to the helper, invoke it directly** (`/Users/.../migrate-problems-layout.sh "$PWD"`) instead of sourcing. Decouples the helper from the caller's shell entirely. More invasive but cleaner.
3. **Rewrite the helper to be POSIX-portable** (replace `shopt` with portable alternatives, use explicit nullglob handling, avoid bash-specific globbing). Most invasive; risks regressing the helper's correctness on existing bash-user invocations.

Option 1 is the smallest delta. Option 2 is the most architecturally clean. Option 3 is overkill given the helper is shipped within `@windyroad/itil`'s own monorepo where bash is a controllable runtime.

### Investigation Tasks

- [x] Re-rate Priority and Effort at next /wr-itil:review-problems (2026-05-30: Impact 2 × Likelihood 1 = 2, Effort S, auto-transitioned Open → Known Error — migration is done in this repo so local likelihood drops to Rare; value-remaining is upstream-shipping for other adopters)
- [ ] Confirm the exact bashisms in `packages/itil/lib/migrate-problems-layout.sh` (likely `shopt -s nullglob` and `shopt -s extglob`).
- [ ] Decide on fix shape (Option 1 / 2 / 3) per upstream `@windyroad/itil` architecture review.
- [ ] File upstream report via `/wr-itil:report-upstream P012`.

## Dependencies

- **Blocks**: smooth first-invocation experience of `/wr-itil:work-problems` post-`@windyroad/itil@0.29.0` upgrade for zsh-using adopters.
- **Blocked by**: upstream `@windyroad/itil` shell-portability fix on `migrate-problems-layout.sh`.
- **Composes with**: P010 (commitlint subject-case), P011 (P165 hook vs capture contract), P006 (assistant defer behaviour) — all four are upstream `@windyroad/itil` SKILL.md / helper / hook contract issues surfaced during this adopter's `/wr-itil:work-problems` exercise.

## Related

- **Reported upstream**: [windyroad/agent-plugins#139](https://github.com/windyroad/agent-plugins/issues/139) (2026-05-18)
- **P010** — sibling upstream-SKILL.md issue (commit-message convention).
- **P011** — sibling upstream-hook-vs-SKILL contract issue (P165 README-refresh override).
- **P006** — sibling upstream-behavioural issue (assistant defer pattern).
- Session log: 2026-05-17 evening `/wr-itil:work-problems` invocation — Step 0a auto-migrate first-fire on this project; sourcing under zsh produced the documented `shopt: command not found` failure; recovery via `bash -c` wrapper completed successfully (commit `f44c661` landed 11 tickets to per-state subdirs).
- `/wr-itil:work-problems` SKILL.md Step 0a — the surface that instructs the failing source-and-call shape.
- `packages/itil/lib/migrate-problems-layout.sh` — the helper containing the `shopt` bashisms.

(captured via /wr-itil:capture-problem during /wr-retrospective:run-retro Step 4b Stage 1; expand at next investigation)

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/139
- **Reported**: 2026-05-18
- **Template used**: problem-report.yml (problem-first shape) — body filed as structured-default problem-shaped per ADR-033, mapped against the upstream template's field set.
- **Disclosure path**: public issue
- **Dedup check**: gh-search pre-filter returned zero matches across `shopt zsh bash migrate`, `migrate-problems-layout`, `Step 0a auto-migrate zsh`, `shopt bashism` queries; no Stage 2 inline-LLM verdict required.
- **Cross-reference confirmed**: yes — issue body's `## Cross-reference` section includes `https://github.com/voder-ai/dry-aged-deps/blob/main/docs/problems/open/012-migrate-problems-layout-helper-uses-bashisms-fails-under-zsh.md` and `tracked locally as P012`.
- **Gate audit trail**: `wr-voice-tone:external-comms` PASS verdict (Surface 3 register match, no banned terms, trade-offs explicitly enumerated, no AI-tell closers). `wr-risk-scorer:external-comms` PASS verdict (no Confidential Information class matched; package names + public file paths + commit SHAs + runtime/OS fingerprints are within publishable scope per RISK-POLICY.md line 19). `gh issue create` invoked with `BYPASS_RISK_GATE=1` per P007's documented workaround — subagent sandbox lacks Bash to compute canonical SHA256 marker key, so the PostToolUse hook's marker filename never matches the gate's recomputed key. Both subagent PASS verdicts pre-dated the bypass. Template's default `labels: ["problem", "needs-triage"]` not applied via CLI (upstream repo's label set lacks these — they are template-form-only labels applied via the web UI; triage will re-label).
