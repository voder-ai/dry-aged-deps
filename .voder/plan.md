## NOW
Stage and commit all `.voder` state files to clean the working directory:  
```bash
git add .voder && git commit -m "chore: persist voder state files for clean working directory"
```

## NEXT
- Update `docs/branching.md` to remove any stale references to a `develop` branch and explicitly document that all work happens on `main` under a trunk-based model.  
- Create a new `docs/branching-strategy.md` outlining ephemeral feature-branch naming conventions, PR workflow, and merge practices for the trunk-based approach.

## LATER
- Implement a CI check or pre-commit hook that fails if there are unstaged or uncommitted changes outside of `src/`, `bin/`, `test/`, and docs directories to enforce working-directory hygiene.  
- Extend developer guidelines with a section on branch hygiene, specifying when and how to create and delete feature branches under the trunk-based model.