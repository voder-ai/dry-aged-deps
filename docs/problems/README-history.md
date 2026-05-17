# Problem Backlog — Line 3 History

Archive of displaced `docs/problems/README.md` line 3 "Last reviewed" fragments per P134 (the line 3 accumulator-doc carve-out). Newest fragments append at the bottom under date headings; earlier fragments stay above for grep+tail browsing.

## 2026-05-14

- README reconciled — 4 drift entries corrected: P004, P005, P006, P007. Reconciliation contract per P118 + ADR-014 amended ("Reconciliation as preflight robustness layer").
- P001 closed (verified end-to-end via `auto-update.yml` run 25805539989); P004/P005/P007 auto-transitioned Open → Known Error; P008 captured (auto-update workflow push fails with duplicate `Authorization` header).
- P008 known error — duplicate `Authorization` from `actions/checkout@v4`'s `persist-credentials: true` default conflicting with the manual App-token `-c http.extraheader=...` on push. Architect + JTBD reviews PASS; fix is single-line workflow change.
- P008 verification pending — `persist-credentials: false` added to `actions/checkout@v4` in `.github/workflows/auto-update.yml`; awaiting `gh workflow run auto-update.yml` dispatch to confirm `Push branch` succeeds and a PR opens under the App identity (ADR-0009 §Confirmation criterion 4).

## 2026-05-15

- P008 flipped Verification Pending → Known Error. v2.7.2's candidate-1 fix (persist-credentials: false) cleared the duplicate-header surface symptom but exposed the previously-masked bearer-vs-basic auth-scheme bug for git transport (workflow run 25905430469 failed with "fatal: could not read Username"). Layer-2 fix in flight: switch Push branch to URL-embedded `x-access-token` basic auth (P008 candidate 3).
- P008 verification pending again (layer-2 fix). Push branch step swapped from `git -c http.extraheader=bearer` to URL-embedded `x-access-token` basic auth (P008 candidate 3) — the GitHub-documented auth scheme for App installation tokens over git transport. v2.7.2's `persist-credentials: false` stays on the Checkout step. Awaiting one more `gh workflow run auto-update.yml` dispatch to confirm Push branch succeeds end-to-end.

## 2026-05-16

- P008 **closed**. Verified end-to-end via workflow run 25953546547: Push branch succeeded, PR #8 opened by `app/claude`, auto-merge enabled, `Build & Test` passed, PR auto-merged to main (commit `d8d80b9`). ADR-0009 §Confirmation criterion 4 satisfied. Autonomous loop is now load-bearing — daily cron can be armed in a follow-up.
- P002 **closed** (release-trigger heuristic verified by v2.7.3 drain's "Commits include release-triggering types" line). Verification Queue is empty. Dev-work queue top: P004 (WSJF 16.0). Autonomous-loop verification complete (P008 closed earlier this session); daily cron can be armed in a follow-up.
- P009 captured (Edit-tool markdown writes skip prettier; pre-commit format:check fails — observed ≥5 times in this retro's parent session). Captured at deferred Priority/Effort placeholders; re-rate at next `/wr-itil:review-problems`. Dev-work queue top: P004 (WSJF 16.0). Verification Queue empty.
- P004 parked (`upstream-blocked` on windyroad/agent-plugins#123, filed 2026-05-13). Local work complete: upstream issue filed + ADR-0015 narrow exception keeps the project unblocked. Un-park trigger: upstream issue closes. Dev-work queue top now P007 (WSJF 10.0). Verification Queue empty. Parked: 1 (P004).
- P007 parked (`upstream-blocked` on `@windyroad/risk-scorer`). Both fix paths land upstream: Option 2 (grant Bash to `wr-risk-scorer:external-comms` subagent for `shasum`) recommended as the smaller change; Option 1 (hook recomputes key from draft + surface) preserved as the cleaner follow-up refactor. Un-park trigger: upstream ships either path. Dev-work queue top now P005 (WSJF 4.0). Verification Queue empty. Parked: 2 (P004, P007).
- P005 parked (`upstream-blocked` on `@windyroad/voice-tone`). Upstream issue [windyroad/agent-plugins#124](https://github.com/windyroad/agent-plugins/issues/124) already filed 2026-05-13; this project's `docs/VOICE-AND-TONE.md` was bootstrapped in commit 47143c4 so the gate works locally — the upstream improvement (self-bootstrap or fail-open-with-prompt) benefits other adopter projects. Un-park trigger: upstream issue #124 closes. Dev-work queue top now P006 (WSJF 3.0). Verification Queue empty. Parked: 3 (P004, P005, P007).

## 2026-05-17

- P009 fix released. ADR-0013 (`pre-commit hook read-only policy`) superseded by **ADR-0016** (`pre-commit hook auto-write and re-stage policy`). The `.husky/pre-commit` hook now formats staged files via `prettier --write --ignore-unknown` and re-stages via `git add` BEFORE the commit completes, so the formatted output lands IN the commit and the working tree stays clean post-commit. The existing read-only contract test was rewritten to `REQ-PRECOMMIT-AUTO-WRITE-RESTAGE` under ADR-0016. P009 → Verification Pending; close trigger: ≥ 3 consecutive markdown-touching commits land cleanly without manual `npm run format` retry. Dev-work queue top: P006 (WSJF 3.0). Verification Queue: 1 (P009). Parked: 3 (P004, P005, P007).

## 2026-05-13

- P003 transitioned Known Error → Verification Pending (fix landed: `.husky/pre-commit` now runs `format:check` per ADR-0013; awaiting user verification of clean post-commit working tree).
- P003 closed on agent-evidence (read-only `format:check` hook held clean across iter 2's commit cycle AND the v2.7.1 drain push; ADR-022 agent-evidence closure sanctioned by user via /wr-itil:work-problems Step 2.5 routing). Dev-work queue empty; 2 tickets (P001, P002) remain in Verification Queue.
