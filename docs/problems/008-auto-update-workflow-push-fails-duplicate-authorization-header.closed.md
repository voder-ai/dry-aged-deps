# Problem 008: auto-update workflow push fails with duplicate `Authorization` header

**Status**: Closed
**Reported**: 2026-05-14
**Closed**: 2026-05-16 — verified end-to-end via workflow run 25953546547 and auto-merged PR #8 (merge commit `d8d80b9`, 2026-05-16T05:14:58Z)
**Priority**: 10 (High) — Impact: Minor (2) x Likelihood: Almost certain (5) — fires every dispatched run that has a real update to push
**Effort**: S — single-line workflow change in the Push branch step (swap `git -c http.extraheader=bearer` for URL-embedded `x-access-token` basic auth); verification is one workflow_dispatch
**WSJF**: 0 (Closed; excluded per ADR-022)
**Type**: technical

## Description

`.github/workflows/auto-update.yml` fails at the `Push branch` step with HTTP 400 and the remote error `Duplicate header: "Authorization"`. The push command embeds an Authorization header via `git -c "http.https://github.com/.extraheader=AUTHORIZATION: bearer $APP_TOKEN"`, but `actions/checkout@v4` had already injected its own `http.https://github.com/.extraheader` into the local git config. The manual `-c` flag adds a second header rather than overriding the first; git transmits both, and github.com rejects the request.

