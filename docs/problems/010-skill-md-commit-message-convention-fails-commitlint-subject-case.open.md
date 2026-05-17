# Problem 010: manage-problem SKILL.md commit-message convention fails `@commitlint/config-conventional` subject-case rule

**Status**: Open
**Reported**: 2026-05-17
**Priority**: 3 (Medium) — Impact: 3 x Likelihood: 1 (deferred — re-rate at next /wr-itil:review-problems)
**Effort**: M (deferred — re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

`/wr-itil:manage-problem` SKILL.md documents a commit-message convention of the shape `docs(problems): P<NNN> <verb> — <summary>` in its examples block (lines 858-865). Adopter projects that use `@commitlint/config-conventional`'s default `subject-case` rule reject every commit attempt formed by this convention because the subject begins with `P<NNN>` (uppercase `P` → `pascal-case`), which the rule disallows alongside `sentence-case`, `start-case`, and `upper-case`.

The working shape that consistently lands in `@commitlint/config-conventional`-defaulted projects is `docs(problems): <verb> P<NNN> — <summary>` (lowercase verb first, then ticket ID). The verb-first shape passes `subject-case` because the subject starts with a lowercase verb token.

Today's `/wr-itil:work-problems` AFK loop on `dry-aged-deps` confirmed this three times in three consecutive iters:

- **Iter 1** (P004 park): first commit attempt `docs(problems): P004 parked — upstream-blocked on windyroad/agent-plugins#123` rejected by commitlint subject-case. Reworded to `docs(problems): park P004 — upstream-blocked on windyroad/agent-plugins#123` (commit `b107ce1`) succeeded.
- **Iter 2** (P007 park): same iter-1 lesson applied pre-commit; `docs(problems): park P007 — upstream-blocked on @windyroad/risk-scorer` (commit `872821c`) landed cleanly on first commit attempt.
- **Iter 3** (P005 park): same; `docs(problems): park P005 — upstream-blocked on @windyroad/voice-tone` (commit `5346d81`) landed cleanly.

The 7 existing successful project commits all follow the `<verb> P<NNN>` shape (`close P002`, `close P008`, `capture P009`, `park P004`, `park P007`, `park P005`, `transition P009`), confirming the convention is project-wide and stable. User direction during the `/wr-itil:work-problems` Step 2.5 surfacing: **"Approve + amend upstream SKILL"** (2026-05-17 AskUserQuestion).

## Symptoms

- First commit attempt of any `/wr-itil:manage-problem` status-transition or capture commit rejected by `commitlint`'s `subject-case` rule on adopter projects using `@commitlint/config-conventional` defaults.
- Recovery: reword subject to `<verb> P<NNN> — <summary>` (lowercase verb first); commit succeeds.
- AFK orchestrators sub-contracting iter dispatch via `claude -p` lose 1 turn + ~30 seconds wall-clock per affected commit on the rejection-and-retry cycle.

## Workaround

Manually use the `<verb> P<NNN>` shape (lowercase verb first) for all problem-ticket commits regardless of what SKILL.md examples show. Project memory note + repeated agent training reinforce the shape across sessions.

## Impact Assessment

- **Who is affected**: Every adopter project that uses `@commitlint/config-conventional` defaults (the de-facto standard Conventional Commits config in the npm ecosystem). Maintainer of `@windyroad/itil` is unaffected if their own commitlint config disables `subject-case` or has been desensitised to the rejection pattern.
- **Frequency**: Almost certain — every problem-ticket transition or capture commit hits the SKILL example's pattern; only agent-learned override or project-side memory note prevents the rejection.
- **Severity**: Minor (2) — friction-only, no correctness risk. Burns 1 turn + 1 commit-cycle worth of wall-clock per affected commit.
- **Analytics**: Session-log scan — count of commitlint `subject-case` rejections in pre-commit hook output is a usable proxy.

## Root Cause Analysis

### Initial hypothesis

The SKILL.md examples were authored against a commitlint config that disabled or relaxed `subject-case` (e.g., the wr-itil monorepo's own config). Adopter projects inherit `@commitlint/config-conventional`'s defaults, which enforce `subject-case` per the rule's "never these casings" semantic.

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Confirm root cause: inspect `@windyroad/itil`'s own commitlint config; check whether `subject-case` is disabled or set to `[2, 'always', 'lower-case']` upstream
- [ ] Decide upstream fix scope: amend SKILL.md examples ONLY, OR also amend the wr-itil monorepo's commitlint config to match the documented shape
- [ ] File upstream report via `/wr-itil:report-upstream P010` (already user-approved direction)

## Dependencies

- **Blocks**: smooth `/wr-itil:manage-problem` first-commit acceptance in any adopter project using `@commitlint/config-conventional` defaults
- **Blocked by**: upstream `@windyroad/itil` SKILL.md (and possibly commitlint config) revision

## Related

- **Reported upstream**: [windyroad/agent-plugins#137](https://github.com/windyroad/agent-plugins/issues/137) (2026-05-17)
- **P004**, **P007**, **P005** — the three same-day park commits whose retry/no-retry sequences confirmed the `<verb> P<NNN>` working shape.
- **/wr-itil:manage-problem** SKILL.md lines 858-865 — the examples block to be amended.
- **`@commitlint/config-conventional`** — [github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional) — defines the default `subject-case` rule with `[2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']]` shape.
- Session log: 2026-05-17 `/wr-itil:work-problems` deviation-approval AskUserQuestion. User answer: "Approve + amend upstream SKILL".

(captured via /wr-itil:capture-problem during /wr-itil:work-problems Step 2.5 surfacing; expand at next investigation)

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/137
- **Reported**: 2026-05-17
- **Template used**: problem-report.yml (problem-first shape)
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes — upstream issue body includes `Downstream tracking: dry-aged-deps problem ticket P010 ... at commit b63b536` and the adopter repo URL.
- **Gate audit trail**: `wr-voice-tone:external-comms` PASS verdict (no voice/tone violation); `wr-risk-scorer:external-comms` PASS verdict (no Confidential Information class matched; one factual-accuracy advisory `Cocoa/dry-aged-deps` → `voder-ai/dry-aged-deps` applied before submission). `gh issue create` invoked with `BYPASS_RISK_GATE=1` per P007's documented workaround — the subagent sandbox lacks Bash to compute the canonical SHA256 marker key, so the PostToolUse hook's marker filename never matched the gate's recomputed key. Both subagent PASS verdicts pre-dated the bypass and are recorded here for retro inspection.
