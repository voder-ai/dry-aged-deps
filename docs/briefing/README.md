# Project Briefing — dry-aged-deps

Per-topic briefing index. Each topic file holds short, durable observations across "What You Need to Know" and "What Will Surprise You". The Critical Points roll-up below is loaded at session start; topic files are read on demand.

## Critical Points

- **Release model is non-standard.** `package.json` version is stale (per ADR-0005). semantic-release reads commit types from git, ignores the repo's `version` field, and publishes to npm on push to `main` when commits map to a bump. Current published version: `dry-aged-deps@2.7.0`. The repo file still shows `0.1.3`.
- **TBD with admin-bypass branch protection.** Branch protection on `main` requires the `Build & Test` status check AND leaves "Do not allow bypassing" UNCHECKED. The repo owner is admin, so direct pushes bypass the rule; the bot's PR (non-admin) is gated. Do not enable "Require a pull request before merging" — it would block TBD.
- **`dry-aged-deps --update` is a no-op on exact pins (P001).** The implementation uses npm-outdated's `wanted` column which equals `current` for exact pins. The spec says "latest safe version". Fixed only when P001 lands; until then exact-pinned packages must either be excluded with `.dry-aged-deps.json` or upgraded by hand.
- **CLAUDE_CODE_OAUTH_TOKEN is for Claude API auth only.** GitHub-API operations in workflows use a runtime-minted GitHub App installation token via OIDC exchange against `api.anthropic.com/api/github/github-app-token-exchange` (per ADR-0012). No `ANTHROPIC_API_KEY`. No `DEPS_BOT_TOKEN` (deferred fallback per ADR-0012 Reversion Plan).
- **Pre-commit prettier leaves deltas.** Husky pre-commit runs `prettier --write` which modifies the working tree AFTER the index is captured. Resulting unstaged formatting changes need a follow-up `style:` commit.
- **Push goes through `npm run push:watch`.** A global Claude PreToolUse hook intercepts `git push` and redirects. The wrapper lives at `scripts/push-watch.sh` and aborts pre-emptively if stale safe deps are detected.

## Topic Index

| Topic | File | Scope |
|---|---|---|
| Releases & CI | [`releases-and-ci.md`](releases-and-ci.md) | semantic-release, ci-publish.yml, version handling, push:watch |
| Hooks & gates | [`hooks-and-gates.md`](hooks-and-gates.md) | architect/JTBD/TDD/ITIL gates, husky hooks, marker files |
| Governance workflow | [`governance-workflow.md`](governance-workflow.md) | ADR / risk-policy / JTBD review cadence, capture-on-correction |
| Autonomous dep updates | [`autonomous-dep-updates.md`](autonomous-dep-updates.md) | auto-update.yml + auto-update-recover.yml, OIDC token-exchange, branch protection |
