---
status: 'proposed'
date: 2026-05-12
decision-makers: ['Tom Howard']
consulted: []
informed: []
reassessment-date: 2026-08-12
---

# 0012. Authentication Mechanism for Autonomous GitHub Workflows

## Context and Problem Statement

ADR-0009 establishes a scheduled GitHub Actions workflow (`auto-update.yml`) that opens a `chore(deps):` / `fix(deps):` PR, runs the existing `ci-publish.yml` build-and-test gate via that PR, and squash-merges on green. ADR-0010 establishes a recovery workflow (`auto-update-recover.yml`) that performs git operations on PR branches when the agent finishes.

Both workflows need a way to authenticate to GitHub for `git push`, `gh pr create`, `gh pr merge --auto --squash`, `gh pr close`, `gh pr comment`, `gh pr edit`, and similar operations.

The workflow-scoped `GITHUB_TOKEN` has a hard platform constraint: pushes and PR-opens performed with it do not trigger downstream `pull_request`-event workflows. `ci-publish.yml` listens on `pull_request`, so a PR opened with `GITHUB_TOKEN` would never be CI-gated — breaking the auto-merge contract that depends on the `Build & Test` required check. Some other actor identity is required for at least the PR-creation step.

This ADR records the choice of that other actor identity. It was initially folded into ADR-0009 as the `DEPS_BOT_TOKEN` clause and into ADR-0010 as the `ANTHROPIC_API_KEY` secret-management section, but the architect's review of those amendments determined the choice is consequential enough — and the alternatives broad enough — to deserve its own decision record that both ADRs reference.

## Decision Drivers

- **Minimal manual provisioning.** This is a single-maintainer project. Any auth mechanism that requires manual browser-side credential creation imposes ongoing setup and rotation cost.
- **Secret rotation cost.** Long-lived PATs require periodic rotation (90-day default for fine-grained PATs); forgetting to rotate breaks the autonomous workflow silently.
- **Third-party endpoint stability.** Mechanisms that depend on runtime calls to non-GitHub infrastructure carry the risk that the third party changes or withdraws the endpoint without notice.
- **Blast radius.** The chosen credential must have the narrowest scopes consistent with the workflows' needs (`contents: write`, `pull_requests: write`, optionally `issues: write` for labels).
- **Audit-trail clarity.** The identity that performs `git push`, `gh pr create`, and `gh pr merge` is visible on every automated PR. Maintainers and auditors must be able to recognise the actor and reason about its authority.
- **Trust-boundary scope (ADR-0010 interaction).** The Claude Code GitHub App is already trusted for the recovery path. Whether that App's authority is broadened to the routine path is itself a trust-model choice.
- **Reversibility.** If the chosen mechanism fails (endpoint withdrawn, App de-installed, etc.), the project must be able to switch to a fallback in hours, not days.
- **TBD compatibility.** Unaffected by auth mechanism; the maintainer's direct pushes to `main` use `GITHUB_TOKEN` and are independent of the bot's credential. Noted only to confirm no constraint is introduced.

## Considered Options

1. **Fine-grained personal access token (PAT) stored as `DEPS_BOT_TOKEN`** — the maintainer manually creates a PAT scoped to this repo with `Contents: read & write` + `Pull requests: read & write`, stores it via `gh secret set DEPS_BOT_TOKEN`. Both workflows reference `secrets.DEPS_BOT_TOKEN`.

2. **Project-owned GitHub App** — create a new GitHub App owned by the maintainer's account, scoped to this repo, with `contents: write` + `pull_requests: write` + `issues: write`. Store the App ID and the App's private key as repo secrets. Each workflow run uses an action like `tibdex/github-app-token` (or equivalent) to mint a short-lived installation access token from the App's private key.

3. **OIDC token-exchange via Anthropic** — the workflow's GitHub-issued OIDC token (audience `claude-code-github-action`) is POSTed to `https://api.anthropic.com/api/github/github-app-token-exchange`, which returns a short-lived installation access token for the already-installed Claude Code GitHub App. No project-side secret is stored.

## Decision Outcome

Chosen option: **OIDC token-exchange via Anthropic** (Option 3), because it eliminates the manual credential-provisioning step entirely, produces short-lived tokens (no rotation cycle), and reuses the existing Claude Code GitHub App installation rather than introducing a new credential surface. The trade is an explicit runtime dependency on an Anthropic-operated endpoint that is not part of any Anthropic public API contract — see the Reversion Plan below for how that is mitigated.

### Mechanism

Each workflow that needs to perform GitHub operations beyond what `GITHUB_TOKEN` permits adds the following:

1. `permissions:` block at the job level includes `id-token: write` (required so the runner can issue OIDC tokens).
2. A `Mint GitHub App token` step performs:
   - GET `${ACTIONS_ID_TOKEN_REQUEST_URL}&audience=claude-code-github-action` with `Authorization: Bearer ${ACTIONS_ID_TOKEN_REQUEST_TOKEN}` to obtain the OIDC token.
   - POST `https://api.anthropic.com/api/github/github-app-token-exchange` with `Authorization: Bearer <oidc-token>` to obtain the installation access token.
   - Captures the returned `token` (or `app_token`) field, masks it via `::add-mask::`, and exports it as a step output.
