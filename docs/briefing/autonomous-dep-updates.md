# Autonomous Dependency Updates

## What You Need to Know

- **Single workflow** `.github/workflows/auto-update.yml` (ADR-0017, supersedes ADR-0009 + ADR-0010; shipped 2026-05-18). One inline loop: detect → skip-if-same-bump-already-open → apply → commit → bounded retry loop (`MAX_RETRIES=3`: prepush → if red, `claude-code-action` → per-iteration post-diff hard gate) → push → open PR (auto-merge on green; auto-merge **disabled** + failure context in body on budget exhaustion). `auto-update-recover.yml` was **deleted** — recovery is now the in-loop mechanism, not a separate `workflow_run`-triggered fallback. The `needs-human` label path is gone (no human dev pool; failures surface as inspectable failing PRs).
  <!-- signal-score: 2 | last-classified: 2026-05-25 | first-written: 2026-05-25 -->

- Authentication (ADR-0012, carried forward verbatim): runtime OIDC exchange against `https://api.anthropic.com/api/github/github-app-token-exchange` (audience `claude-code-github-action`) mints a short-lived GitHub App installation token (`contents/pull_requests/issues: write`). No `DEPS_BOT_TOKEN`. Reversion plan: provision a fine-grained PAT and supersede ADR-0012 if the endpoint withdraws.
  <!-- signal-score: 2 | last-classified: 2026-05-25 | first-written: 2026-05-13 -->

- Trust boundary (carried verbatim from superseded ADR-0010 into ADR-0017): writable-paths allow-list (`src/**`, `bin/**`, `test/**`, deps sections of `package.json`, `package-lock.json`) + 16-entry no-touch list (`.nsprc`, `docs/decisions/`, `docs/jtbd/`, `prompts/`, `.husky/`, `.github/workflows/`, config files, `CLAUDE.md`, `CHANGELOG.md`, `.voder/`, package.json non-deps fields) + post-diff hard gate, run **per loop iteration**. OAuth-only (`CLAUDE_CODE_OAUTH_TOKEN`); `ANTHROPIC_API_KEY` never used.
  <!-- signal-score: 2 | last-classified: 2026-05-25 | first-written: 2026-05-25 -->

- Branch protection (ADR-0009 setup, still in force): required status check `Build & Test`; "Require a pull request before merging" DISABLED; "Do not allow bypassing" DISABLED. Admin-bypass-by-default preserves TBD for the maintainer's direct pushes while gating the bot's PR. "Allow auto-merge" must be enabled in repo Settings → Pull Requests for `gh pr merge --auto`.
  <!-- signal-score: 1 | last-classified: 2026-05-25 | first-written: 2026-05-13 -->

- Verified end-to-end 2026-05-18: a real `workflow_dispatch` run bumped TypeScript 5→6, prepush passed first try (no agent recovery needed), PR opened + auto-merged. The schedule cron remains commented (staged rollout) until arming in a follow-up.
  <!-- signal-score: 2 | last-classified: 2026-05-25 | first-written: 2026-05-25 -->

## What Will Surprise You

- **`ci-publish.yml`'s Build & Test runs `dry-aged-deps --check` as a release gate.** `--check` exits 1 while safe dep updates are pending, which fails the job and **skips the release**. So a `feat:`/`fix:` will NOT publish while any safe dep update is pending — apply the deps (a `chore(deps):` commit) first. The local `push:watch` wrapper enforces the same gate before push. Two layers of the same dogfood gate.
  <!-- signal-score: 3 | last-classified: 2026-05-25 | first-written: 2026-05-25 -->

- PRs opened by the workflow-scoped `GITHUB_TOKEN` do NOT trigger downstream `pull_request` workflows. That is why the workflow needs a non-`GITHUB_TOKEN` actor (the OIDC-minted App token) — without it the auto-merge contract has no `Build & Test` run to wait on.
  <!-- signal-score: 2 | last-classified: 2026-05-25 | first-written: 2026-05-13 -->

- **GitHub App installation tokens require HTTP Basic auth (`x-access-token` username), NOT bearer, for git push.** Bearer works for the GitHub API (the natural first guess) but git transport needs Basic with the literal username `x-access-token`. Shapes that work: URL-embedded `git push "https://x-access-token:$APP_TOKEN@github.com/owner/repo.git"`, or `git -c "http.https://github.com/.extraheader=AUTHORIZATION: basic $(printf 'x-access-token:%s' "$APP_TOKEN" | base64 -w0)"`. Bearer-as-extraheader fails with `fatal: could not read Username` (not HTTP 401) — easy to misread. P008.
  <!-- signal-score: 1 | last-classified: 2026-05-25 | first-written: 2026-05-16 -->

- **The skip-if-same-bump check needs jq-side prefix matching, not `gh pr list --head`.** `gh pr list --head 'auto/deps/*'` is a literal match (the `*` is treated literally), so it returns zero rows — the check is dead. Use `gh pr list --state open --json body,headRefName --jq '... | select(.headRefName | startswith("auto/deps/")) ...'`. Shipped this way after the initial glob bug.
  <!-- signal-score: 1 | last-classified: 2026-05-25 | first-written: 2026-05-25 -->

- **The auto-update workflow only tracks DIRECT deps, so transitive security updates never land via it.** A vuln fixed only by bumping a transitive (e.g. npm's bundled brace-expansion, or npm itself via `@semantic-release/npm`) won't be surfaced or applied by the scheduled flow — it sits until a manual lockfile refresh or an upstream parent bump. P013 (overrides/transitive blindness) captures the gap.
  <!-- signal-score: 1 | last-classified: 2026-05-25 | first-written: 2026-05-25 -->
