# Project Briefing — dry-aged-deps

Per-topic briefing index. Each topic file holds short, durable observations across "What You Need to Know" and "What Will Surprise You". The Critical Points roll-up below is loaded at session start; topic files are read on demand.

## Critical Points

- **Release model is non-standard.** `package.json` version is stale (per ADR-0005). semantic-release reads commit types from git, ignores the repo's `version` field, and publishes to npm on push to `main` when commits map to a bump. Current published version: `dry-aged-deps@2.7.1`. The repo file still shows `0.1.3`.
- **TBD with admin-bypass branch protection.** Branch protection on `main` requires the `Build & Test` status check AND leaves "Do not allow bypassing" UNCHECKED. The repo owner is admin, so direct pushes bypass the rule; the bot's PR (non-admin) is gated. Do not enable "Require a pull request before merging" — it would block TBD.
- **`dry-aged-deps --update` writes the `latest`-safe version per ADR-0014 (P001 verifying, shipped in v2.7.1).** `applyUpdates()` destructures the 4th tuple element (post-filter / post-smart-search safe target), not the 3rd (`wanted`). Exact-pinned packages bump cleanly. Cross-major bumps are reachable; consumer-side breakage caught by `prepush` + `ci-publish.yml`. ADR-0009 §Confirmation criteria 2+7 now satisfiable.
- **CLAUDE_CODE_OAUTH_TOKEN is for Claude API auth only.** GitHub-API operations in workflows use a runtime-minted GitHub App installation token via OIDC exchange against `api.anthropic.com/api/github/github-app-token-exchange` (per ADR-0012). No `ANTHROPIC_API_KEY`. No `DEPS_BOT_TOKEN` (deferred fallback per ADR-0012 Reversion Plan).
- **Pre-commit hook is read-only (ADR-0013, P003 closed).** Husky pre-commit runs `npm run format:check` (no auto-write). On failure: abort with guidance to run `npm run format` and re-stage. Workspace state dirs (`.risk-reports/`, `.afk-run-state/`, `*.backup`) are in `.gitignore` and `.prettierignore`; `.claude/settings.json` is tracked per the `.voder/` precedent.
- **Push goes through `npm run push:watch`.** A global Claude PreToolUse hook intercepts `git push` and redirects. The wrapper lives at `scripts/push-watch.sh` and aborts pre-emptively if stale safe deps are detected. Post-push release-trigger heuristic captures `@{push}` BEFORE push (P002 closed via v2.7.3 drain).

- **Autonomous-update workflow auth is HTTP Basic (`x-access-token`), not bearer.** App installation tokens used for `git push` via `auto-update.yml` MUST use either URL-embedded `https://x-access-token:$APP_TOKEN@github.com/owner/repo.git` (canonical, what ships in v2.7.3) or `git -c http.extraheader=AUTHORIZATION: basic $(base64 of "x-access-token:$APP_TOKEN")`. Bearer works for the API but not for git transport. P008 shipped two-layer fix: v2.7.2 `persist-credentials: false` + v2.7.3 URL-embedded basic auth. Repo also needs "Allow auto-merge" enabled in Settings → General → Pull Requests for the workflow's `gh pr merge --auto` step to succeed.

## Topic Index

| Topic                  | File                                                     | Scope                                                                             |
| ---------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Releases & CI          | [`releases-and-ci.md`](releases-and-ci.md)               | semantic-release, ci-publish.yml, version handling, push:watch                    |
| Hooks & gates          | [`hooks-and-gates.md`](hooks-and-gates.md)               | architect/JTBD/TDD/ITIL gates, husky hooks, marker files                          |
| Governance workflow    | [`governance-workflow.md`](governance-workflow.md)       | ADR / risk-policy / JTBD review cadence, capture-on-correction                    |
| Autonomous dep updates | [`autonomous-dep-updates.md`](autonomous-dep-updates.md) | auto-update.yml + auto-update-recover.yml, OIDC token-exchange, branch protection |