3. Subsequent steps use the minted token via `GH_TOKEN: ${{ steps.mint.outputs.token }}` for `gh` CLI commands and via the appropriate git remote auth header for `git push`.
4. No `|| true` or other silent-failure patterns are used in the mint step. Failure of either HTTP call fails the workflow loudly.

### Audit-trail implications

The actor visible on the PR's "Opened" event, the branch's "Pushed by" event, and the `gh pr merge --auto` enablement is the Claude Code GitHub App's installation identity. Commit authorship is still set via `git config` to `github-actions[bot]` for blame purposes, but the API-level actor is the Claude Code App. This is a deliberate shift from the original ADR-0009 wording and is acknowledged in the amendments to ADRs 0009 and 0010 that accompany this ADR.

### Reversion Plan

Trigger conditions that warrant reversion to Option 1 (PAT):

1. Two consecutive `auto-update.yml` workflow runs fail at the OIDC-exchange step with 401/403/404/410/5xx from `api.anthropic.com`.
2. Anthropic publishes a change to the `github-app-token-exchange` endpoint, its validation rules, or its OIDC audience requirement that breaks the project's usage.
3. The Claude Code GitHub App is uninstalled from this repository, or has its permissions reduced below `contents: write` + `pull_requests: write` + `issues: write`.
4. The maintainer decides the third-party endpoint dependency is no longer acceptable.

Reversion procedure (deliberately written so it is followable under time pressure):

1. Provision a fine-grained PAT at `https://github.com/settings/personal-access-tokens/new`:
   - Resource owner: `voder-ai`
   - Repository access: only `dry-aged-deps`
   - Permissions: `Contents: read & write`, `Pull requests: read & write`
   - Expiry: 90 days (renew on calendar)
