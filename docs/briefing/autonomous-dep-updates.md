# Autonomous Dependency Updates

## What You Need to Know

- Workflow lives at `.github/workflows/auto-update.yml` (scheduled; schedule disabled until first manual `workflow_dispatch` verification) and `.github/workflows/auto-update-recover.yml` (failure-only AI recovery). ADRs: 0009, 0010, 0011, 0012.
  <!-- signal-score: 4 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->

- Authentication mechanism (ADR-0012): runtime OIDC exchange against `https://api.anthropic.com/api/github/github-app-token-exchange` with audience `claude-code-github-action`. Returns a short-lived GitHub App installation token with `contents/pull_requests/issues: write` on this repo. No `DEPS_BOT_TOKEN` secret required.
  <!-- signal-score: 4 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->

- Reversion plan (ADR-0012 §Reversion Plan): if the Anthropic endpoint changes/withdraws, provision a fine-grained PAT (`DEPS_BOT_TOKEN`, `contents/pull_requests: write` on this repo), `gh secret set DEPS_BOT_TOKEN`, supersede ADR-0012 with PAT-based auth, swap the workflows' `${{ steps.mint.outputs.token }}` references to `${{ secrets.DEPS_BOT_TOKEN }}`.
  <!-- signal-score: 3 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->

- Branch protection setup (ADR-0009): required status check `Build & Test`; "Require a pull request before merging" DISABLED; "Do not allow bypassing" DISABLED. Admin-bypass-by-default is the mechanism that preserves TBD for the maintainer's direct pushes while gating the bot's PR.
  <!-- signal-score: 4 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->

- `needs-human` label must exist on the repo (`gh label create needs-human ...`). The recovery workflow adds it loudly on no-op outcomes; missing label = workflow fails (no silent swallow per ADR-0010).
  <!-- signal-score: 2 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->

- AI recovery is failure-only (ADR-0010). No-touch list defends `.nsprc`, `.releaserc.json`, `docs/decisions/`, `docs/jtbd/`, `prompts/`, `.husky/`, `.github/workflows/`, commitlint/eslint/tsconfig, `.dry-aged-deps.json`, `package.json#version`, `CLAUDE.md`. Hard-enforced by post-step diff (close-PR-with-comment on violation).
  <!-- signal-score: 3 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->

## What Will Surprise You

- Workflow short-circuits on no-updates: `dry-aged-deps --check` exit 0 → workflow exits cleanly with no PR. Almost every scheduled run on this repo will short-circuit because `dry-aged-deps --update` can't bump exact pins (P001). The OIDC mint step is currently unreachable for the same reason.
  <!-- signal-score: 4 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->

- PRs opened by the workflow-scoped `GITHUB_TOKEN` do NOT trigger downstream `pull_request` workflows. This is why the auto-update workflow needs a non-GITHUB_TOKEN actor (OIDC-minted App token, or fallback PAT) — without it the auto-merge contract has no `Build & Test` run to wait on.
  <!-- signal-score: 3 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->

- The Anthropic OIDC endpoint is not part of any public API contract. Discovered by reading `src/github/token.ts` in `anthropics/claude-code-action`. If Anthropic changes it, the workflow fails and the ADR-0012 Reversion Plan kicks in.
  <!-- signal-score: 3 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->
