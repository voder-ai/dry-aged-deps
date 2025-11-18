# Security Incident 006: glob CLI Command Injection and tar Race Condition Vulnerabilities

## 1. Classification

- Severity Level: P1: High
  - glob: CWE-78 (Command Injection) - CVE-2025-64756
  - tar: CWE-362 (Race Condition) - CVE-2025-64118

- Impact:
  - **glob vulnerability (GHSA-5j98-mcp5-4vw2)**:
    - Affected Versions: glob 10.3.7-10.4.5 and 11.0.0-11.0.3
    - Patched Versions: glob 10.5.0 and 11.1.0
    - Bundled in: npm 11.6.2 (within @semantic-release/npm 13.1.2)
    - Potential consequence: Command injection when using glob CLI with `-c/--cmd` flag on files with malicious names
    - **Actual risk for this project**: False positive - only affects glob CLI tool, not library usage
  - **tar vulnerability (GHSA-29xp-372q-xqph)**:
    - Affected Version: tar 7.5.1 (exact version only)
    - Patched Version: tar 7.5.2
    - Bundled in: npm 11.6.2 (within @semantic-release/npm 13.1.2)
    - Potential consequence: Uninitialized memory exposure in race condition with sync mode
    - **Actual risk for this project**: False positive - requires very specific conditions not present in this project

## 2. Triage

- Date reported: 2025-11-19
- Reporter: npm audit (CVE-2025-64756 published yesterday, CVE-2025-64118 published 3 weeks ago)
- Initial acknowledgment date: 2025-11-19
- Assigned to: Maintenance Team

## 3. Containment

- Steps to reproduce:

  ```bash
  npm audit
  # Shows 5 vulnerabilities (1 moderate, 4 high)
  # - glob: GHSA-5j98-mcp5-4vw2 (high)
  # - tar: GHSA-29xp-372q-xqph (moderate)
  # - npm, @semantic-release/npm, semantic-release: affected by bundled dependencies
  ```

- Immediate remediation actions:
  1. Updated @semantic-release/npm from 12.0.2 to 13.1.2
  2. Updated semantic-release from 24.2.0 to 25.0.2
  3. Updated package.json overrides:
     - glob: from `^12.0.0` to `^11.1.0` (correct patched version)
     - tar: to `^7.5.2` (patched version)
  4. Ran `npm install` to update dependencies
  5. Verified all tests pass (211 tests, 97.5% coverage)
  6. Verified linting and formatting checks pass

## 4. Eradication

- Root cause analysis:
  - The glob CLI command injection vulnerability (CVE-2025-64756) was discovered in glob versions 10.3.7-10.4.5 and 11.0.0-11.0.3
  - The vulnerability only affects the glob CLI when using `-c/--cmd` option with shell:true
  - glob is bundled within npm, which is bundled within @semantic-release/npm
  - Previous override to glob@12.0.0 was unnecessary; correct patched versions are 10.5.0 and 11.1.0
  - tar 7.5.1 has a race condition vulnerability affecting sync mode operations
  - Both vulnerabilities exist in bundled dependencies only, not direct dependencies

- Fix implemented:
  - Upgraded @semantic-release/npm to 13.1.2 (latest stable)
  - Upgraded semantic-release to 25.0.2 (latest stable)
  - Adjusted glob override to ^11.1.0 (actual patched version)
  - Added tar override to ^7.5.2 (patched version)
  - Note: Overrides cannot fully fix bundled dependencies, but they mitigate transitive dependency vulnerabilities

- Tests added:
  - No new tests required - existing test suite validates functionality remains intact
  - All 211 tests pass with 97.5% coverage

## 5. Recovery

- Validated changes:
  - ✅ All tests pass (211/211)
  - ✅ Linting passes
  - ✅ Formatting checks pass
  - ✅ Test coverage maintained at 97.5%
  - ✅ npm ls glob tar shows overrides applied where possible

- Monitoring:
  - npm audit still reports 5 vulnerabilities due to bundled dependencies in @semantic-release/npm
  - These are false positives for this project's usage pattern

## 6. Postmortem

- Detailed timeline of events:
  - 2025-11-18: CVE-2025-64756 published (glob CLI command injection)
  - 2025-10-29: CVE-2025-64118 published (tar race condition)
  - 2025-11-19: npm audit flagged vulnerabilities during routine check
  - 2025-11-19: Investigated vulnerabilities and determined actual risk
  - 2025-11-19: Upgraded packages and adjusted overrides
  - 2025-11-19: Verified all tests, linting, and formatting pass

- Lessons learned:
  1. **Not all npm audit warnings represent real vulnerabilities** - important to analyze the actual code path
  2. **Bundled dependencies cannot be fully patched with overrides** - they remain in the bundled package
  3. **glob CLI vulnerability doesn't affect library usage** - this project only uses glob as a library through other tools
  4. **tar vulnerability requires very specific conditions** - not present in this project's usage
  5. **Previous override to glob@12.0.0 was incorrect** - patched versions are 10.5.0 and 11.1.0

- Action items to prevent recurrence:
  1. ✅ Document actual vs. perceived risk in security incidents
  2. ✅ Maintain clear understanding of dependency usage patterns
  3. ✅ Investigate vulnerability details before applying fixes
  4. 🔄 Monitor for @semantic-release/npm updates that include patched npm bundle
  5. 🔄 Consider alternative release tooling if bundled dependency vulnerabilities persist

- Risk Assessment:
  - **glob vulnerability**: FALSE POSITIVE
    - Only affects glob CLI tool with `-c/--cmd` flag
    - This project doesn't use glob CLI
    - glob is only used as a library within bundled npm
    - No risk of exploitation in this project's context
  - **tar vulnerability**: FALSE POSITIVE
    - Only affects tar@7.5.1 in specific race condition scenarios with sync mode
    - This project doesn't use tar directly
    - tar is only bundled within npm for package operations
    - Requires attacker to manipulate files during npm operations
    - No practical risk for this project's usage

## 7. Communication

- Internal stakeholders: Dev Team
- External communication: Not required - false positive vulnerabilities in dev dependencies only
- Disclosure timeline: N/A

---

**Status**: Resolved (False Positives - No Actual Risk)

**Resolution Summary**: Upgraded @semantic-release/npm to 13.1.2 and semantic-release to 25.0.2, adjusted dependency overrides. Remaining npm audit warnings are false positives due to bundled dependencies that don't represent actual security risks for this project's usage patterns.

_Document created on 2025-11-19 using the Incident Response Template._
