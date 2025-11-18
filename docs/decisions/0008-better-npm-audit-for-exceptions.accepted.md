# 0008. Use better-npm-audit for Security Audit Exception Management

Date: 2025-11-19

## Status

Accepted

## Context

The project uses `npm audit` in CI/CD pipelines to detect security vulnerabilities in dependencies. However, npm audit lacks native support for exception management, which creates problems when:

1. **False Positives**: Vulnerabilities flagged in dev dependencies that don't represent actual security risks
2. **Bundled Dependencies**: Vulnerabilities in transitive dependencies bundled within packages (e.g., glob/tar within npm within @semantic-release/npm)
3. **CLI-Only Vulnerabilities**: Issues affecting command-line tools not used by the project
4. **CI Pipeline Failures**: Pre-push hooks and CI builds fail on vulnerabilities that have been analyzed and deemed non-threatening

### Specific Triggering Issues (2025-11-19)

npm audit reported 5 vulnerabilities (1 moderate, 4 high):

- **CVE-2025-64756 (GHSA-5j98-mcp5-4vw2)**: glob CLI command injection
  - Advisory IDs: 1109840, 1109841
  - Severity: High
  - Only affects glob CLI with `-c/--cmd` flag
  - Project only uses glob as a library (not CLI)
  - Bundled in npm→@semantic-release/npm (dev dependency)

- **CVE-2025-64118 (GHSA-29xp-372q-xqph)**: tar race condition
  - Advisory ID: 1109463
  - Severity: Moderate
  - Only affects tar@7.5.1 in specific sync mode race conditions
  - Project doesn't use tar directly
  - Bundled in npm→@semantic-release/npm (dev dependency)

All three advisories are documented as **false positives** in security incident 006-2025-11-19-glob-tar-vulnerabilities.md because:

- They only affect CLI tools or specific usage patterns not present in this project
- They exist in bundled dev dependencies used only during releases
- Dependency overrides cannot fix bundled dependencies
- No practical security risk to the project

### Problem with Native npm audit

npm audit has no built-in mechanism to:

- Document analyzed and accepted vulnerabilities
- Exclude specific advisories from failing builds
- Differentiate between actual risks and false positives
- Maintain an audit trail of security decisions

Workarounds attempted:

1. `npm audit --audit-level=high || exit 0` - Silences ALL vulnerabilities (unacceptable)
2. Manual filtering in CI scripts - Complex, error-prone, hard to maintain
3. Dependency overrides - Don't work for bundled dependencies

## Decision

**Use better-npm-audit for security audit exception management in CI/CD pipelines.**

Implementation:

1. Install `better-npm-audit` as a dev dependency
2. Create `.nsprc` configuration file to document excluded advisories
3. Update `audit:ci` script to use `better-npm-audit` with explicit exclusions
4. Maintain exception list in sync with security incident documentation

### Configuration

**package.json**:

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

**.nsprc**:

```json
{
  "comments": [
    "Security audit exceptions for better-npm-audit",
    "See docs/security-incidents/006-2025-11-19-glob-tar-vulnerabilities.md for details"
  ],
  "exceptions": ["1109840", "1109841", "1109463"]
}
```

## Consequences

### Positive

- **Clear Exception Management**: Documented, version-controlled list of accepted vulnerabilities
- **CI Pipeline Reliability**: Builds pass when vulnerabilities are analyzed and deemed safe
- **Security Incident Traceability**: `.nsprc` references security incident documentation
- **Maintains Security Checks**: Still catches new, unexcepted vulnerabilities
- **Team Communication**: Explicit exception list shows security has been evaluated
- **Audit Trail**: Git history shows when/why exceptions were added
- **Better UX**: Clear output showing which vulnerabilities are excepted and why

### Negative

- **Additional Dependency**: Adds `better-npm-audit` to dev dependencies (~8 packages)
- **Maintenance Overhead**: Exception list must be updated when advisories resolve
- **Potential for Complacency**: Risk of exceptions being added without proper analysis
- **Not Standard npm**: Diverges from native npm audit (but npm audit has no exception support)
- **Package Maintenance**: Depends on third-party package maintenance

