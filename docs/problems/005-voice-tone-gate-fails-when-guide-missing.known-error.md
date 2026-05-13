# Problem 005: `wr-voice-tone:agent` returns FAIL when `docs/VOICE-AND-TONE.md` is missing

**Status**: Known Error
**Reported**: 2026-05-13
**Priority**: 2 (Very Low) — Impact: Minor (2) x Likelihood: Rare (1) — for THIS project, likelihood drops to Rare because docs/VOICE-AND-TONE.md was bootstrapped in 47143c4; the upstream concern (other adopter projects) is the remaining work
**Effort**: S — upstream already reported (#124); local follow-up is verification when upstream lands
**WSJF**: 4.0 = (2 × 2.0) / 1
**Type**: technical

## Description

The `wr-voice-tone:agent` subagent returns FAIL on every invocation in this project because `docs/VOICE-AND-TONE.md` does not exist. The agent's reported reason: "the guide is missing and must be created before this copy can be approved".

The gate is wired correctly (it runs on every commit-gate flow), but its input artefact is absent. There are two reasonable upstream behaviours, neither implemented today:

1. **Self-bootstrap on first run** — when `docs/VOICE-AND-TONE.md` is missing, the agent could invoke `/wr-voice-tone:update-guide` (or equivalent bootstrap path) inline rather than fail. This matches the user's framing: "the plugin should self bootstrap".
2. **Fail-open with prompt** — when the guide is missing, treat the gate as PASS-with-warning and emit a one-line "Run /wr-voice-tone:update-guide to enable voice-tone reviews" message. Adopter projects that haven't opted in to voice-tone shouldn't be blanket-blocked.

Today the gate produces a blanket FAIL with no actionable signal — every commit gate flow that delegates to the voice-tone agent gets a FAIL that has to be ignored as meta-level noise (content reviews PASS independently). Across the 2026-05-13 `/wr-itil:work-problems` session (3 iters + 3 follow-up commits), the agent FAIL fired ~6 times and was always overridden as meta-level.

User direction at /wr-itil:work-problems Step 2.5 routing: "bootstrap the guide and report upstream - the plugin should self bootstrap". This ticket captures the upstream request; the project-side bootstrap is being handled in parallel via `/wr-voice-tone:update-guide`.

Initial estimate: Impact 2 (Minor — gate FAIL is meta-only; content reviews pass independently) × Likelihood 5 (Almost certain — fires on every commit in projects without the guide). Effort S (filing the upstream issue; upstream fix scope is in `@windyroad/voice-tone`). The placeholder Priority/Effort lines above will be re-rated at next `/wr-itil:review-problems`.

## Symptoms

(deferred to investigation)

## Workaround

(deferred to investigation — for THIS project: parallel bootstrap of `docs/VOICE-AND-TONE.md` via `/wr-voice-tone:update-guide` closes the gap locally; the upstream improvement still benefits other adopter projects.)

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: (deferred to investigation)
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] File the upstream report against `@windyroad/voice-tone` via `/wr-itil:report-upstream P005`. Suggested upstream framing: choose between (a) self-bootstrap on first run or (b) fail-open-with-prompt; both are improvements over blanket FAIL.
- [ ] When upstream lands the fix: verify in this project that the agent returns PASS-with-warning (option b) OR auto-bootstrapped successfully (option a). Then close P005.

## Dependencies

- **Blocks**: (none — the project-side bootstrap of docs/VOICE-AND-TONE.md is the local unblock)
- **Blocked by**: upstream `@windyroad/voice-tone` (capability gap; report-upstream pending)
- **Composes with**: (none)

## Related

- `@windyroad/voice-tone` plugin — upstream framework code (the `wr-voice-tone:agent` definition).
- `/wr-voice-tone:update-guide` — the existing bootstrap path; the upstream improvement is to invoke it (or its content-generation logic) when the guide is missing rather than fail.
- 6+ observed gate FAILs in the 2026-05-13 work-problems session — empirical evidence of the friction frequency.
- **Reported upstream**: <https://github.com/windyroad/agent-plugins/issues/124> (2026-05-13)

(captured via /wr-itil:capture-problem; expand at next investigation)

## Reported Upstream

- **URL**: <https://github.com/windyroad/agent-plugins/issues/124>
- **Reported**: 2026-05-13
- **Template used**: problem-report.yml (problem-shaped, matched per ADR-033 classifier)
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes — upstream issue body includes `voder-ai/dry-aged-deps` cross-reference URL and P005 reference per Step 7 contract
