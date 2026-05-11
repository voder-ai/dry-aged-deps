---
name: tech-lead
description: A technical lead who sets and enforces dependency-hygiene policy across one or more teams or projects.
---

# Tech Lead

## Who

A staff engineer, engineering manager, or security-conscious tech lead who is accountable for the dependency posture of a team, a product, or a portfolio of services. They do not necessarily run `npm outdated` themselves every day, but they decide what "safe enough" means for their context and they answer to auditors, customers, or executive stakeholders when a supply-chain incident occurs.

## Context Constraints

- Policy must be reviewable and version-controlled, not living in a single person's head.
- Different deployment surfaces have different risk profiles — production dependencies are not the same as build-time dev dependencies.
- The team's standards must remain auditable months later, including the rationale for every exception.
- They cannot impose so much process that engineers route around it; the policy must lower friction relative to manual checks, not raise it.
- They are sensitive to ecosystem changes — a new class of attack, a high-profile incident, a regulatory shift — and must be able to tighten policy quickly without rewriting tooling.

## Pain Points

- "We patch quickly" and "we wait for community validation" pull in opposite directions, and ad-hoc judgement does not scale.
- Per-team or per-project policy drifts when it is not centrally captured.
- Distinguishing prod and dev dependency risk is conceptually obvious but procedurally painful with stock npm tooling.
- Demonstrating to a customer or auditor that the team has a dependency-vetting process requires reproducible artefacts, not anecdotes.
- When a dependency that was safe last week turns out to be malicious this week, the lead needs to be able to find every project that took the bad version and act on it.
