## NOW
Update the CI workflow (`.github/workflows/ci.yml`) to add a **Commit Message Lint** step that runs commitlint against the pushed commits (for example, right before the existing “Lint code” step, invoke  
```bash
npx --no-install commitlint --config commitlint.config.cjs --from=origin/main --to=HEAD
```  
to ensure all commit messages in CI conform to your commitlint rules).

## NEXT
- Create a pull-request template at `.github/pull_request_template.md` that includes a checklist item for “All CI checks passed (including commit message linting)”.  
- Update **docs/developer-guidelines.md** (and optionally **docs/branching.md**) to document the new CI commit-message validation requirement and reference the PR template.  
- Modify the existing checkout step in `ci.yml` to use `fetch-depth: 0` so that commitlint can see the full commit history for linting the range.

## LATER
- Automate branch-protection configuration (via GitHub’s REST API or a dedicated GitHub Action) to require the following status checks on `main` before merging: Commit Message Lint, ESLint, Vitest, and npm audit.  
- Add a Husky **pre-push** hook to run `npm ci && npm run lint` locally before any push.  
- Configure CI caching for the npm cache and `test/fixtures/node_modules` to speed up CI runs.