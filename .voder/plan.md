## Plan to Improve Version Control Processes (Commit Quality & CI Enhancements)

## NOW
Add a “Commit Message Lint” step to the CI build job by editing `.github/workflows/ci-publish.yml`: insert a new step before tests that runs  
```yaml
- name: Lint commit messages
  run: npx commitlint --from=HEAD~1 --to=HEAD  
```

## NEXT
- Enforce zero ESLint warnings in CI: update the lint script in `package.json` to  
  `"lint": "eslint src bin test --ext .js,.cjs --max-warnings=0"`  
  and ensure the CI workflow uses `npm run lint` so any warning fails the build.
- Add a Husky pre-commit hook to run `npx commitlint --edit "$1"` locally, keeping commit quality consistent.
- Update `docs/developer-guidelines.md` to call out the new CI commitlint step and zero-warning ESLint policy.

## LATER
- Investigate and stabilize any flaky CI steps (e.g., caching, timeouts, network calls) to further improve pipeline reliability.
- Add a GitHub App or Action to block merges on commitlint or lint failures at pull‐request time.
- Periodically review and tighten branch protection rules (e.g., require green commitlint and lint statuses) to sustain >90% version_control score.