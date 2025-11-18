title: 'Security Incident 004: glob package vulnerability GHSA-5j98-mcp5-4vw2'
incident_id: 004
date: 2024-06-12
summary: |
  A prototype pollution vulnerability was discovered in the glob package (GHSA-5j98-mcp5-4vw2).
  This affects both direct glob dependencies and npm’s bundled glob versions.
vulnerability:
  id: GHSA-5j98-mcp5-4vw2
  severity: high
  description: |
    The glob package before version 12.0.0 is vulnerable to prototype pollution,
    which can lead to arbitrary code execution in downstream applications.
affected_packages:
  - name: glob
    affected_versions: '<12.0.0'
  - name: npm
    affected_versions: '<11.6.2'
resolution:
  action: |
    Add dependency overrides to enforce safe versions of glob and npm.
  overrides:
    glob: '^12.0.0'
    npm: '^11.6.2'
status: resolved
references:
  - url: 'https://github.com/advisories/GHSA-5j98-mcp5-4vw2'
    title: 'Prototype Pollution in glob'
