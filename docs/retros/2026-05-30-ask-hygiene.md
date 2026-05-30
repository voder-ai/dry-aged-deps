# Ask Hygiene — 2026-05-30

Per ADR-044 (Decision-Delegation Contract). Lazy count is the regression metric — target 0.

Scope: combined `/wr-itil:work-problems` AFK loop (4 iters) + `/wr-retrospective:run-retro` session-wrap.

| Call # | Header     | Classification | Citation                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------ | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1      | P013 shape | direction      | Gap: P013 (overrides block ignored) ADR-074 substance-confirm-before-build fires — Fix Strategy is empty until direction is set; framework cannot resolve a genuine ≥2-option product-shape decision the iter is about to build on (three mutually-exclusive shapes: hygiene-module-only / sharpen-via-fixAvailable / both). Sub-contracting any one of them would silently lock in P315-class architecture. |
| 2      | P014 shape | direction      | Gap: P014 (unconditional age soak) ADR-074 substance-confirm-before-build fires — same anti-P315 guard as call 1. Three mutually-exclusive shapes (exposure-aware severity-scaled soak / per-exposure override flag / surface-trade-off). Framework cannot resolve.                                                                                                                                          |

**Lazy count: 0**
**Direction count: 2**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

Note on Call # convention: there were not 2 separate `AskUserQuestion` invocations; there was 1 invocation carrying 2 batched questions per ADR-013 Rule 1 (≤4-per-call cap). The Call # column counts questions per the trail-file convention from prior retros. Both questions classify as direction per ADR-074's substance-confirm-before-build clause (cat-1, NOT lazy) — surfaced at the AFK loop's Step 2.5 framework-prescribed halt point.

Notes: every other decision this session was taken silently per ADR-044's framework-resolution boundary —

