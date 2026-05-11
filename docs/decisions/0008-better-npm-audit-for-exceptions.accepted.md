---
status: 'accepted'
date: 2025-11-19
decision-makers: ['Tom Howard']
consulted: []
informed: []
reassessment-date: 2026-05-19
---

# 0008. Use better-npm-audit for Security Audit Exception Management

## Context and Problem Statement

The project uses `npm audit` in CI/CD pipelines to detect security vulnerabilities in dependencies. However, `npm audit` lacks native support for exception management, which creates problems when:

1. **False positives**: vulnerabilities flagged in dev dependencies that don't represent actual security risks.
2. **Bundled dependencies**: vulnerabilities in transitive dependencies bundled within packages (for example glob/tar within npm within `@semantic-release/npm`).
3. **CLI-only vulnerabilities**: issues affecting command-line tools not used by the project.
4. **CI pipeline failures**: pre-push hooks and CI builds fail on vulnerabilities that have been analysed and deemed non-threatening.

### Specific triggering issues (2025-11-19)

`npm audit` reported 5 vulnerabilities (1 moderate, 4 high):

- **CVE-2025-64756 (GHSA-5j98-mcp5-4vw2)**: glob CLI command injection.
  - Advisory IDs: 1109840, 1109841.
  - Severity: High.
  - Only affects glob CLI with `-c/--cmd` flag.
  - Project only uses glob as a library (not CLI).
  - Bundled in `npm` → `@semantic-release/npm` (dev dependency).

- **CVE-2025-64118 (GHSA-29xp-372q-xqph)**: tar race condition.
  - Advisory ID: 1109463.
  - Severity: Moderate.
  - Only affects tar@7.5.1 in specific sync-mode race conditions.
  - Project doesn't use tar directly.
  - Bundled in `npm` → `@semantic-release/npm` (dev dependency).

All three advisories are documented as **false positives** in security incident `006-2025-11-19-glob-tar-vulnerabilities.md` because:

- They only affect CLI tools or specific usage patterns not present in this project.
- They exist in bundled dev dependencies used only during releases.
- Dependency overrides cannot fix bundled dependencies.
- No practical security risk to the project.

### Problem with native `npm audit`

`npm audit` has no built-in mechanism to:

- Document analysed and accepted vulnerabilities.
- Exclude specific advisories from failing builds.
- Differentiate between actual risks and false positives.
- Maintain an audit trail of security decisions.

Workarounds attempted:

1. `npm audit --audit-level=high || exit 0` — silences ALL vulnerabilities (unacceptable).
2. Manual filtering in CI scripts — complex, error-prone, hard to maintain.
3. Dependency overrides — don't work for bundled dependencies.

## Decision Drivers

- **Documented exception trail**: every accepted exception must be auditable.
- **CI reliability**: builds must pass when vulnerabilities are analysed and deemed safe.
- **Audit traceability**: `.nsprc` must reference security-incident documentation.
- **Maintain security checks**: still catch new, unexcepted vulnerabilities.
- **Lightweight tooling**: prefer a small, well-maintained tool over commercial services or bespoke scripts.

## Considered Options

1. **`better-npm-audit` for security-audit exception management.**
2. **Continue with `npm audit || exit 0`.**
3. **Manual advisory filtering in CI scripts.**
4. **`audit-ci` package.**
5. **`npm-audit-resolver`.**
6. **Commercial tools (Snyk, etc.).**
7. **Accept all dev-dependency vulnerabilities via `--omit=dev`.**

## Decision Outcome

Chosen option: **Use `better-npm-audit` for security audit exception management in CI/CD pipelines**, because it provides a declarative, version-controlled exception list with an audit trail, while still catching new vulnerabilities.

### Implementation

1. Install `better-npm-audit` as a dev dependency.
2. Create `.nsprc` configuration file to document excluded advisories.
3. Update `audit:ci` script to use `better-npm-audit` with explicit exclusions.
4. Maintain the exception list in sync with security-incident documentation.

### Configuration

**`package.json`:**

```json
{
  "scripts": {
    "audit:ci": "better-npm-audit audit --level high --exclude 1109840,1109841,1109463"
  },
  "devDependencies": {
    "better-npm-audit": "^3.x.x"
  }
}
```

**`.nsprc`:**

```json
{
  "comments": [
    "Security audit exceptions for better-npm-audit",
    "See docs/security-incidents/006-2025-11-19-glob-tar-vulnerabilities.md for details"
  ],
  "exceptions": ["1109840", "1109841", "1109463"]
}
```

### Initial setup

1. Install the package:

   ```bash
   npm install --save-dev better-npm-audit
   ```

2. Create `.nsprc`:

   ```json
   {
     "comments": [
       "Security audit exceptions for better-npm-audit",
       "See docs/security-incidents/ for detailed analysis"
     ],
     "exceptions": []
   }
   ```

