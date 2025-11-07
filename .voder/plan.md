## NOW  
Create a unified GitHub Actions workflow file at .github/workflows/ci-publish.yml that merges the steps from both ci.yml and publish.yml, triggering on pushes to main and on tag pushes (`v*`), and runs lint, tests, audit, CodeQL, and npm publish in a single pipeline.  

## NEXT  
- Remove the old .github/workflows/ci.yml and .github/workflows/publish.yml files.  
- In ci-publish.yml, add a post‐publish “smoke-test” job that runs `npm view dry-aged-deps version` to verify the package was published successfully.  
- Update the README’s “Release Process” section to reference the new unified workflow.  

## LATER  
- Integrate semantic-release or changesets for automatic version bumps and changelog generation.  
- Enable continuous deployment on every green main-branch build (not just on tags).  
- Add staged rollout or canary jobs and automated health-check tests to the CI pipeline.