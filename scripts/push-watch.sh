#!/bin/bash
# Usage: npm run push:watch
# Pushes to main, watches ci-publish.yml, surfaces release info.
#
# Adapted from windyroad/scripts/push-watch.sh; trimmed to this project's
# stack (semantic-release on npm, ci-publish.yml workflow, main branch,
# no changesets, no Netlify). See architect review notes in ADR-0009.
#
# On stale dependencies (dry-aged-deps --check exits 1): aborts and asks the
# maintainer to apply --update --yes themselves so they choose the right
# commit type (chore(deps): for routine, fix(deps): for security). The
# scheduled workflow in ADR-0009 owns the autonomous severity-derivation
# path; this wrapper deliberately defers that decision to the maintainer.

set -euo pipefail

# ── Helper: show failed jobs and hook guidance ───────────────────────────────
show_failure_guidance() {
  local run_id="$1"
  local run_url="$2"

  echo ""
  echo "Failed checks:"
  gh run view "$run_id" --json jobs \
    --jq '.jobs[] | select(.conclusion == "failure") | "  ✗ \(.name)"' 2>/dev/null || true

  echo ""
  echo "Fix the failure above, then re-run: npm run push:watch"
  echo ""
  echo "Ask Claude: 'What pre-push or pre-commit git hook in .husky/ could"
  echo "have caught the failure in $run_url ?'"
}

# ── 1. Stash + pull --rebase + unstash ───────────────────────────────────────
STASHED=0
if ! git diff --quiet || ! git diff --cached --quiet; then
  git stash
  STASHED=1
fi
git pull --rebase
[ "$STASHED" = "1" ] && git stash pop

# ── 2. Pre-flight: check for stale safe dep updates ──────────────────────────
# The .husky/pre-push hook runs `npm run check:deps` which is
# `dry-aged-deps --check`. If safe updates are pending, the hook fails the
# push. Detect here and abort with guidance so the maintainer can choose
# chore(deps): or fix(deps): based on severity (rather than this wrapper
# pre-empting that choice).
set +e
node ./bin/dry-aged-deps.js --check
DEPS_EXIT=$?
set -e
if [ "$DEPS_EXIT" = "1" ]; then
  echo ""
  echo "✗ Stale safe dep updates detected. Aborting before push."
  echo ""
  echo "Inspect severity in the output above, apply updates, and commit:"
  echo "  node ./bin/dry-aged-deps.js --update --yes"
  echo "  git add package.json package-lock.json"
  echo "  git commit -m 'chore(deps): ...'    # all severities 'none'"
  echo "  git commit -m 'fix(deps): ...'      # any non-'none' severity (security-relevant)"
  echo ""
  echo "Then re-run: npm run push:watch"
  exit 1
elif [ "$DEPS_EXIT" != "0" ]; then
  echo "✗ dry-aged-deps --check failed with exit code $DEPS_EXIT" >&2
  exit "$DEPS_EXIT"
fi

# ── 3. Push ──────────────────────────────────────────────────────────────────
# Capture the pre-push remote head BEFORE `git push` runs. After push,
# `@{push}` resolves to the new remote head (== HEAD), so `@{push}..HEAD`
# is empty and the step-6 release-trigger heuristic would always miss
# (P002).
PRE_PUSH_REMOTE=$(git rev-parse @{push})
git push "$@"
COMMIT_SHA=$(git rev-parse HEAD)
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)

# ── 4. Find the ci-publish.yml run for this SHA ──────────────────────────────
echo ""
printf 'Waiting for ci-publish.yml run on %s' "${COMMIT_SHA:0:7}"
RUN_ID=""
for _ in $(seq 1 30); do
  RUN_ID=$(gh run list \
    --workflow=ci-publish.yml \
    --branch main \
    --limit 10 \
    --json databaseId,headSha \
    --jq ".[] | select(.headSha == \"$COMMIT_SHA\") | .databaseId" 2>/dev/null | head -1)
  [ -n "$RUN_ID" ] && break
  printf '.'
  sleep 2
done
echo ""

if [ -z "$RUN_ID" ]; then
  echo "✗ Could not find ci-publish.yml run for $COMMIT_SHA after 60s" >&2
  echo "  Check the Actions tab manually: https://github.com/$REPO/actions" >&2
  exit 1
fi

RUN_URL="https://github.com/$REPO/actions/runs/$RUN_ID"
echo "Pipeline: $RUN_URL"
echo ""

# ── 5. Watch the run ─────────────────────────────────────────────────────────
if ! gh run watch "$RUN_ID" --exit-status; then
  echo ""
  echo "✗ Pipeline failed — $RUN_URL"
  show_failure_guidance "$RUN_ID" "$RUN_URL"
  exit 1
fi

echo ""
echo "✓ Pipeline succeeded — $RUN_URL"
echo ""

# ── 6. Surface release info ──────────────────────────────────────────────────
# semantic-release runs in the publish job on push to main; it cuts a release
# if and only if the commit-analyzer found a release-triggering type. Compare
# the latest GitHub release tag against the last-known tag to detect a new release.
LATEST_RELEASE=$(gh api "/repos/$REPO/releases/latest" --jq '.tag_name' 2>/dev/null || echo "")
if [ -n "$LATEST_RELEASE" ]; then
  RELEASE_URL="https://github.com/$REPO/releases/tag/$LATEST_RELEASE"
  echo "Latest GitHub release: $LATEST_RELEASE — $RELEASE_URL"
fi

PUBLISHED_VERSION=$(npm view dry-aged-deps version 2>/dev/null || echo "")
if [ -n "$PUBLISHED_VERSION" ]; then
  echo "Latest npm version:    dry-aged-deps@$PUBLISHED_VERSION"
fi

# Heuristic: if the commit types in this push include feat/fix/BREAKING,
# a release should have been cut. If not, no release expected. The regex
# tracks ADR-0005's commit-analyzer mapping (feat → minor, fix → patch,
# BREAKING → major). Range starts at PRE_PUSH_REMOTE (captured in step 3
# before push) because post-push `@{push}` resolves to the new remote
# head and would make the range empty (P002).
RELEASE_TYPES=$(git log --format=%s "${PRE_PUSH_REMOTE}..HEAD" 2>/dev/null \
  | grep -cE '^(feat|fix)(\(.+\))?!?:|^.+!:|^BREAKING CHANGE:' || true)
if [ "${RELEASE_TYPES:-0}" -gt 0 ]; then
  echo ""
  echo "Commits include release-triggering types — expect a new release version above."
else
  echo ""
  echo "No release-triggering commit types in this push (semantic-release will skip publish)."
fi
