## NOW
Create a new file at the project root named **SECURITY.md** that contains a draft security policy outlining scope, vulnerability reporting procedures, and an incident response process.

## NEXT
- Add an **incident response template** in a new `docs/security-incidents/incident-response-template.md` file with triage steps, roles, and communication guidelines.  
- Update the CI workflow (`.github/workflows/ci-publish.yml`) to include an `npm audit --audit-level=moderate` step (failing on vulnerabilities) and enable GitHub CodeQL scanning.  
- Link the new **SECURITY.md** from `README.md` under a “Security Policy” section and update `docs/developer-guidelines.md` to reference it.

## LATER
- Integrate automated Dependabot PR reviews and merges for approved patch-level fixes.  
- Schedule periodic security drills and policy reviews (e.g., annually).  
- Explore adding third-party security scanners (e.g., Snyk) and secret-scanning actions to the CI pipeline.