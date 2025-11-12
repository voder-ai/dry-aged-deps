# Security Policy

This document outlines the security policy for the `dry-aged-deps` project, including how to report vulnerabilities and our incident response process.

## Supported Versions

`dry-aged-deps` follows [Semantic Versioning](https://semver.org/). Supported versions for security fixes are:

- **Latest**: All patches and minor releases of the current major version.
- **Legacy**: None (no backports for versions < current major).

## Reporting a Vulnerability

If you discover a security vulnerability in `dry-aged-deps`, please report it through one of the following channels:

1. **GitHub Security Advisories**: Open a private security advisory at https://github.com/voder-ai/dry-aged-deps/security/advisories.
2. **Email**: Send details to `security@voder.ai` with subject line `[dry-aged-deps Security]`.

Please include:

- A description of the vulnerability and impact.
- Steps to reproduce (if possible).
- Suggested mitigation or patch.

## Security Contact

- Primary Maintainer: @voder-ai
- Security Team Email: `security@voder.ai`

## Supported Environments

`dry-aged-deps` is developed and tested against Node.js 18+. We recommend using the latest LTS release.

## Vulnerability Response Process

1. **Acknowledgment**: We will acknowledge receipt within 48 hours.
2. **Investigation**: We aim to complete initial triage within 7 days.
3. **Fix Development**: A patch or mitigation will be developed and tested.
4. **Disclosure**:
   - We will follow coordinated disclosure best practices.
   - Release notes will include CVE identifiers when assigned.

## Incident Response

See `docs/security-incidents/incident-response-template.md` for detailed triage and response steps.

## CI Audit in CI Pipeline

The CI & Publish workflow defined in `.github/workflows/ci-publish.yml` now runs `npm audit --audit-level=moderate` across all dependencies (production and development) without the `--production` flag to ensure no known vulnerabilities are missed.

---

_This policy may be updated periodically. See version history in `CHANGELOG.md` for changes._