- AFK iters 1-4 dispatched without per-iter "OK to start?" asks (framework-resolved).
- Push:watch drains after each commit-landing iter (no per-push asks — policy-authorised per ADR-018 within appetite).
- README direction-record edits to P013/P014 (silent — docs/problems excluded from gates).
- Briefing signal-vs-noise classification (Step 1.5 agent-owned).
- Silent delete of `gh issue create --label` briefing entry (decay to -3, silent per Step 1.5).
- Trim-noise removal of skip-if-same-bump briefing entry (Tier 3 rotation per ADR-044 framework-mediated surface).
- README stub-row WSJF placeholder (1.5 / Effort M deferred — re-rate-at-next-review per existing capture-problem contract; framework-resolved escape from P165 hook's catch-22 with capture-problem's deferred-README contract).
- Orchestrator main-turn route from HALT_ROUTE_RECONCILE to /wr-itil:review-problems at Step 0 (escalation under the work-problems Edge Case "Review needed first" + this session's captured P017 — framework-resolved).
- P009 close-on-evidence (Step 4a silent-action per ADR-044 + verification trigger satisfied across 4 markdown-touching commits).
- Stage 1 ticketing of all 4 codify-worthy observations (P016/P017/P018/P019 — mechanical per Step 4b Stage 1).
- Stage 2 shape picking for each ticket (catalog-resolved — Option 2 for upstream skill improvements, Option 3 for local shell-script edits).
- Iter 5 `push:watch` "Pipeline failed" / verify-via-gh-run-view recovery (silent — Step 6.5 fix-and-continue spirit + the documented `gh run watch` network-flake briefing entry).
- Recovery from pre-commit `format:check` rejection on the rename-with-edit case (silent `npm run format` + re-stage — same Step 6.5 fix-and-continue + captured as P018).

No framework-resolvable decision was sub-contracted back to the user. Numerous moments where a less-disciplined session might have asked (mid-loop "is it OK to continue?" between iters, "should I push?" before each push:watch, "which Effort should I assign?" for capture-problem skeletons, "OK to bypass the P165 hook?") correctly stayed silent.

---

## 2026-05-30 — Subsequent `/wr-itil:work-problems` iter (P016 fix, single iteration)

Scope: one additional `/wr-itil:work-problems` AFK iter dispatched after the trail above; worked P016 (push:watch network-flake fallback). No AskUserQuestion calls fired.

| Call # | Header | Classification | Citation                                  |
| ------ | ------ | -------------- | ----------------------------------------- |
| (none) | —      | —              | No AskUserQuestion invocations this iter. |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

Notes: every decision in this iter was framework-resolved.

- Selection of P016 over P018 (both WSJF 6.0 Open S 2026-05-30) — tie-break rung 5 (ID asc) per `/wr-itil:work-problem` Step 2 framework-mediated ladder.
- Skip P010 / P011 (upstream-blocked, reports filed) — orchestrator's directive applied mechanically.
- Re-rate P016-P019 from placeholder WSJF 1.5 to scored — framework arithmetic (Severity × Status Multiplier / Effort).
- Open → Verification Pending transition on commit-landing — ADR-022 + Working a Problem section guidance ("if the fix is small enough, continue straight to implementing it"); P057 staging trap re-stage applied.
- Test shape (structural assertions on script source) — followed existing P002 precedent (test/push-watch.script-contract.test.js).
- Commit subject form `fix(scripts): push-watch verifies ...` — lowercase first token per P010 commitlint subject-case lesson.
- README column shape preserved (no Origin column added) — ADR-076 is upstream-only; the project hasn't adopted it locally; matched existing precedent rather than introducing structural change.

The architect + JTBD reviews returned PASS without ISSUES — both delegations were the standard gate-satisfaction loop, not direction-setting.

---

## 2026-05-30 — Subsequent `/wr-itil:work-problems` iter 2 (P018 fix, single iteration)

Scope: one additional `/wr-itil:work-problems` AFK iter dispatched after the trail above; worked P018 (pre-commit diff-filter R gap). No AskUserQuestion calls fired.

| Call # | Header | Classification | Citation                                  |
| ------ | ------ | -------------- | ----------------------------------------- |
| (none) | —      | —              | No AskUserQuestion invocations this iter. |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

Notes: every decision this iter was framework-resolved.

- Selection of P018 over P010 / P011 (all WSJF 6.0) — orchestrator's "skip upstream-blocked tickets with `## Reported Upstream`" directive applied mechanically; P018 then won within-tier by tie-break rung 3 (Effort S < M).
- Architect + JTBD gate reviews delegated via Agent tool — standard gate-satisfaction loop, both PASS, no direction-setting.
- TDD-RED → GREEN flow: failing test added first, hook fix committed second — standard project TDD discipline.
- Risk-scorer flagged commit 1 at 6/25 (above appetite) due to staged RED test; auto-applied R3 (split commit — defer test to fix commit). Re-scored to 1/25. Per ADR-042 Rule 2 auto-apply (silent agent action when scorer surfaces a concrete remediation).
- Commit subject form `docs(problems): known error P018 — ...` then `fix(husky): widen ...` — lowercase first token per P010 commitlint subject-case lesson (recovered from first-try sentence-case rejection by re-emitting verb-first).
- Open → Known Error → Verification Pending transition in two commits (`779ab10` + `a45ede6`) — ADR-022 + ADR-014 single-commit grain; P062 README refresh in both transitions; P134 line-3 discipline applied with displaced fragment rotation to README-history.
- P062 README render — chose to keep existing structure without ADR-076 Origin column (matched iter 1's precedent — adopter project hasn't adopted Origin tier locally).
- ADR-0016 Confirmation criterion #2 literal updated (ACM → ACMR with P018 citation) — architect-recommended doc-hygiene edit, applied silently.
- Same-session evidence observation: commit `a45ede6` itself was a rename-with-edit (the verifying/018-\*.md file). The new hook ran for that commit and listed the renamed file in its auto-write log — the exact failure mode P018 describes did NOT recur. Same-session verifying excluded from Step 4a close-on-evidence per the documented exclusion; recorded here for cross-session reference.

No framework-resolvable decision was sub-contracted back to the user. The architect/JTBD/risk-scorer delegations are gate-satisfaction, NOT lazy.

---

## 2026-05-30 — Subsequent `/wr-itil:work-problems` iter 3 (P013 investigation knock-off, single iteration)

Scope: one additional `/wr-itil:work-problems` AFK iter dispatched after the trail above; worked P013 (overrides-blindness) via docs-only investigation knock-off — checked off two of three remaining investigation tasks (`fixAvailable` reliability research; live-case validation of the mislabel gap). No AskUserQuestion calls fired.

| Call # | Header | Classification | Citation                                  |
| ------ | ------ | -------------- | ----------------------------------------- |
| (none) | —      | —              | No AskUserQuestion invocations this iter. |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

Notes: every decision this iter was framework-resolved.

- Selection of P013 over P006 / P017 / P019 — orchestrator's "skip upstream-blocked" directive applied mechanically to P010/P011/P012/P017/P019; P006 skipped because three structural-fix shapes are genuinely undecided (ADR-044 category-1 direction-setting) AND target upstream @windyroad/itil SKILL.md. Within remaining locally-fixable candidates, P013 beat P014 on tie-break rung 5 (ID asc; both WSJF 2.25, both L, both 2026-05-25).
- Refusal to invoke `/wr-itil:capture-rfc` or `/wr-itil:manage-rfc` for the P013 substantive fix path — manage-rfc delegates to capture-rfc for new RFC creation; capture-\* is orchestrator-forbidden, and either path would fire AskUserQuestion mid-loop (P135 violation). Direction-setting deferred; substantive RFC creation queued for next interactive session via outstanding_questions. ADR-074 substance-confirm-before-build correctly NOT fired this iter because no implementation work was about to be built — the fix-direction decision the iter explicitly avoided is itself the substance.
- Scope chosen as docs-only investigation: knocked off `fixAvailable` reliability research (observed `fixAvailable: true` on live npm 11.x audit) AND live-case validation (confirmed `dry-aged-deps --check` still mislabels brace-expansion as unfixable despite `fixAvailable: true`). Both are concrete RFC inputs that don't pre-empt the RFC's API design.
- Commit subject form `docs(problems): investigation findings on P013 — fixAvailable + live-case` — lowercase first token. First attempt failed commitlint with subject `docs(problems): P013 investigation — ...` (uppercase first word "P013"). Recovered by re-emitting with lowercase first token per P010 commitlint subject-case lesson (now observed on this skill's third iter — pattern stable).
- README refresh skipped — Step 6 P094 conditional refresh only fires when Priority / Effort / WSJF lines change; this update only touched Investigation Tasks + added a Findings subsection. Framework-resolved (matched documented trigger rule mechanically).
- Risk-scorer pipeline verdict: commit=2/25, push=1/25, release=1/25 (all within Very Low appetite). Standard gate-satisfaction loop, not direction-setting.
- JTBD review of THIS retro append PASS with scope correction — this project's JTBD-001 is "See which dependencies have safe updates available" (CLI flow); my initial framing conflated it with the upstream `/wr-itil:work-problems` orchestrator's JTBDs. Retro trail files correctly do NOT map to any documented user-facing JTBD here; they serve the autonomous-workflow tooling layer (ADR-044 / P135). Out-of-JTBD-scope is the correct verdict; no `docs/jtbd/` update required.
- Architect review of THIS retro append PASS — append is documentation of an executed session under `docs/retros/`, not a code change; consistent with local ADR-0010 through ADR-0022 (no conflicts) and with upstream framework concepts (ADR-044, ADR-074, P135, P094, P101, ADR-043) the project treats as referenced concepts. No new local ADR required.

The P013 substantive fix path (RFC creation) remains genuinely blocked by the AFK constraints — that's a structural property of the orchestrator's loop, not a lazy-deferral failure. The decision to defer is framework-resolved (ADR-044: framework-mediated zone when capture-\* / AskUserQuestion are gated out → record the gap, surface in outstanding_questions, move on).

### Context Usage (Cheap Layer, P101)

| Bucket             | Bytes  | % of total | Δ vs prior                       |
| ------------------ | ------ | ---------- | -------------------------------- |
| memory             | 356534 | 43.9%      | no prior snapshot                |
| decisions          | 233815 | 28.8%      | no prior snapshot                |
| problems           | 155520 | 19.2%      | no prior snapshot                |
| jtbd               | 40956  | 5.0%       | no prior snapshot                |
| briefing           | 24609  | 3.0%       | no prior snapshot                |
| project-claude-md  | 5786   | 0.7%       | no prior snapshot                |
| hooks              | 0      | 0.0%       | not measured — n/a               |
| skills             | 0      | 0.0%       | not measured — n/a               |
| framework-injected | —      | —          | not measured — no on-disk source |

THRESHOLD bytes=10240 — six of eight measured buckets exceed (memory, decisions, problems, jtbd, briefing, project-claude-md). Per-plugin breakdown available in /wr-retrospective:analyze-context (deep layer). No prior snapshot file under `docs/retros/*-context-analysis.md` — first measurement; deltas marked as `no prior snapshot — first measurement this project` per ADR-026.

Deep analysis recommended — invoke /wr-retrospective:analyze-context (six over-threshold buckets, no prior snapshot to confirm trend). Non-blocking advisory.
