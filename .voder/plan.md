## NOW
Add a post-publish smoke test step to the `publish` job in `.github/workflows/ci-publish.yml` that installs the freshly released `dry-aged-deps` package from npm into a temporary workspace and runs `dry-aged-deps --help` (or `--version`) to verify the published CLI executes successfully.

## NEXT
- Investigate and resolve any recent CI failures in the build and test jobs (lockfile-drift, audit, lint, or test errors) to stabilize the pipeline.
- Add a CI check that ensures the git tag (e.g. `v0.1.2`) matches the `version` field in `package.json`, failing the workflow if they differ.
- Update the project README with a build status badge pointing to the stabilized CI workflow.

## LATER
- Automate version tagging and changelog generation via `semantic-release` or GitHub Actions to enforce consistent release tags.
- Integrate alerting or notification (Slack, email) for pipeline failures or post-publish smoke test failures.
- Migrate dependency updates to Renovate with auto-merge for non-breaking changes once the CI pipeline is stable.