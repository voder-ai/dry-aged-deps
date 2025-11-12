## NOW  
Update README.md to include a dedicated “CI/CD Integration” section showing a GitHub Actions snippet that runs `dry-aged-deps --check`, fails the build on safe updates, and demonstrates the `if: failure()` step.

## NEXT  
- Add a corresponding section to docs/api.md under the `--check` flag describing its exit-code semantics and CI/CD usage, including the same example snippet.  
- Create a new documentation test (e.g. `test/docs/ci-integration.test.js`) that reads README.md and asserts it contains the `--check` GitHub Actions example block.

## LATER  
- Extend the documentation test suite to validate API docs (docs/api.md) for other options (e.g. `--format=json`, config-file).  
- Add automated validation of the CI snippet (e.g. YAML linting) in the CI pipeline.  
- Consider adding example workflows for other CI platforms (e.g. GitLab CI, Jenkins) in docs.