### Neutral

- **Configuration File**: `.nsprc` becomes part of project configuration to maintain
- **Documentation Requirement**: Each exception should reference security incident doc
- **Review Process**: Exceptions should be reviewed periodically (quarterly recommended)

## Implementation

### Initial Setup

1. Install package:

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

3. Update package.json scripts:
   ```json
   {
     "audit:ci": "better-npm-audit audit --level high --exclude <advisory-ids>"
   }
   ```

### Exception Management Process

When a new vulnerability is flagged:

1. **Analyze**: Determine if it's a real threat or false positive
2. **Document**: Create security incident file in `docs/security-incidents/`
3. **Decide**:
   - If genuine risk: Fix immediately (upgrade, workaround, or mitigate)
   - If false positive: Add to exceptions with documentation
4. **Add Exception**:
   - Add advisory ID to `.nsprc` exceptions array
   - Add advisory ID to `--exclude` flag in `audit:ci` script
   - Reference incident doc in `.nsprc` comments
5. **Commit**: Include both `.nsprc` and incident doc in same commit
6. **Review**: Quarterly review to remove resolved exceptions

### Exception Removal Process

When an exception should be removed:

1. **Verify Fix**: Confirm vulnerability is patched in dependencies
2. **Remove from .nsprc**: Delete advisory ID from exceptions array
3. **Remove from audit:ci**: Delete advisory ID from `--exclude` flag
4. **Update Incident Doc**: Mark as resolved in security incident file
5. **Test**: Run `npm run audit:ci` to verify no new failures
6. **Commit**: Include updated `.nsprc` and incident doc

### Current Exceptions (2025-11-19)

| Advisory | Vulnerability                              | Status         | Justification                                                                                       |
| -------- | ------------------------------------------ | -------------- | --------------------------------------------------------------------------------------------------- |
| 1109840  | glob CLI command injection (10.3.7-10.4.5) | False Positive | Only affects glob CLI; project uses glob as library only. Bundled in dev dependency.                |
| 1109841  | glob CLI command injection (11.0.0-11.0.3) | False Positive | Only affects glob CLI; project uses glob as library only. Bundled in dev dependency.                |
| 1109463  | tar race condition (7.5.1)                 | False Positive | Requires specific sync mode race condition not present in project usage. Bundled in dev dependency. |

See: `docs/security-incidents/006-2025-11-19-glob-tar-vulnerabilities.md`

## Alternatives Considered

### Continue with `npm audit || exit 0`

**Approach**: Make audit:ci always succeed regardless of findings

**Pros**:

- No additional dependencies
- Simple, minimal configuration
- Works with native npm

**Cons**:

- **Silences ALL vulnerabilities**: Defeats purpose of security auditing
- **No differentiation**: Can't distinguish false positives from real threats
- **No audit trail**: No record of security decisions
- **High risk**: New vulnerabilities won't fail CI

**Rejection Reason**: Completely undermines security posture. Unacceptable.

### Manual Advisory Filtering in CI Scripts

**Approach**: Parse `npm audit --json` and filter specific advisories

**Pros**:

- No additional dependencies
- Full control over filtering logic
- Can customize error messages

**Cons**:

- **Complex implementation**: Requires JSON parsing, advisory ID extraction
- **Error-prone**: Easy to miss edge cases in filtering logic
- **Hard to maintain**: Custom scripts need updates for npm audit format changes
- **Poor UX**: Custom error messages harder to standardize
- **Not reusable**: Can't leverage community-maintained tooling

**Rejection Reason**: Reinventing the wheel. better-npm-audit is well-maintained and battle-tested.

### Use audit-ci Package

**Approach**: Use `audit-ci` package instead of `better-npm-audit`

**Pros**:

