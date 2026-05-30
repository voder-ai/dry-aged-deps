---
status: proposed
rfc-id: exposure-aware-severity-scaled-soak
reported: 2026-05-30
decision-makers: [Tom Howard]
problems: [P014]
adrs: [ADR-0019]
jtbd: []
stories: []
---

# RFC-002: Exposure-Aware Severity-Scaled Age Soak

**Status**: proposed
**Reported**: 2026-05-30
**Problems**: P014
**ADRs**: ADR-0019
**JTBD**: (deferred — manage-rfc accepted-transition should cite JTBD-001 / JTBD-006 / project-maintainer / tech-lead pending ratification)

## Summary

Replace `dry-aged-deps`' unconditional age soak (default 7 days) with an exposure-aware, severity-scaled soak: when current `npm audit` exposure includes vulnerabilities at a given severity band, the soak is shortened (or eliminated) so the operator can pull a fix sooner than the default wait. The soak becomes a function of current-exposure severity, not a flat wall-clock minimum.

**Policy locked at capture (per user direction confirmed in P013/P014 AFK loop 2026-05-30 Step 2.5 surfacing, commit baee7a1):**

| Current exposure severity | Soak modifier                               |
| ------------------------- | ------------------------------------------- |
| Critical                  | **0-day floor** (no soak; pull immediately) |
| High                      | **½ × default soak**                        |
| Moderate / Low / None     | default soak (unchanged)                    |

The RFC may extend this shape with additional bands (e.g. a critical-high split, dual-severity composition) but MUST NOT regress the two locked points (critical → 0, high → 0.5 × default) without an explicit policy-change ADR.

Direction codified in P014's Fix Strategy section (commit baee7a1). The RFC framework was adopted via ADR-0019 in the same session (commit f8c8e1e).

## Driving problem trace

- **P014** (the age soak is unconditional — it ignores the severity of the vulnerability the project is currently exposed to) — symptom: when a project is currently exposed to a Critical vulnerability and the fix lands in a fresh dependency release, the operator must either wait the default 7-day soak (continued exposure) or override `--min-age=0` manually for every invocation. The policy gives the same default soak to a routine version bump and to a fix for a Critical zero-day, which is wrong by construction.

## Scope

(deferred — populate at /wr-itil:manage-rfc accepted transition)

## Tasks

- [ ] (deferred — populate at /wr-itil:manage-rfc accepted transition)

## Commits

(maintained automatically — populated by the commit-message RFC trailer hook per ADR-060 Phase 1 item 12)

## Related

- P014 — driving problem ticket
- ADR-0019 — governance ADR adopting the Problem-RFC-Story framework
- AFK loop 2026-05-30 Step 2.5 surfacing — user direction recorded in P014 Fix Strategy section (commit baee7a1)
- ADR-0018 (unfixable surface) — composes with this RFC at the audit-pipeline boundary (both consume `npm audit` severity)

(captured via /wr-itil:capture-rfc; expand at next /wr-itil:manage-rfc invocation)
