## NOW
Modify the “Check tag matches version” step in `.github/workflows/ci-publish.yml` to retrieve the package version via  
```bash
npm pkg get version | tr -d '"'
```  
instead of using `require('./package.json')`, so the Git tag vs. `package.json` version comparison succeeds under ESM.

## NEXT
- Examine the latest CI logs for lockfile‐drift, `npm audit`, lint or test failures; reproduce locally, apply fixes (e.g. commit updated lockfile, adjust audit/lint rules), and push the corrections.  
- Update the build‐status badge in `README.md` to point at the now‐stable workflow URL and branch.  
- Add a build‐stage validation step that runs `dry-aged-deps --version` and checks its output matches the `package.json` version.

## LATER
- Replace the manual tag/version check with semantic‐release’s built‐in verification (`@semantic-release/verify‐release`).  
- Configure GitHub Actions notifications (Slack/email) for CI or post‐publish smoke‐test failures.  
- Introduce Renovate for automated dependency updates, auto‐merging non‐breaking changes once CI is fully stable.