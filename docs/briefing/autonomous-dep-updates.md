# Autonomous Dependency Updates

## What You Need to Know

- **Single workflow** `.github/workflows/auto-update.yml` (ADR-0017, supersedes ADR-0009 + ADR-0010; shipped 2026-05-18). One inline loop: detect → skip-if-same-bump-already-open → apply → commit → bounded retry loop (`MAX_RETRIES=3`: prepush → if red, `claude-code-action` → per-iteration post-diff hard gate) → push → open PR (auto-merge on green; auto-merge **disabled** + failure context in body on budget exhaustion). `auto-update-recover.yml` was **deleted** — recovery is now the in-loop mechanism, not a separate `workflow_run`-triggered fallback. The `needs-human` label path is gone (no human dev pool; failures surface as inspectable failing PRs).
  <!-- signal-score: 1 | last-classified: 2026-06-05 | first-written: 2026-05-25 -->

- Authentication (ADR-0012, carried forward verbatim): runtime OIDC exchange against `https://api.anthropic.com/api/github/github-app-token-exchange` (audience `claude-code-github-action`) mints a short-lived GitHub App installation token (`contents/pull_requests/issues: write`). No `DEPS_BOT_TOKEN`. Reversion plan: provision a fine-grained PAT and supersede ADR-0012 if the endpoint withdraws.
  <!-- signal-score: 1 | last-classified: 2026-06-05 | first-written: 2026-05-13 -->

- Trust boundary (carried verbatim from superseded ADR-0010 into ADR-0017): writable-paths allow-list (`src/**`, `bin/**`, `test/**`, deps sections of `package.json`, `package-lock.json`) + 16-entry no-touch list (`.nsprc`, `docs/decisions/`, `docs/jtbd/`, `prompts/`, `.husky/`, `.github/workflows/`, config files, `CLAUDE.md`, `CHANGELOG.md`, `.voder/`, package.json non-deps fields) + post-diff hard gate, run **per loop iteration**. OAuth-only (`CLAUDE_CODE_OAUTH_TOKEN`); `ANTHROPIC_API_KEY` never used.
  <!-- signal-score: 1 | last-classified: 2026-06-05 | first-written: 2026-05-25 -->

- Branch protection (ADR-0009 setup, still in force): required status check `Build & Test`; "Require a pull request before merging" DISABLED; "Do not allow bypassing" DISABLED. Admin-bypass-by-default preserves TBD for the maintainer's direct pushes while gating the bot's PR. "Allow auto-merge" must be enabled in repo Settings → Pull Requests for `gh pr merge --auto`.
  <!-- signal-score: 0 | last-classified: 2026-06-05 | first-written: 2026-05-13 -->

- Verified end-to-end 2026-05-18: a real `workflow_dispatch` run bumped TypeScript 5→6, prepush passed first try (no agent recovery needed), PR opened + auto-merged. The schedule cron remains commented (staged rollout) until arming in a follow-up.
  <!-- signal-score: 1 | last-classified: 2026-06-05 | first-written: 2026-05-25 -->

- **`--update` now reconciles the lockfile + skips un-landable peers (2026-07, shipped).** `dry-aged-deps --update` reconciles `package-lock.json` itself via `npm install --ignore-scripts --package-lock-only` (P030/ADR-0021, v2.15.0) — the workflow's "Normalize lockfile" step is now belt-and-braces, not load-bearing. `--update`/`--check` also probe landability (default on; `--no-landable-check`) and flag+skip updates whose peer graph won't resolve (`incompatible-peers`, P028/ADR-0022, v2.16.0) so one un-resolvable peer no longer poisons the batch and `--check`'s exit-1 count excludes them. Detection is `npm install --package-lock-only` in a temp dir; it flags exactly what a real `npm install` would ERESOLVE on (npm 7+ auto-overrides SOFT peer conflicts, so those stay landable).
  <!-- signal-score: 2 | last-classified: 2026-07-11 | first-written: 2026-07-11 -->

- **The auto-update workflow's `jq` must read the tool's REAL `--check` JSON schema.** Bump target = `.latest` (the smart-search-overwritten safe version — NOT `.recommended`, which is `wanted`; NOT `.safeUpdate`/`.latestSafe`/`.target`, which don't exist). Severity = `.vulnerabilities.maxSeverity` (NOT top-level `.severity`, which doesn't exist → drove the commit-type promotion, so security bumps never became `fix(deps)` → never released). Both were wrong (rendering every bump `→ null`) and unexercised because recent runs had no pending updates; fixed 2026-07-11. When editing the workflow's jq, validate it against a real-schema sample (`node ./bin/dry-aged-deps.js --check --format=json`), and note the PR body also surfaces `.incompatible[]` (un-landable) alongside `.unfixable[]`.
  <!-- signal-score: 2 | last-classified: 2026-07-11 | first-written: 2026-07-11 -->

## What Will Surprise You

- **`ci-publish.yml`'s Build & Test runs `dry-aged-deps --check` as a release gate.** `--check` exits 1 while safe dep updates are pending, which fails the job and **skips the release**. So a `feat:`/`fix:` will NOT publish while any safe dep update is pending — apply the deps (a `chore(deps):` commit) first. The local `push:watch` wrapper enforces the same gate before push. Two layers of the same dogfood gate. Re-confirmed iter 2 of 2026-05-30 AFK loop (commit `1d8b306` unblocked release).
  <!-- signal-score: 5 | last-classified: 2026-07-11 | first-written: 2026-05-25 -->

- PRs opened by the workflow-scoped `GITHUB_TOKEN` do NOT trigger downstream `pull_request` workflows. That is why the workflow needs a non-`GITHUB_TOKEN` actor (the OIDC-minted App token) — without it the auto-merge contract has no `Build & Test` run to wait on.
  <!-- signal-score: 1 | last-classified: 2026-06-05 | first-written: 2026-05-13 -->

- **GitHub App installation tokens require HTTP Basic auth (`x-access-token` username), NOT bearer, for git push.** Bearer works for the GitHub API (the natural first guess) but git transport needs Basic with the literal username `x-access-token`. Shapes that work: URL-embedded `git push "https://x-access-token:$APP_TOKEN@github.com/owner/repo.git"`, or `git -c "http.https://github.com/.extraheader=AUTHORIZATION: basic $(printf 'x-access-token:%s' "$APP_TOKEN" | base64 -w0)"`. Bearer-as-extraheader fails with `fatal: could not read Username` (not HTTP 401) — easy to misread. P008.
  <!-- signal-score: 0 | last-classified: 2026-06-05 | first-written: 2026-05-16 -->

- **The auto-update workflow only tracks DIRECT deps, so transitive security updates never land via it.** A vuln fixed only by bumping a transitive (e.g. npm's bundled brace-expansion, or npm itself via `@semantic-release/npm`) won't be surfaced or applied by the scheduled flow — it sits until a manual lockfile refresh or an upstream parent bump. P013 (overrides/transitive blindness) captures the gap.
  <!-- signal-score: 0 | last-classified: 2026-06-05 | first-written: 2026-05-25 -->