Observed on workflow run `25805539989` (2026-05-13, after lifting the `globals` exclude per P001's verification trigger). All earlier steps succeeded — `Check for safe updates`, `Apply updates`, `Validate via prepush`, `Commit`, and importantly `Mint GitHub App installation token` (ADR-0012 OIDC exchange). The push is the only failing step, and it blocks `Open pull request` and `Enable auto-merge`, which means ADR-0009 §Confirmation criterion 4 (single `workflow_dispatch` opens a PR) remains unverified.

Failing log lines:

```
remote: Duplicate header: "Authorization"
fatal: unable to access 'https://github.com/voder-ai/dry-aged-deps/': The requested URL returned error: 400
##[error]Process completed with exit code 128.
```

The bug is in the workflow, not in the OIDC mint — the minted App token itself is valid. Fix candidates (defer to investigation for selection):

1. Set `persist-credentials: false` on the `actions/checkout@v4` step so checkout does not inject a long-lived `extraheader`.
2. Unset the checkout-injected header before pushing: `git config --unset-all http.https://github.com/.extraheader` immediately before the manual push.
3. Switch to URL-embedded token push: `git push "https://x-access-token:$APP_TOKEN@github.com/${{ github.repository }}" "$BRANCH"`.

Option 1 is the canonical pattern documented by `actions/checkout` for "push as a different identity than the checkout actor"; options 2 and 3 are mechanical workarounds.

This problem is the next blocker on ADR-0009's autonomous-workflow verification path. P001 (the immediate prior blocker) is verified end-to-end as of run 25805539989 — the workflow successfully detected, applied, and committed the safe update; only the push handoff to the App-token identity is broken.

## Symptoms

- `Push branch` step exits 128 in every dispatched run that has a real update to push.
- `Open pull request` and `Enable auto-merge` steps are skipped because their `if:` clauses depend on prior steps.
- No PR appears on GitHub even though the local commit was created.
- Prior runs short-circuited at `Check for safe updates` before reaching `Push branch` (P001 was masking this bug), so the failure surfaced only after P001's fix landed and `globals` was un-excluded.

## Workaround

Manual dependency updates via local `npm run start` + a hand-opened PR. The autonomous workflow is the _only_ affected surface — every other path (the CLI itself, manual PR opening, normal CI) is unaffected, so no end-user is blocked. This workaround is the standing pre-P008 process; it is acceptable as a holding pattern until the fix lands.

## Impact Assessment

- **Who is affected**: Maintainers of this repository. The autonomous dependency-update workflow does not deliver value to end-users of the published `dry-aged-deps` CLI (they consume releases; the workflow keeps the _tool's own_ deps fresh). Indirect downstream effect: published releases ship slightly staler dependency baselines than they would with the autonomous workflow running.
- **Frequency**: Fires every dispatched run that has a real update to push (likelihood 5 — almost certain on any run with work).
- **Severity**: Minor (2). Maintainer-facing only; no production traffic affected; clean workaround exists; no data loss; no security implication.
- **Analytics**: GitHub Actions run logs — workflow run `25805539989` is the canonical failing artefact.

## Root Cause Analysis

**Two-layer bug. Layer 1 was masking layer 2.**

### Layer 1 (the surface symptom — fixed in v2.7.2; insufficient)

`actions/checkout@v4` defaults to `persist-credentials: true`, which writes a `GITHUB_TOKEN`-derived `http.https://github.com/.extraheader=AUTHORIZATION: basic <base64>` entry into the runner's local git config. The `Push branch` step then runs `git -c "http.https://github.com/.extraheader=AUTHORIZATION: bearer $APP_TOKEN" push ...`, which **adds** a second `Authorization` header rather than replacing the first. github.com rejects requests carrying two `Authorization` headers with HTTP 400 and `Duplicate header: "Authorization"`.

This is the layer captured in the original ticket. v2.7.2 (commit `c43e402`) added `persist-credentials: false` to the Checkout step. That eliminated the duplicate header.

### Layer 2 (uncovered by the v2.7.2 fix)

Once the duplicate-header rejection was gone, the next dispatched run (workflow run `25905430469`, 2026-05-15) failed at Push branch with a different error:

```
fatal: could not read Username for 'https://github.com': No such device or address
##[error]Process completed with exit code 128.
```

The auth scheme `AUTHORIZATION: bearer $APP_TOKEN` is wrong for git transport. **Bearer auth works for the GitHub API but NOT for git push** of GitHub App installation tokens. Per GitHub's documentation, App installation tokens for git transport must use HTTP Basic auth with username `x-access-token` and the token as password (the same pattern `actions/checkout` itself uses with `basic <base64(x-access-token:TOKEN)>`).

The duplicate-header rejection in layer 1 was returning HTTP 400 BEFORE the auth scheme could be evaluated, so the bearer-vs-basic bug stayed masked. With layer 1 cleared, the request now reaches the auth-evaluation stage where git, finding the `bearer` scheme unusable for transport, falls back to prompting for a username — which fails non-interactively.

**Fix decision (amended 2026-05-15)**: candidate 3 from the original analysis — URL-embedded basic auth.

```yaml
git push --set-upstream "https://x-access-token:${APP_TOKEN}@github.com/${{ github.repository }}.git" \
"${{ steps.branch.outputs.branch }}"
```

Rationale:

- Uses the documented, App-token-supported auth scheme (HTTP Basic with `x-access-token` username).
- Keeps the App identity at push time — JTBD-104's "PR is authored by an identifiable bot account" outcome is preserved (`x-access-token` IS the App identity for git).
- More cleanly satisfies ADR-0012 §Confirmation criterion 3 than candidate 1 — the App token is positively the auth credential, not just "the only one left after removing the GITHUB_TOKEN extraheader".
- v2.7.2's `persist-credentials: false` setting stays in place — it's still the right thing for the Checkout step regardless of the auth scheme used at push.
- Architect review (2026-05-15): PASS, no new ADR required — mechanical implementation correction within ADR-0012's intent.
- JTBD review (2026-05-15): PASS — preserves App identity at push.

**Why candidate 1 was the wrong original pick**: it treated the symptom (duplicate header) without verifying the underlying auth scheme worked. Lesson: when fixing a "request rejected at HTTP 400" bug, the request had to be both well-formed AND well-authenticated to succeed; fixing only the former leaves the latter untested.

**Reproduction**:

- Layer 1: workflow run `25805539989` (2026-05-13) — `Duplicate header: "Authorization"`, HTTP 400.
- Layer 2: workflow run `25905430469` (2026-05-15, post-v2.7.2) — `fatal: could not read Username for 'https://github.com'`, exit 128.

### Investigation Tasks

- [x] Confirm `actions/checkout@v4` is injecting `http.https://github.com/.extraheader` in this repo — confirmed.
- [x] Choose between fix candidates 1/2/3 — candidate 1 chosen 2026-05-14, then revised to candidate 3 on 2026-05-15 after layer-1-only fix exposed layer 2.
- [x] Apply candidate 1 fix (v2.7.2, c43e402) — landed.
- [x] Re-dispatch and observe layer-2 failure — workflow run 25905430469.
- [x] Apply candidate 3 fix to `.github/workflows/auto-update.yml` — landed in v2.7.3 (commit `6e77c59`).
- [x] Re-dispatch the workflow and confirm `Push branch` succeeds + a PR is opened with the App-token identity — workflow run 25953546547 (2026-05-16): every step green, including `Push branch`, `Open pull request`, and `Enable auto-merge (squash)`. PR #8 authored by `app/claude`.
- [x] Close out ADR-0009 §Confirmation criterion 4 — verified by PR #8 (merge commit `d8d80b9`, 2026-05-16T05:14:58Z). PR opened end-to-end + auto-merged after `Build & Test` passed. ADR-0009 §c7 (autonomous scheduled runs landing PRs without human intervention) also exercised on this dispatch — same auto-merge surface.

## Dependencies

- **Blocks**: ADR-0009 §Confirmation criterion 4 (single `workflow_dispatch` opens a PR end-to-end); ADR-0009 §Confirmation criterion 7 (two consecutive successful scheduled runs land their PRs onto `main` without human intervention) — the second criterion compounds on top of this one.
- **Blocked by**: (none) — P001's fix has already landed, so the workflow now reliably has work to push.
- **Composes with**: ADR-0012 OIDC mint (now verified end-to-end up to but not including the push handoff).

## Prior fix attempt (insufficient)

**v2.7.2 (c43e402, 2026-05-14)** — applied candidate 1 (`persist-credentials: false` on the Checkout step). Fixed layer 1 (duplicate Authorization header) but exposed the previously-masked layer 2 (bearer-vs-basic auth scheme mismatch for git transport). Workflow run 25905430469 (2026-05-15) failed at Push branch with `fatal: could not read Username`. Ticket flipped Verification Pending → Known Error to land the layer-2 fix.

`persist-credentials: false` remains in the workflow regardless — it's still the right thing for the Checkout step. Candidate 3's URL-embedded basic auth replaces only the Push branch step's command.

## Fix Released

**Release marker (layer 1)**: dry-aged-deps@v2.7.2 (semantic-release publish in CI run 25828401978, 2026-05-14). Commit `c43e402` — `fix(ci): set persist-credentials: false on auto-update checkout (closes P008)`. Cleared the duplicate-Authorization-header surface symptom but left layer 2 unaddressed.

**Release marker (layer 2)**: dry-aged-deps@v2.7.3 (semantic-release publish triggered by commit `6e77c59` on 2026-05-15). Commit message: `fix(ci): use URL-embedded x-access-token basic auth for auto-update push (closes P008)`.

**Fix summary** (combined): the v2.7.2 fix added `persist-credentials: false` to the `actions/checkout@v4` step (eliminating the duplicate `Authorization` header). The v2.7.3 fix replaced the Push branch step's `git -c http.extraheader=AUTHORIZATION: bearer $APP_TOKEN push origin ...` with URL-embedded basic auth: `git push --set-upstream https://x-access-token:${APP_TOKEN}@github.com/${{ github.repository }}.git "$BRANCH"`. Both changes are needed — `persist-credentials: false` clears the conflicting GITHUB_TOKEN extraheader; `x-access-token` basic auth uses the documented git-transport auth scheme for App installation tokens.

## Verification

**Workflow run 25953546547** (2026-05-16, post-v2.7.3 dispatch) — every step green:

- ✓ Check for safe updates — found `globals` 17.4.0 → 17.6.0
- ✓ Apply updates + Commit
- ✓ Mint GitHub App installation token
- ✓ **Push branch** — no duplicate-header rejection, no auth error
- ✓ **Open pull request** — PR #8 opened, authored by `app/claude` (the Claude Code GitHub App identity)
- ✓ **Enable auto-merge (squash)** — enabled at 2026-05-16T05:12:53Z by `app/claude`
- ✓ `ci-publish.yml` `pull_request` workflows triggered on PR #8 (CodeQL Analysis, Build & Test, CodeQL — all SUCCESS)
- ✓ Auto-merge fired — PR #8 merged to main at 2026-05-16T05:14:58Z, merge commit `d8d80b9`

ADR-0009 §Confirmation criterion 4 (single `workflow_dispatch` opens a PR end-to-end) **verified**.
ADR-0009 §Confirmation criterion 7 (consecutive runs land PRs without human intervention) — the auto-merge mechanism is now proven; arming the daily cron remains a follow-up unblocked by this closure.

**In-session evidence**: no in-session exercise possible — the failure surface is the live GitHub Actions runner. The fix uses the documented `x-access-token` HTTP Basic pattern that GitHub explicitly recommends for App installation tokens with git transport. Confidence is higher than for the v2.7.2 attempt because the auth scheme is now correct rather than just unconflicted; the layer-2 bug is the proximate cause of the post-v2.7.2 failure, so closing it should unblock the verification path.

## Related

- **ADR-0009** (`docs/decisions/0009-scheduled-dependency-update-workflow.proposed.md`) — autonomous workflow contract whose end-to-end verification this problem blocks.
- **ADR-0012** (`docs/decisions/0012-autonomous-workflow-authentication-mechanism.proposed.md`) — OIDC token-exchange mechanism. The mint step itself works; the handoff to git push is what's broken.
- **P001** (`docs/problems/001-update-skips-exact-pinned-deps.verifying.md`) — prior blocker on the same verification path. Verified by run 25805539989's `Apply updates` step.
- `.github/workflows/auto-update.yml` lines 179-190 — the failing `Push branch` step.
- GitHub Actions run 25805539989 — first run to surface this failure (after the P001 fix unblocked the path to the push step).

(captured via /wr-itil:capture-problem; expand at next investigation)
