## NOW
Push the pending local commits to the remote repository:
```bash
git push origin main
```

## NEXT
- Add the `.voder/` directory to `.gitignore` so that AI-assistant state files are not tracked.
- Stage and commit the update:
  ```bash
  git add .gitignore
  git commit -m "chore: ignore .voder directory"
  ```
- Push the new commit to `origin/main`.

## LATER
- Introduce a pre-commit hook (via Husky + lint-staged) to auto-run Prettier and ESLint on staged files.
- Add unit tests to cover missing branches in `fetch-version-times.js` to achieve 100% branch coverage.
- Update `README.md` to include links to deeper documentation (`docs/api.md`, etc.) and add a coverage badge.
- Automate changelog generation (e.g. via conventional-changelog) to keep `CHANGELOG.md` in sync with `package.json`.
- Refactor `fetchVersionTimes` to use an asynchronous API or concurrent fetches for performance improvements.
- Plan and implement the next user stories: fetching version ages, maturity filtering, and security filtering.