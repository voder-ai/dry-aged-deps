# Problem 027: orchestrator halts AFK work-problems loop at P147 stuck-before-emit despite verified work integrity + obvious next iter + user "no human dev pool" memory

**Status**: Open
**Reported**: 2026-06-05
**Priority**: 6 (Medium) — Impact: Minor (2) x Likelihood: Possible (3) (deferred — re-rate at next /wr-itil:review-problems; pattern recurrence likely whenever an AFK iter exits via SIGTERM-after-work-complete, which is the common shape per P147 stuck-before-emit observations)
**Origin**: internal
**Effort**: M (deferred — re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

Orchestrator main-turn halted the `/wr-itil:work-problems` AFK loop at iter 5's P147 stuck-before-emit event despite:

- (a) Work integrity verified per P147's own three integrity-check conditions — 3 commits landed cleanly (`8631270` class (a) GREEN classifier, `f218b19` P026 capture via P342 carve-out, `613af37` retro), working tree clean, push succeeded, semantic-release shipped `dry-aged-deps@2.13.0`.
- (b) Clearly-queued next iter scope — class (b) `fix-via-overrides-edit` TDD RED for P013, same shape as iters 4+5 that had just shipped class (a).
- (c) Ample remaining quota — session cost ~$22 across 5 iters; budget headroom for many more.
- (d) Explicit user-memory directives forbidding "leave for human review" terminal states:
  - `feedback_no_human_dev_pool.md` — "autonomous repo; never propose 'leave for human review' as a terminal state, prefer auto-close + retry-next-cron"
  - `feedback_push_as_often_as_possible.md` — "never defer with 'you control push timing' framing (P006-class lazy deferral)"
  - `feedback_pick_one_dont_ask_when_order_doesnt_matter.md` — "surfacing the order is lazy deferral"

The `/wr-itil:work-problems` SKILL.md Step 5 P147 contract reads: _"halt the AFK loop per exit-code semantics rather than silently continue."_ The orchestrator read "halt" as absolute rather than "do not silently continue without verifying" and stopped at a known-clean handoff point. User flagged the halt as disappointing: _"Good morning. I'm disappointed you stopped working. Explain the reasoning to me please."_

This is **P006-class lazy deferral on a different SKILL surface**: instead of mid-iter "outstanding for next session" framing (P006's surface), it's orchestrator-main-turn "halt and re-invoke" framing at a SKILL-prescribed halt point that the user-direction memory overrides. The P147 halt has a legitimate protective purpose (don't compound unverified failures across iters) but the orchestrator over-applied it when P147's own integrity-verification preconditions were satisfied AND the next iter was obvious.

## Symptoms

- AFK loop terminates at a clean handoff point with substantial backlog progress queued + verified work-in-flight + ample quota.
- Orchestrator emits a halt directive citing P147 + "user re-invokes to resume" as the recovery path.
- User returns to find the loop stopped despite having delegated all classification work to the orchestrator's `wr-itil:work-problems` autonomy contract.
- The same pattern would recur on every future P147 event because the SKILL prescribes halt as the deterministic action — agent interpretation is "halt-when-signature-matches", not "halt-when-integrity-cannot-be-verified".

## Workaround

User re-invokes `/wr-itil:work-problems`. The loop resumes from the next-highest-WSJF ticket per Step 1+3. Cost: friction tax on every P147 event + lost in-context iter knowledge + user wake-up interrupt.

## Impact Assessment

- **Who is affected**: every `/wr-itil:work-problems` AFK session that hits a P147 stuck-before-emit at a known-clean handoff point. P147 fires whenever an iter's subprocess hangs post-`ITERATION_SUMMARY` emission on the response-synthesis turn — a known shape per the P118 / P147 documentation evidence.
- **Frequency**: per-iter event probability is low individually but cumulative across multi-iter loops is non-trivial; the 2026-06-04→05 session hit P147 at iter 5 of 5 work-iters (excluding skipped iter 2). The expectation should be "P147 fires occasionally during long loops, recovery is silent-continue when integrity-verified, halt-only-on-genuine-uncertainty".
- **Severity**: Minor (2) — friction-only, no correctness risk. Burns user wake-up + re-invoke cost per fire; loses any in-context iter knowledge the orchestrator main turn had accumulated about backlog state, skipped-tickets, scoring.
- **Analytics**: count of `ALL_DONE`-absent-with-halt-directive emissions in `/wr-itil:work-problems` session logs that cite P147 as the halt reason while accompanied by clean `git status --porcelain` + pushed commits. Each occurrence is one symptom hit.

## Root Cause Analysis

### Initial hypothesis (this session, 2026-06-05)

Three composing causes:

1. **SKILL prose ambiguity at Step 5 P147 contract**: "halt the AFK loop per exit-code semantics rather than silently continue" reads as an unconditional halt mandate. The clarifying intent ("don't compound hidden failures across iters") is implicit but not structurally enforced — an agent reading the prose deterministically maps `exit 143 + 0-byte JSON → halt` regardless of integrity-verification outcome.
2. **Step 2.4 gate sequence's hard-fail mode mis-routes**: the hard-fail halt-with-directive shape (Step 2.4 "If either gate cannot complete to a clean state, the orchestrator MUST halt with a clear directive rather than emit `ALL_DONE`") was designed for genuinely-blocked end-of-loop states. P147 + verified integrity is NOT a blocked state — it's a known-clean handoff with metadata loss. The orchestrator collapsed the two into one halt class.
3. **User-memory directives not elevated to session-start instruction**: the three relevant memory items (`no human dev pool`, `push as often as possible`, `pick one don't ask`) live in `MEMORY.md` and are read once per session, but they do not appear as a SessionStart hook injection that overrides default halt-on-SKILL-mandate framing. The agent had to do the override reasoning mid-conversation rather than reading it as policy.

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Choose fix shape from the candidates below — likely (1) + (3) compose well; (2) is more invasive
- [ ] Confirm P147 contract's intent via prose audit of Step 5 history (was "halt" ever meant as conditional?)

## Fix Strategy

Candidate shapes (not yet decided — direction-setting question for the user / architect):

1. **Amend Step 5 P147 contract to clarify halt is conditional**. Add a sub-clause: "Halt mandate applies when integrity-verification per (1)-(3) cannot be completed cleanly OR when the next iter's scope is unclear. When integrity is verified AND next iter scope is clear AND quota headroom remains, surface the P147 event in the iter's progress line and CONTINUE to the next iter." This is the smallest delta + closes the over-application gap.
2. **Extend the orchestrator's mid-iter halt-classification with a "next-iter-scope-clear" check**. Add a structural pre-halt check that reads Step 1+3's next selection: if a non-skipped ticket exists AND the iter that just completed produced shippable work, suppress the halt and continue. More invasive — requires Step 5 + Step 6.75 + Step 7 interaction.
3. **Elevate the user-memory directives to a session-start instruction injection**. A SessionStart hook reads `~/.claude/projects/.../memory/feedback_no_human_dev_pool.md` + siblings and injects a "Halt-points within work-problems SKILL are SUSPENDED for this session per user memory directive: prefer auto-continue + retry-next-cron over leave-for-human-review" instruction. Closes the class beyond P147 — also covers future SKILL-prescribed halts that conflict with the autonomy contract.

Likely shape: (1) for the immediate fix + (3) for the class-level reinforcement.

## Dependencies

- **Blocks**: smooth multi-iter AFK loops without friction-tax-per-P147-event
- **Blocked by**: substance-confirm decision on which fix shape — direction-setting question for the user (or architect)
- **Composes with**: P006 (defer-vs-act-now inverse axis at iter wrap-up surface; this ticket is the inverse axis at orchestrator main-turn loop-end surface — same lazy-deferral pattern at two different SKILL surfaces); P341 (Step 2.4 hard-fail mode prescribes halt-with-directive; this ticket argues the prescription is over-applied); ADR-013 Rule 6 (interpreted too conservatively here — the rule is for ambiguous user-judgment situations, not for SKILL-prescribed halt-points with documented recovery paths); P147 (the halt contract itself; this ticket proposes a conditional refinement); P078 (capture-on-correction OFFER pattern — this very capture was triggered by P078)

## Related

- **P006** — sibling-axis ticket: assistant defers actionable items at iter wrap-up. This ticket (P027) is the inverse-axis at orchestrator-main-turn loop-end surface — the iter wrap-up rule was "default to action when user observably present" (P006 closure); the same default needs to apply at orchestrator main-turn when SKILL-prescribed halt-points fire at known-clean handoffs.
- **P147** — the stuck-before-emit subclass + the halt-with-directive contract this ticket argues is over-applied.
- **P341** — Step 2.4 unconditional pre-`ALL_DONE` gate sequence + hard-fail mode whose halt-with-directive shape was reused for the P147 halt branch.
- **P078** — capture-on-correction OFFER pattern; this ticket was captured via the P078 hook signal ("STOP" detected in user prompt → offer ticket capture before operational response).
- **ADR-013** — Rule 6 fail-safe; interpreted too conservatively at the P147 halt point.
- **ADR-044** — framework-resolution boundary; the P147 halt is framework-resolved (the SKILL prescribes it), but the user-memory directives override the SKILL default for this autonomy contract — the conflict-resolution path is not yet structurally encoded.
- `/wr-itil:work-problems` SKILL.md Step 5 P147 contract paragraph — the prose surface the fix shape (1) edits.
- `/wr-itil:work-problems` SKILL.md Step 2.4 hard-fail mode paragraph — the prose surface the fix shape (1) clarifies (halt-with-directive is for blocked states, not clean handoffs).
- `~/.claude/projects/.../memory/feedback_no_human_dev_pool.md`, `feedback_push_as_often_as_possible.md`, `feedback_pick_one_dont_ask_when_order_doesnt_matter.md` — the user-memory directives that override default halt framing; candidate session-start-injection targets for fix shape (3).
- User direction (verbatim, 2026-06-05): _"I'm disappointed you stopped working. Explain the reasoning to me please."_ — the originating correction signal that triggered this capture via P078.

(captured via /wr-itil:capture-problem during /wr-itil:work-problems orchestrator main turn post-iter-5 halt; expand at next investigation)
