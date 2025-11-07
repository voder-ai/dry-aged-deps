## NOW
Generate and commit a `package-lock.json` file to the repository to ensure reproducible dependency installs.

## NEXT
- Create and add a `LICENSE` file (MIT) at the project root, and update `package.json` to include `"license": "MIT"`.  
- Add a “License” section to `README.md` linking to the new `LICENSE` file.  
- Confirm the CI workflow continues to use `npm ci` against the committed lockfile.

## LATER
- Introduce a GitHub Actions secret-scanning job (e.g. TruffleHog or GitHub Advanced Security).  
- Integrate semantic-release (or changesets) for automated version bumps and changelog generation.  
- Add CI guardrails for lockfile consistency (e.g. `npm ci --dry-run`) and explore caching/batching of `npm view` calls to boost CLI performance.