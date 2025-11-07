## NOW
Create a `.github/CODEOWNERS` file that assigns ownership of `src/`, `bin/`, and `docs/` to the core maintainers.

## NEXT
- Configure GitHub branch protection on both `main` and `develop` to require all CI checks (lint, tests, audit, CodeQL) pass before merging.
- Require at least one approving review for any pull request touching protected paths.
- Push the CODEOWNERS file to the default branch and verify that PRs against those directories now require review.

## LATER
- Remove or archive the `develop` branch to fully embrace trunk-based development on `main`.
- Add a `.gitattributes` file to enforce consistent line endings and diff behaviors.
- Commit and maintain a lockfile (`package-lock.json`) for reproducible installs.
- Consider adding commit-message linting (e.g., via Husky + commitlint) and CI-driven semantic-release for automated versioning.