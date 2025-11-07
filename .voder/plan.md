## NOW
Create a GitHub Actions workflow at `.github/workflows/publish.yml` that runs on tag pushes (`v*`), checks out the code, sets up Node.js, installs dependencies, runs lint, tests, and then publishes to npm with `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`.

## NEXT
- In GitHub repository settings, add a secret named `NPM_TOKEN` containing a valid npm publish token.
- Update the README “Release Process” section to describe the automated tag-triggered CI publish workflow.

## LATER
- Integrate semantic-release or Changesets for automatic version bumps and changelog generation.
- Add CI smoke tests that install the newly published package and verify basic CLI functionality.
- Extend the publish workflow to bundle and attach CLI artifacts (e.g., standalone executables) to GitHub Releases.