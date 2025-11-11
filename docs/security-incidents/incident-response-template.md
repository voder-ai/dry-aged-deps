# Incident Response Template

This document provides a template for responding to security incidents affecting `dry-aged-deps`.

## 1. Classification

- Severity Level:
  - P0: Critical (e.g., remote code execution)
  - P1: High (e.g., data exposure)
  - P2: Medium (e.g., DOS without critical data exposure)
  - P3: Low (e.g., minor info leak or performance glitch)

- Impact:
  - List affected versions
  - Describe potential consequences

## 2. Triage

- Date reported:
- Reporter:
- Initial acknowledgment date:
- Assigned to (Team/Individual):

## 3. Containment

- Steps to reproduce:
- Immediate remediation actions (e.g., disable feature, patch release)

## 4. Eradication

- Root cause analysis:
- Fix implemented:
- Tests added:

## 5. Recovery

- Validate patch in staging environment
- Roll out fix to production
- Monitor logs and metrics for anomalies

## 6. Postmortem

- Detailed timeline of events
- Lessons learned
- Action items to prevent recurrence

## 7. Communication

- Internal stakeholders:
- External communication (e.g., advisory, users)
- Disclosure timeline

---

*This document is a template and should be updated with incident-specific details.*