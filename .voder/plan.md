## NOW  
Remove the `--production` flag from the “Vulnerability scan” step in `.github/workflows/ci-publish.yml` so that `npm audit` scans both production and devDependencies.

## NEXT  
- Update SECURITY.md to note that CI now audits all dependencies (prod + dev).  
- Update docs/architecture.md (and any related docs) to reflect that the pipeline runs full `npm audit`.  
- Rename or clarify the GitHub Actions “Vulnerability scan” step description to indicate it covers all dependencies.  
- Update README.md under “Development” or “Troubleshooting” to recommend running `npm audit` without `--production` for local audits.

## LATER  
- Implement full `--check` mode and standardized exit-code logic per ADRs 0003/0004.  
- Add `.dry-aged-deps.json` config-file support to match documented options.  
- Reconcile or remove CHANGELOG.md in favor of GitHub Releases as per ADR 0005.  
- Once those features ship, update docs to remove “coming soon” notices and ensure examples are accurate.