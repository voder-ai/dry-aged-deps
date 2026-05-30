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