3. Update `package.json` scripts:

   ```json
   {
     "audit:ci": "better-npm-audit audit --level high --exclude <advisory-ids>"
   }
   ```

## Consequences

### Good

- **Clear exception management**: documented, version-controlled list of accepted vulnerabilities.
- **CI pipeline reliability**: builds pass when vulnerabilities are analysed and deemed safe.
- **Security-incident traceability**: `.nsprc` references security-incident documentation.
- **Maintains security checks**: still catches new, unexcepted vulnerabilities.
- **Team communication**: explicit exception list shows security has been evaluated.
- **Audit trail**: git history shows when/why exceptions were added.
- **Better UX**: clear output showing which vulnerabilities are excepted and why.

### Neutral

- **Configuration file**: `.nsprc` becomes part of project configuration to maintain.
- **Documentation requirement**: each exception should reference security-incident documentation.
- **Review process**: exceptions should be reviewed periodically (quarterly recommended).

### Bad

- **Additional dependency**: adds `better-npm-audit` to dev dependencies (~8 packages).
- **Maintenance overhead**: the exception list must be updated when advisories resolve.
- **Potential for complacency**: risk of exceptions being added without proper analysis.
- **Not standard npm**: diverges from native `npm audit` (but npm audit has no exception support).
- **Package maintenance**: depends on third-party package maintenance.

## Confirmation

This decision is implemented when all of the following hold:

1. `better-npm-audit` is installed as a dev dependency.
2. `.nsprc` exists with `comments` and `exceptions` fields.
3. `package.json` `audit:ci` script invokes `better-npm-audit audit --level high --exclude <ids>` with the same advisory IDs that appear in `.nsprc.exceptions`.
4. Every excluded advisory ID has a corresponding security-incident document under `docs/security-incidents/`.
5. The `audit:ci` `--exclude` list and `.nsprc.exceptions` list never diverge.
6. `npm run audit:ci` passes on a clean working tree.

### Exception management process

When a new vulnerability is flagged:

1. **Analyse**: determine if it's a real threat or a false positive.
2. **Document**: create a security-incident file in `docs/security-incidents/`.
3. **Decide**:
   - If genuine risk: fix immediately (upgrade, workaround, or mitigate).
   - If false positive: add to exceptions with documentation.
4. **Add exception**:
   - Add the advisory ID to `.nsprc.exceptions`.
   - Add the advisory ID to the `--exclude` flag in `audit:ci`.
   - Reference the incident document in `.nsprc.comments`.
5. **Commit**: include both `.nsprc` and the incident document in the same commit.
6. **Review**: quarterly review to remove resolved exceptions.

### Exception removal process

When an exception should be removed:

1. **Verify fix**: confirm vulnerability is patched in dependencies.
2. **Remove from `.nsprc`**: delete advisory ID from the exceptions array.
3. **Remove from `audit:ci`**: delete advisory ID from the `--exclude` flag.
4. **Update incident doc**: mark as resolved in the security-incident file.
5. **Test**: run `npm run audit:ci` to verify no new failures.
6. **Commit**: include updated `.nsprc` and incident doc.

### Current exceptions (2025-11-19)

| Advisory | Vulnerability                              | Status         | Justification                                                                                       |
| -------- | ------------------------------------------ | -------------- | --------------------------------------------------------------------------------------------------- |
| 1109840  | glob CLI command injection (10.3.7-10.4.5) | False Positive | Only affects glob CLI; project uses glob as library only. Bundled in dev dependency.                |
| 1109841  | glob CLI command injection (11.0.0-11.0.3) | False Positive | Only affects glob CLI; project uses glob as library only. Bundled in dev dependency.                |
| 1109463  | tar race condition (7.5.1)                 | False Positive | Requires specific sync-mode race condition not present in project usage. Bundled in dev dependency. |

See: `docs/security-incidents/006-2025-11-19-glob-tar-vulnerabilities.md`.

## Pros and Cons of the Options

### Option 1 — `better-npm-audit` (chosen)

- Good: declarative, auditable exception list.
- Good: maintains real security checks for unexcepted advisories.
- Good: simple, well-maintained, lightweight.
- Bad: third-party dependency; potential maintenance risk.

### Option 2 — Continue with `npm audit || exit 0`

**Approach**: make `audit:ci` always succeed regardless of findings.

- Good: no additional dependencies.
- Good: simple, minimal configuration.
- Good: works with native npm.
- Bad: **silences ALL vulnerabilities** — defeats the purpose of security auditing.
- Bad: **no differentiation** — can't distinguish false positives from real threats.
- Bad: **no audit trail** — no record of security decisions.
- Bad: **high risk** — new vulnerabilities won't fail CI.
- Rejection reason: completely undermines security posture. Unacceptable.

