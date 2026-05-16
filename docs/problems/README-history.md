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

(empty placeholder — fragments rotate here as new "Last reviewed" lines displace old ones)

## 2026-05-13

- P003 transitioned Known Error → Verification Pending (fix landed: `.husky/pre-commit` now runs `format:check` per ADR-0013; awaiting user verification of clean post-commit working tree).
- P003 closed on agent-evidence (read-only `format:check` hook held clean across iter 2's commit cycle AND the v2.7.1 drain push; ADR-022 agent-evidence closure sanctioned by user via /wr-itil:work-problems Step 2.5 routing). Dev-work queue empty; 2 tickets (P001, P002) remain in Verification Queue.
