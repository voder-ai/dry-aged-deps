# Problem 008: auto-update workflow push fails with duplicate `Authorization` header

**Status**: Known Error
**Reported**: 2026-05-14
**Priority**: 10 (High) — Impact: Minor (2) x Likelihood: Almost certain (5) — fires every dispatched run that has a real update to push
**Effort**: S — single-line workflow change (`persist-credentials: false` on `actions/checkout@v4` is the canonical fix); verification is one workflow_dispatch
**WSJF**: 20.0 = (10 × 2.0) / 1
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

**Confirmed mechanism**: `actions/checkout@v4` defaults to `persist-credentials: true`, which writes a `GITHUB_TOKEN`-derived `http.https://github.com/.extraheader=AUTHORIZATION: basic <base64>` entry into the runner's local git config. The `Push branch` step then runs `git -c "http.https://github.com/.extraheader=AUTHORIZATION: bearer $APP_TOKEN" push ...`, which **adds** a second `Authorization` header to the request rather than replacing the first (the `-c` flag appends a config value of the same key; it does not unset prior values). github.com rejects requests carrying two `Authorization` headers with HTTP 400 and `Duplicate header: "Authorization"`.

**Fix decision**: candidate 1 — set `persist-credentials: false` on the `actions/checkout@v4` step. Rationale:

- Canonical pattern documented by `actions/checkout` for "push as a different identity than the checkout actor".
- Removes the source of the conflict at its origin rather than working around it downstream.
- Brings the implementation into stricter conformance with ADR-0012 §Confirmation criterion 3 ("the minted App token, not `GITHUB_TOKEN`, is used for git push"). Today both are present; the fix leaves only the App token.
- Strengthens JTBD-104's "PR is authored by an identifiable bot account, not impersonating a human" outcome (the App identity is the only push identity remaining).
- Architect review (2026-05-14): PASS, no new ADR required — mechanical implementation of existing ADR-0012 intent.
- JTBD review (2026-05-14): PASS — serves JTBD-103, JTBD-104, JTBD-106 cleanly.

Candidates 2 (`git config --unset-all` before push) and 3 (URL-embedded token) are mechanical workarounds; both work but neither is the canonical pattern.

**Reproduction**: dispatch the workflow via `gh workflow run auto-update.yml` on a state where `npm outdated` reports at least one safe update. The `Push branch` step exits 128 with `Duplicate header: "Authorization"`. No test fixture is required — workflow run `25805539989` is the in-history reproduction artefact.

### Investigation Tasks

- [x] Confirm `actions/checkout@v4` is injecting `http.https://github.com/.extraheader` in this repo — confirmed via `actions/checkout` documentation; `persist-credentials: true` is the documented default behaviour. Workflow run `25805539989` is the empirical reproduction.
- [x] Choose between fix candidates 1/2/3 above; document the choice — candidate 1 selected, rationale documented above.
- [ ] Apply the chosen fix to `.github/workflows/auto-update.yml` — pending in this session.
- [ ] Re-dispatch the workflow and confirm `Push branch` succeeds + a PR is opened with the App-token identity (so the PR triggers `pull_request` workflows, per ADR-0009 §Required branch-protection configuration and ADR-0012 §Mechanism) — user verification step post-release.
- [ ] Close out ADR-0009 §Confirmation criterion 4 once a PR has been opened end-to-end — depends on the verification dispatch.

## Dependencies

- **Blocks**: ADR-0009 §Confirmation criterion 4 (single `workflow_dispatch` opens a PR end-to-end); ADR-0009 §Confirmation criterion 7 (two consecutive successful scheduled runs land their PRs onto `main` without human intervention) — the second criterion compounds on top of this one.
- **Blocked by**: (none) — P001's fix has already landed, so the workflow now reliably has work to push.
- **Composes with**: ADR-0012 OIDC mint (now verified end-to-end up to but not including the push handoff).

## Related

- **ADR-0009** (`docs/decisions/0009-scheduled-dependency-update-workflow.proposed.md`) — autonomous workflow contract whose end-to-end verification this problem blocks.
- **ADR-0012** (`docs/decisions/0012-autonomous-workflow-authentication-mechanism.proposed.md`) — OIDC token-exchange mechanism. The mint step itself works; the handoff to git push is what's broken.
- **P001** (`docs/problems/001-update-skips-exact-pinned-deps.verifying.md`) — prior blocker on the same verification path. Verified by run 25805539989's `Apply updates` step.
- `.github/workflows/auto-update.yml` lines 179-190 — the failing `Push branch` step.
- GitHub Actions run 25805539989 — first run to surface this failure (after the P001 fix unblocked the path to the push step).

(captured via /wr-itil:capture-problem; expand at next investigation)