2. `gh secret set DEPS_BOT_TOKEN` (paste the token value when prompted).
3. In a new commit, supersede this ADR (`git mv 0012-...proposed.md 0012-...superseded.md`, add a successor ADR `0013-...proposed.md` selecting Option 1 with the same options enumerated, and add the `superseded-by: 0013` and `supersedes: 0012` frontmatter fields per ADR-0011's lifecycle).
4. Update `.github/workflows/auto-update.yml` and `.github/workflows/auto-update-recover.yml` to:
   - Remove the `Mint GitHub App token` step.
   - Remove `id-token: write` from `permissions:` if no other step needs it.
   - Replace `${{ steps.mint.outputs.token }}` with `${{ secrets.DEPS_BOT_TOKEN }}` for `gh` CLI auth and the git push auth header.
5. Update ADRs 0009 and 0010 to reference the new authentication ADR.
6. Single direct push to `main` (TBD-style) restores the autonomous workflow.

The reversion path is documented here, before it is needed, so that a maintainer responding to an endpoint outage at an inconvenient hour does not have to improvise.

## Consequences

### Good

- **Zero manually-provisioned secrets** for the autonomous workflows. No PAT to create, store, or rotate.
- **Short-lived tokens.** Each workflow run mints a fresh installation access token; if a token is leaked in a log, its blast radius is bounded to the token's lifetime (typically 1 hour).
- **Reuses existing infrastructure.** The Claude Code GitHub App is already installed and authorised; no second App installation or PAT alongside it.
- **No rotation forgetting.** The most common single-maintainer failure mode (forgetting to rotate a PAT before expiry) is eliminated.

### Neutral

- **Audit-trail attribution shifts.** The Claude Code GitHub App's installation actor appears on every routine `chore(deps):` / `fix(deps):` PR rather than only on recovery PRs. This is recorded in the amendment to ADR-0010 and is acceptable given the App already has the necessary permissions and the maintainer is the only consumer of the audit trail.
- **One new step in each workflow** to perform the OIDC exchange. Minimal CI minute cost (~1 second).

### Bad

- **Runtime dependency on a non-public Anthropic endpoint.** `api.anthropic.com/api/github/github-app-token-exchange` is not part of any Anthropic public API contract. Anthropic can change validation rules, OIDC audience expectations, or the URL itself without prior notice. This is the principal cost of this choice; the Reversion Plan above is the mitigation.
- **Trust-boundary broadening.** ADR-0010's deliberate scoping of the Claude Code GitHub App to the recovery path is relaxed: the App's installation now also authenticates the routine path. ADR-0010's "Secret management" section is amended to reflect this, but the underlying trust delta — the App is now the actor on every automated PR, not just failed ones — is real.
- **Endpoint silence is not stability.** Absence of breakage today is not evidence of stability tomorrow. The Reassessment Criteria below name this explicitly.

## Confirmation

This decision is implemented when:

1. `docs/decisions/0012-autonomous-workflow-authentication-mechanism.proposed.md` (this file) exists and is referenced from ADR-0009 (in the Required secrets / Bot identity sections) and ADR-0010 (in the Secret management section).
2. `gh secret list` shows no `DEPS_BOT_TOKEN` secret (or, if it exists from a prior provisioning attempt, it is unused by either workflow).
3. `.github/workflows/auto-update.yml` and `.github/workflows/auto-update-recover.yml` both:
   - Have `id-token: write` in the relevant job's `permissions:` block.
   - Contain a `Mint GitHub App token` step that performs the OIDC exchange.
   - Reference the minted token (not `DEPS_BOT_TOKEN`, not `GITHUB_TOKEN`) for `git push`, `gh pr create`, `gh pr merge`, and any other operation that requires the non-`GITHUB_TOKEN` actor identity.
   - Do NOT contain any `|| true`, `|| echo {}`, or similar silent-failure pattern in the mint step or downstream auth-dependent steps.
4. A single `workflow_dispatch` invocation of `auto-update.yml` successfully mints a token, pushes a branch, opens a PR, and enables auto-merge — verifying the endpoint accepts the project's OIDC token in this calling context (not just within the `claude-code-action` invocation context).
5. The Reversion Plan above remains accurate (path to PAT-based auth is documented and known to work).

## Pros and Cons of the Options

### Option 1 — Fine-grained PAT (`DEPS_BOT_TOKEN`)

- Good: well-documented, well-understood mechanism; the maintainer has used PATs before.
- Good: scope is explicit and visible at creation time.
- Good: zero third-party runtime dependencies; GitHub-native end-to-end.
- Good: failure modes are familiar (token expired, permissions revoked).
- Bad: requires manual browser-side creation; no `gh` CLI shortcut.
- Bad: 90-day expiry creates a recurring rotation chore; forgetting breaks the autonomous workflow silently.
- Bad: leakage blast radius is 90 days unless the maintainer revokes promptly.

### Option 2 — Project-owned GitHub App

- Good: long-lived (App private key); rotation cycle is the App key, not a PAT.
- Good: scope is explicit at App creation time; visible in GitHub UI.
- Good: zero third-party runtime dependencies (the App is GitHub-native).
- Good: installation actor on PRs is identifiably a project-owned bot.
- Bad: highest setup cost: create the App, install it, store private key as secret, wire `tibdex/github-app-token` (or equivalent) into both workflows.
- Bad: private key in a repo secret is a long-lived credential — solves the PAT-expiry pain but introduces a different long-lived secret to protect.
- Bad: dependency on a third-party action (`tibdex/github-app-token`) to mint installation tokens at runtime, unless the workflow rolls its own JWT signing.

### Option 3 — OIDC token-exchange via Anthropic (chosen)

- Good: zero manually-provisioned secrets.
- Good: short-lived tokens; minimal leakage blast radius.
- Good: no rotation cycle to forget.
- Good: reuses existing Claude Code GitHub App installation.
- Bad: depends on a non-public Anthropic endpoint that can change without notice.
- Bad: broadens the Claude Code App's authority from recovery-only to routine-path also (ADR-0010 amendment required).
- Bad: cannot be verified to work in `auto-update.yml`'s calling context without actually running the workflow — the endpoint may validate something about the caller that the maintainer can't predict.

## Reassessment Criteria

Reassess this decision when any of the following occur:

1. The OIDC-exchange endpoint fails on two consecutive `auto-update.yml` runs (triggers the Reversion Plan immediately, not just a reassessment).
2. Anthropic publishes documentation or a deprecation notice for the `github-app-token-exchange` endpoint.
3. The Claude Code GitHub App's default permissions change in a way that affects this project's needs.
4. The project's TBD model changes (e.g. switches to PR-required), eliminating the original need for a non-`GITHUB_TOKEN` actor.
5. GitHub introduces a feature that makes `GITHUB_TOKEN`-opened PRs trigger `pull_request` workflows, eliminating the original need entirely.
6. Three months from the date on this ADR (2026-08-12), as a default review checkpoint.

## Related Decisions

- **ADR-0009 (proposed).** The scheduled workflow whose authentication this ADR specifies. ADR-0009's Required-secrets and Bot-identity sections reference this ADR.
- **ADR-0010 (proposed).** The recovery workflow's trust boundary. The Secret management section of ADR-0010 is amended to acknowledge that the Claude Code GitHub App is also the routine-path actor under this ADR, not only the recovery actor.
- **ADR-0011 (proposed).** ADR format and lifecycle convention; this ADR follows MADR 4.0 per ADR-0011.

## References

- `anthropics/claude-code-action` source: `src/github/token.ts` — documents the OIDC-exchange mechanism used internally by the action; this ADR reuses the same mechanism from a different calling context.
- [GitHub Actions: about security hardening with OpenID Connect](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [GitHub Apps installation access tokens](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app)
- [Fine-grained personal access tokens](https://github.com/settings/personal-access-tokens) — the reversion path's provisioning surface.
