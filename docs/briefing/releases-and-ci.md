# Releases & CI

## What You Need to Know

- `package.json` `version` field is **stale** per ADR-0005. semantic-release ignores it. The authoritative published version is `npm view dry-aged-deps version` (currently `2.7.0`). The repo file may show something much older.
  <!-- signal-score: 1 | last-classified: 2026-06-05 | first-written: 2026-05-13 -->

- `ci-publish.yml` runs `Build & Test` on every push and pull_request. The `Release` job runs only on push to `main` and runs `npx semantic-release`. No release-related config lives in `package.json`; `.releaserc.json` is the source of truth.
  <!-- signal-score: -1 | last-classified: 2026-06-05 | first-written: 2026-05-13 -->

- `npm run push:watch` is the canonical push command. A global Claude PreToolUse hook intercepts `git push` and redirects. The wrapper lives at `scripts/push-watch.sh`; if you're in a session where it doesn't exist, port it from `windyroad/scripts/push-watch.sh` and trim project-specific bits.
  <!-- signal-score: 0 | last-classified: 2026-06-05 | first-written: 2026-05-13 -->

- `push:watch` ABORTS pre-push if `dry-aged-deps --check` finds stale safe updates — the abort defers commit-type choice (chore(deps) vs fix(deps)) to the maintainer per ADR-0009 §Commit-type derivation.
  <!-- signal-score: 0 | last-classified: 2026-06-05 | first-written: 2026-05-13 -->

- Pre-commit hook auto-writes and re-stages staged files per ADR-0016 (supersedes ADR-0013; P009 verifying, shipped v2.8.0). `.husky/pre-commit` runs `prettier --write --ignore-unknown` on `git diff --cached --name-only --diff-filter=ACM` files + `git add` BEFORE `format:check`; the formatted output lands IN the commit and the working tree stays clean post-commit. Workspace state dirs (`.afk-run-state/`, `.claude/`, `.risk-reports/`, `*.backup`) are in `.gitignore` and `.prettierignore`. Markdown commits no longer hit the format:check abort.
  <!-- signal-score: 6 | last-classified: 2026-06-05 | first-written: 2026-05-13 -->

- `check:lockfile` (part of prepush) runs `npm install --ignore-scripts --package-lock-only` and asserts `git diff --exit-code -- package-lock.json`. After `npm audit fix`, run `npm install --package-lock-only` to normalize before commit, or check:lockfile fails.
  <!-- signal-score: 0 | last-classified: 2026-06-05 | first-written: 2026-05-13 -->

## What Will Surprise You

- `chore(deps):` does NOT trigger a release (per semantic-release's default commit-analyzer). `fix(deps):` does (patch). `feat(...)` does (minor). This matters when picking the commit type for dep bumps — ADR-0009 §Commit-type derivation rule pins this to severity from `dry-aged-deps --format=json`.
  <!-- signal-score: 1 | last-classified: 2026-06-05 | first-written: 2026-05-13 -->

- The first npm-published version (`2.7.0`) is FAR ahead of what `package.json` shows. Do not be alarmed when semantic-release bumps from "0.1.3" (repo) to "2.8.0" (npm) — the repo version is decorative.
  <!-- signal-score: 0 | last-classified: 2026-06-05 | first-written: 2026-05-13 -->

- semantic-release runs `Build & Test` THEN `Release` (separate jobs in the same workflow). The smoke test in the publish job installs the just-published package into a tmp dir and runs `npx dry-aged-deps --version` — failures here block but don't unpublish.
  <!-- signal-score: -2 | last-classified: 2026-06-05 | first-written: 2026-05-13 -->

- **`push:watch`'s `dry-aged-deps --check` precheck reads from `node_modules/`, NOT from `package-lock.json`.** After editing `package.json` + running `npm install --ignore-scripts --package-lock-only` to refresh the lockfile only, `npm outdated` still reports the OLD installed version because `node_modules/<pkg>/package.json` hasn't changed. Result: `push:watch` keeps reporting the same stale dep until you run a full `npm install` (or `npm ci`) to sync `node_modules/`. Cost ~2 minutes per misdiagnosed loop. Observed on the v2.7.3 P008 verification work — downgrading globals via `--update --yes` left node_modules at the new version even after a `--package-lock-only` reset.
  <!-- signal-score: 0 | last-classified: 2026-06-05 | first-written: 2026-05-16 -->

- **`gh run watch --exit-status` (and `push:watch`) can return non-zero on transient API connectivity errors even when the CI run itself succeeded.** Two shapes: `error connecting to api.github.com` (2026-05-16) and `failed to get jobs: ... read: operation timed out` (2026-05-30 — `gh run view 26668291165` confirmed all jobs green). Verify with `gh run view <RUN_ID>` before believing the script. Two distinct fetch-path timeouts in this surface — a candidate `scripts/push-watch.sh` improvement (verify-on-fetch-failure before declaring failed) — see P016.
  <!-- signal-score: 1 | last-classified: 2026-06-05 | first-written: 2026-05-16 -->
