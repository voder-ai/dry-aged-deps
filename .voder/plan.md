## NOW
Add `.voder/` to the project’s `.gitignore` so that all internal Voder files are ignored by Git.

## NEXT
- Commit and push the updated `.gitignore`.  
- Update `docs/branching.md` to note that `.voder/` is an internal directory and to reaffirm the `main`/`develop` branch and tag workflow.  
- Verify `git status` shows a clean working directory (with only `.voder/` untracked but ignored).

## LATER
- Configure GitHub branch protection rules to require pull-request reviews on `main` and `develop`.  
- Integrate semantic-release (or changesets) for automated version bumps and changelog generation on tag pushes.  
- Add CI checks for lockfile consistency (e.g. `npm ci --dry-run`) and investigate caching frequent `npm view` calls to speed up the CLI.