- Similar exception management capabilities
- Popular package (1M+ weekly downloads)
- Supports multiple package managers (npm, yarn, pnpm)
- JSON configuration for allowlists

**Cons**:

- **More complex config**: Requires more configuration than better-npm-audit
- **Heavier dependency**: Larger package with more dependencies
- **Overkill for npm-only**: Multi-package-manager support not needed
- **Less intuitive CLI**: More flags and options to learn

**Rejection Reason**: better-npm-audit is simpler, lighter, and sufficient for npm-only projects.

### Use npm-audit-resolver

**Approach**: Interactive tool for resolving audit findings

**Pros**:

- Interactive workflow for analyzing vulnerabilities
- Creates audit resolution files
- Workflow-oriented approach

**Cons**:

- **Interactive**: Requires manual input (not suitable for CI/CD)
- **Resolution files**: Additional configuration format to maintain
- **Heavier workflow**: More complex than simple exception list
- **Less maintained**: Fewer updates, smaller community

**Rejection Reason**: Too interactive for automated CI/CD. better-npm-audit's declarative approach is more suitable.

### Use Snyk or Other Commercial Tools

**Approach**: Use commercial vulnerability scanning service

**Pros**:

- Professional vulnerability database
- Advanced analysis and recommendations
- Integration with dev workflows
- Automatic PR generation for fixes

**Cons**:

- **Cost**: Requires paid subscription for private repos
- **Complexity**: Much more complex than needed
- **External dependency**: Relies on third-party service
- **Overkill**: Project's security needs are modest

**Rejection Reason**: Overkill for a small open-source project. Native npm audit + better-npm-audit is sufficient.

### Accept All Dev Dependency Vulnerabilities

**Approach**: Use `npm audit --omit=dev` to skip dev dependencies entirely

**Pros**:

- Simple configuration
- No additional dependencies
- Fast audit

**Cons**:

- **Too coarse**: Would miss genuine dev dependency vulnerabilities
- **False security**: Dev dependencies can have real security implications
- **Poor practice**: Dev tools can compromise build pipeline

**Rejection Reason**: Dev dependencies can have security implications (supply chain attacks, credential theft). Need granular control, not blanket exclusion.

## Related Decisions

- **Security Incident 006**: Documents the specific false positive vulnerabilities that triggered this decision
- **ADR 0005**: Semantic Release - Uses @semantic-release/npm which contains the bundled vulnerable dependencies

## References

- [better-npm-audit GitHub](https://github.com/jeemok/better-npm-audit)
- [npm audit documentation](https://docs.npmjs.com/cli/v10/commands/npm-audit)
- [Security Incident 006](../security-incidents/006-2025-11-19-glob-tar-vulnerabilities.md)
- [GHSA-5j98-mcp5-4vw2](https://github.com/advisories/GHSA-5j98-mcp5-4vw2) - glob CLI command injection
- [GHSA-29xp-372q-xqph](https://github.com/advisories/GHSA-29xp-372q-xqph) - tar race condition

## Review Schedule

This decision and exception list should be reviewed:

- **Quarterly**: Review exception list for resolved vulnerabilities
- **When Adding Exceptions**: Each new exception requires security incident documentation
- **After Security Incidents**: When new vulnerabilities are discovered
- **Package Updates**: When updating @semantic-release/npm or other security-sensitive dependencies
- **Annually**: Full review of exception management process

### Exception Cleanup Criteria

Remove exceptions when:

1. Vulnerability is patched in dependencies (verify with `npm audit`)
2. Vulnerable package is removed from dependency tree
3. Package containing vulnerability is upgraded beyond vulnerable range
4. Advisory is withdrawn or marked as invalid

### Process Improvement Triggers

Reconsider this decision if:

1. better-npm-audit is no longer maintained
2. npm audit adds native exception support
3. Exception list grows beyond 10 advisories (indicates systemic issue)
4. Genuine vulnerabilities are accidentally excepted (process failure)
5. Team finds better-npm-audit too cumbersome
