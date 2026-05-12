# Releases & CI

## What You Need to Know

- `package.json` `version` field is **stale** per ADR-0005. semantic-release ignores it. The authoritative published version is `npm view dry-aged-deps version` (currently `2.7.0`). The repo file may show something much older.
  <!-- signal-score: 4 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->

- `ci-publish.yml` runs `Build & Test` on every push and pull_request. The `Release` job runs only on push to `main` and runs `npx semantic-release`. No release-related config lives in `package.json`; `.releaserc.json` is the source of truth.
  <!-- signal-score: 2 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->

- `npm run push:watch` is the canonical push command. A global Claude PreToolUse hook intercepts `git push` and redirects. The wrapper lives at `scripts/push-watch.sh`; if you're in a session where it doesn't exist, port it from `windyroad/scripts/push-watch.sh` and trim project-specific bits.
  <!-- signal-score: 3 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->

- `push:watch` ABORTS pre-push if `dry-aged-deps --check` finds stale safe updates — the abort defers commit-type choice (chore(deps) vs fix(deps)) to the maintainer per ADR-0009 §Commit-type derivation.
  <!-- signal-score: 3 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->

- Pre-commit `prettier --write` modifies files AFTER the index is captured, leaving unstaged working-tree deltas. Plan for a follow-up `style:` commit per file batch.
  <!-- signal-score: 4 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->

- `check:lockfile` (part of prepush) runs `npm install --ignore-scripts --package-lock-only` and asserts `git diff --exit-code -- package-lock.json`. After `npm audit fix`, run `npm install --package-lock-only` to normalize before commit, or check:lockfile fails.
  <!-- signal-score: 3 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->

## What Will Surprise You

- `chore(deps):` does NOT trigger a release (per semantic-release's default commit-analyzer). `fix(deps):` does (patch). `feat(...)` does (minor). This matters when picking the commit type for dep bumps — ADR-0009 §Commit-type derivation rule pins this to severity from `dry-aged-deps --format=json`.
  <!-- signal-score: 4 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->

- The first npm-published version (`2.7.0`) is FAR ahead of what `package.json` shows. Do not be alarmed when semantic-release bumps from "0.1.3" (repo) to "2.8.0" (npm) — the repo version is decorative.
  <!-- signal-score: 3 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->

- semantic-release runs `Build & Test` THEN `Release` (separate jobs in the same workflow). The smoke test in the publish job installs the just-published package into a tmp dir and runs `npx dry-aged-deps --version` — failures here block but don't unpublish.
  <!-- signal-score: 1 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->