### Option 3 — Manual advisory filtering in CI scripts

**Approach**: parse `npm audit --json` and filter specific advisories.

- Good: no additional dependencies.
- Good: full control over filtering logic.
- Good: can customise error messages.
- Bad: complex implementation (JSON parsing, advisory-ID extraction).
- Bad: error-prone (easy to miss edge cases).
- Bad: hard to maintain (custom scripts need updates for npm audit format changes).
- Bad: poor UX (custom error messages harder to standardise).
- Bad: not reusable (can't leverage community-maintained tooling).
- Rejection reason: reinventing the wheel. `better-npm-audit` is well-maintained and battle-tested.

### Option 4 — `audit-ci` package

**Approach**: use `audit-ci` instead of `better-npm-audit`.

- Good: similar exception-management capabilities.
- Good: popular package (1M+ weekly downloads).
- Good: supports multiple package managers (npm, yarn, pnpm).
- Good: JSON configuration for allowlists.
- Bad: more complex config than `better-npm-audit`.
- Bad: heavier dependency.
- Bad: overkill for npm-only.
- Bad: less intuitive CLI.
- Rejection reason: `better-npm-audit` is simpler, lighter, and sufficient for npm-only projects.

### Option 5 — `npm-audit-resolver`

**Approach**: interactive tool for resolving audit findings.

- Good: interactive workflow for analysing vulnerabilities.
- Good: creates audit resolution files.
- Good: workflow-oriented approach.
- Bad: interactive — requires manual input (not suitable for CI/CD).
- Bad: additional configuration format to maintain.
- Bad: heavier workflow than a simple exception list.
- Bad: less maintained; smaller community.
- Rejection reason: too interactive for automated CI/CD. `better-npm-audit`'s declarative approach is more suitable.

### Option 6 — Snyk or other commercial tools

**Approach**: commercial vulnerability-scanning service.

- Good: professional vulnerability database.
- Good: advanced analysis and recommendations.
- Good: integration with dev workflows.
- Good: automatic PR generation for fixes.
- Bad: requires paid subscription for private repos.
- Bad: much more complex than needed.
- Bad: external dependency on a third-party service.
- Bad: overkill — project's security needs are modest.
- Rejection reason: overkill for a small open-source project. Native `npm audit` + `better-npm-audit` is sufficient.

### Option 7 — Accept all dev-dependency vulnerabilities via `--omit=dev`

- Good: simple configuration.
- Good: no additional dependencies.
- Good: fast audit.
- Bad: too coarse — would miss genuine dev-dependency vulnerabilities.
- Bad: false security — dev dependencies can have real security implications.
- Bad: poor practice — dev tools can compromise the build pipeline.
- Rejection reason: dev dependencies can have security implications (supply-chain attacks, credential theft). Need granular control, not blanket exclusion.

## Reassessment Criteria

This decision and exception list should be reviewed:

- **Quarterly**: review the exception list for resolved vulnerabilities.
- **When adding exceptions**: each new exception requires security-incident documentation.
- **After security incidents**: when new vulnerabilities are discovered.
- **Package updates**: when updating `@semantic-release/npm` or other security-sensitive dependencies.
- **Annually**: full review of the exception-management process.

### Exception cleanup criteria

Remove exceptions when:

1. The vulnerability is patched in dependencies (verify with `npm audit`).
2. The vulnerable package is removed from the dependency tree.
3. The package containing the vulnerability is upgraded beyond the vulnerable range.
4. The advisory is withdrawn or marked as invalid.

### Process-improvement triggers

Reconsider this decision if:

1. `better-npm-audit` is no longer maintained.
2. `npm audit` adds native exception support.
3. The exception list grows beyond 10 advisories (indicates a systemic issue).
4. Genuine vulnerabilities are accidentally excepted (process failure).
5. The team finds `better-npm-audit` too cumbersome.

## Related Decisions

- **ADR-0005**: Semantic Release — uses `@semantic-release/npm`, which contains the bundled vulnerable dependencies that motivated this decision.
- **Security Incident 006**: documents the specific false-positive vulnerabilities that triggered this decision.

## References

- [better-npm-audit GitHub](https://github.com/jeemok/better-npm-audit)
- [npm audit documentation](https://docs.npmjs.com/cli/v10/commands/npm-audit)
- [Security Incident 006](../security-incidents/006-2025-11-19-glob-tar-vulnerabilities.md)
- [GHSA-5j98-mcp5-4vw2](https://github.com/advisories/GHSA-5j98-mcp5-4vw2) — glob CLI command injection.
- [GHSA-29xp-372q-xqph](https://github.com/advisories/GHSA-29xp-372q-xqph) — tar race condition.
