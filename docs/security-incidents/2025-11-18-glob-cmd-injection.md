# glob CLI Command Injection Vulnerability

## 1. Classification

- Severity Level: P1: High (CWE-78, command injection)
- Impact:
  - Affected Versions: glob >=10.3.7 <=11.0.3 (transitive dependency in npm and @semantic-release)
  - Potential for remote code execution when using `-c/--cmd` flag with untrusted patterns

## 2. Triage

- Date reported: 2025-11-18
- Reporter: voder.ai automated audit
- Initial acknowledgment date: 2025-11-18
- Assigned to: Maintenance Team

## 3. Containment

- Added override in package.json to pin `glob` to version `^12.0.0` as an immediate mitigation
- Verify override effectiveness in CI pipeline

## 4. Eradication

- Monitor for official patch in downstream packages (e.g., npm, semantic-release)
- Update or replace any dependency still bundling vulnerable glob versions once patched

## 5. Recovery

- No user-facing impact expected; CI and test suites validate safe dependency state

## 6. Postmortem

- To be updated after full remediation and root cause analysis

## 7. Communication

- Internal stakeholders: Dev Team
- External communication: None required at this time
