## NOW  
Delete the redundant `.github/workflows/codeql-analysis.yml` file from the repository.  

## NEXT  
- Install `semantic-release` and `@semantic-release/npm` as devDependencies in `package.json`.  
- Create a `.releaserc.json` file configuring `semantic-release` for the `main` branch with plugins: `@semantic-release/commit-analyzer`, `@semantic-release/release-notes-generator`, `@semantic-release/npm`, and `@semantic-release/github`.  
- Update `.github/workflows/ci-publish.yml` to replace the manual `npm publish` step with a `npx semantic-release` step that runs on every push to `main`.  

## LATER  
- Add staged-rollout/canary jobs and automated health-check tests in the CI pipeline.  
- Expand the workflow matrix to test against multiple Node.js versions.  
- Integrate notifications (e.g., Slack) and changelog generation plugins into `semantic-release`.