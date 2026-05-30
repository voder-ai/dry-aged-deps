---
status: accepted
rfc-id: exposure-aware-severity-scaled-soak
reported: 2026-05-30
decision-makers: [Tom Howard]
problems: [P014]
adrs: [ADR-0003, ADR-0018, ADR-0019]
jtbd: []
stories: []
---

# RFC-002: Exposure-Aware Severity-Scaled Age Soak

**Status**: accepted
**Reported**: 2026-05-30
**Problems**: P014
**ADRs**: ADR-0003, ADR-0018, ADR-0019
**JTBD**: (deferred — jtbd: [] per inverse-P078 guard; cited JTBDs JTBD-001 / JTBD-006 are unratified locally. Body Related section preserves descriptive references; load-bearing cites land in a follow-up manage-rfc update once the cited JTBDs reach `human-oversight: confirmed`.)

## Summary

Replace `dry-aged-deps`' unconditional age soak (default 7 days) with an exposure-aware, severity-scaled soak: when current `npm audit` exposure includes vulnerabilities at a given severity band, the soak is shortened (or eliminated) so the operator can pull a fix sooner than the default wait. The soak becomes a function of current-exposure severity, not a flat wall-clock minimum.

**Policy locked at capture (per user direction confirmed in P013/P014 AFK loop 2026-05-30 Step 2.5 surfacing, commit baee7a1):**

| Current exposure severity | Soak modifier                               |
| ------------------------- | ------------------------------------------- |
| Critical                  | **0-day floor** (no soak; pull immediately) |
| High                      | **½ × default soak**                        |
| Moderate / Low / None     | default soak (unchanged)                    |

The RFC may extend this shape with additional bands (e.g. a critical-high split, dual-severity composition) but MUST NOT regress the two locked points (critical → 0, high → 0.5 × default) without an explicit policy-change ADR.

**Default-OFF for v1**: the policy ships behind an opt-in flag (`--exposure-aware-soak`). Existing-user trust contract (JTBD-006) is preserved on next minor — non-opt-in users see unchanged soak behaviour. v2 graduation triggers documented in `## Reassessment` section below.

Direction codified in P014's Fix Strategy section (commit baee7a1). The RFC framework was adopted via ADR-0019 in the same session (commit f8c8e1e; expansion 2b01e0c).

## Driving problem trace

- **P014** (the age soak is unconditional — it ignores the severity of the vulnerability the project is currently exposed to) — symptom: when a project is currently exposed to a Critical vulnerability and the fix lands in a fresh dependency release, the operator must either wait the default 7-day soak (continued exposure) or override `--min-age=0` manually for every invocation. The policy gives the same default soak to a routine version bump and to a fix for a Critical zero-day, which is wrong by construction.

## Scope

### In scope

1. **Extract current-exposure severity** — for each installed package version (NOT each candidate version), read its current advisory exposure from `npm audit --json`. Confirms the same field set used by `src/check-vulnerabilities.js` already covers the installed-version case (Investigation Task in P014 noted `fixAvailable: true` is reliably surfaced).
2. **Implement the severity → soak-modifier policy** — apply the locked policy table verbatim: Critical → 0 × default soak (i.e. 0-day floor); High → 0.5 × default soak; Moderate / Low / None → 1.0 × default soak (unchanged). Single-severity decision per package (no dual-severity composition in v1).
3. **Apply per-package soak shortening** in `src/apply-filters.js` (or its successor in the current layout). The soak modifier affects WHICH safe-update candidates pass the age gate for a given installed package, not the global `min-age` default. A separate vulnerable package with default-severity exposure still applies the full soak.
4. **CLI flag** — `--exposure-aware-soak` opt-in flag, **default-OFF for v1**. Mirrors the conservative-default discipline: opt-in users dogfood the policy first; default-flip to opt-out is a v2 decision requiring its own ADR per the graduation triggers below. Composes with existing `--min-age=<N>` (the modifier scales whatever the operator's `min-age` is, not a hard-coded 7).
5. **Report which packages had soak-shortened** — when an opt-in user runs the tool, mark in the safe-updates output section which entries (if any) were age-permitted ONLY because of the exposure-aware modifier. Transparency for operators: "this update appeared sooner than the soak default because you're currently exposed to a Critical vuln in this package."
6. **Exit-code semantics unchanged** — the soak modifier affects WHICH safe updates surface in the safe-update set, not the exit-code trigger. `--check` exit-1 fires when ≥ 1 safe update is available, same as before. The set membership changes; the trigger condition does not (per ADR-0003 + ADR-0018 contract preservation).

### Out of scope

- **Dual-severity composition** — i.e. "if a Critical and a High coexist in the same package, what's the effective modifier?" v1 takes the highest single severity. Composition shapes (max / sum-with-cap / dependency-weighted) are v2 design space.
- **Custom user-configurable severity → soak policy** — v1 is policy-table-as-default only. User-config of the policy table (e.g. "in my org, High → 0.25 × default") is a v2 decision; needs its own RFC.
- **Transitive vuln exposure** — v1 operates on direct-dependency vulns only. Transitive exposure is the ADR-0018 surface's territory and would compose with this RFC at a future integration point.

## Tasks

Ordered execution sequence. The `accepted → in-progress` transition fires on the first task commit (T2 or T3) carrying a `Refs: RFC-002` trailer. The `in-progress → verifying` transition fires on the final task commit (post-T7) with `## Verification` section drafted.

- [ ] **T1**: Spec the module's contract via prompt/user-story at `prompts/<N>-exposure-aware-soak.md` — input shape (installed-package list + npm audit current-exposure + min-age); output shape (per-package effective soak ms + which packages were exposure-modified); CLI flag semantics; opt-in default rationale.
- [ ] **T2**: Write failing test for the exposure-modifier function (TDD red). Input fixture: installed package with Critical advisory exposure + a fresh candidate version newer than `min-age`. Expected output: candidate passes the age gate (0-day floor applied).
- [ ] **T3**: Implement the severity → soak-modifier function (likely `src/exposure-soak-modifier.js` or fold into `src/apply-filters.js`). Pure function: takes severity band + base `min-age`; returns effective soak ms. Single-severity input; max-severity composition for the surrounding orchestrator.
- [ ] **T4**: Wire the modifier into the filter pipeline. Add `--exposure-aware-soak` CLI flag in `src/cli-options.js` — default-OFF; parsed boolean. When opt-in, the orchestrator computes per-package effective soak from the audit data; when opt-out, the existing unconditional soak path runs unchanged (zero behaviour change for non-opt-in users).
- [ ] **T5**: Report soak-shortened entries in the output. Extend table / JSON / XML formatters to mark which safe-update rows were age-permitted by the exposure modifier (e.g. a "via-exposure-modifier" tag in JSON; a star + footnote in table). Per ADR-0002 (output format contract).
- [ ] **T6**: Update docs — README + `prompts/<N>-exposure-aware-soak.md` — explaining (a) the opt-in default and rationale; (b) the locked policy table; (c) the composition with existing `--severity` filter (which gates candidate cleanness; this modifier gates current exposure); (d) the v2 graduation triggers from `## Reassessment` below.
- [ ] **T7**: Live-case regression test — exercise a Critical current-exposure scenario. Fixture: installed package with a known-Critical advisory + a candidate fix 2 days old; assert that with `--exposure-aware-soak` set, the candidate passes the age gate (0-day floor applied); assert that WITHOUT the flag (default-OFF), the candidate is blocked (preserves opt-in default contract).
- [ ] **T8**: First task commit (T2 or T3) carries `Refs: RFC-002` trailer and triggers `accepted → in-progress` transition. On the final task commit (post-T7), transition `in-progress → verifying` with `## Verification` section drafted (release marker; user-side confirmation that `--exposure-aware-soak` correctly shortens soak under Critical exposure in their own projects).

## Reassessment

v1 ships with default-OFF. v2 default-flip (opt-in → opt-out) requires its own ADR. Default-flip graduation triggers:

- `--exposure-aware-soak` enabled in CI for ≥ 1 calendar month with no operator-reported regression of trust/safety expectations.
- No locked-policy violations observed (Critical → 0 / High → 0.5 hold across opt-in usage).
- Evidence (in retro logs or operator feedback) that the policy materially reduced operator override frequency (`--min-age=0`-by-hand cases) without surfacing previously-hidden risk.

If any trigger fails or evidence accumulates that the locked policy needs amendment (e.g. operators consistently want a different Critical floor), the v2 ADR records the policy change before the default flips.

## Commits

(maintained automatically — populated by the commit-message RFC trailer hook per ADR-060 Phase 1 item 12)

## Related

- **P014** — driving problem ticket
- **ADR-0003** (CLI exit-code standardization) — exit-code semantics unchanged; modifier affects which updates surface, not the trigger
- **ADR-0018** (unfixable-vuln surface) — adjacent: ADR-0018's confirmation criterion line 117 (existing `--severity` semantics) is the composition boundary
- **ADR-0019** — governance ADR adopting the Problem-RFC-Story framework
- **AFK loop 2026-05-30 Step 2.5 surfacing** — user direction recorded in P014 Fix Strategy section (commit baee7a1)
- **JTBD review at capture + accepted (PASS)** — descriptive references (not load-bearing cites; frontmatter `jtbd: []`): JTBD-001 (See safe updates) extended to surface Critical/High-exposure fixes sooner + JTBD-006 (Trust default policy) preserved by the default-OFF v1 stance. Persona fits: project-maintainer (eliminates the manual `--min-age=0` workaround for Critical exposure); tech-lead (sets org-wide soak policy, served by the severity-band defaults).
- **Unratified dependency on cited ADRs (accepted risk)** — ADR-0018 and ADR-0019 are currently `.proposed.md` and lack `human-oversight: confirmed` frontmatter. RFC-002 explicitly accepts this risk rather than blocking on ratification, mirroring the ADR-0019 precedent (Consequences/Bad item 1 records the compounded-unratified-governance risk on ADR-0011 by the same pattern). Manage-rfc Step 9 review revisits if either ADR is materially amended at canonical confirmation.

(captured via /wr-itil:capture-rfc a472a0a + advanced via /wr-itil:manage-rfc accepted-transition; expand at next /wr-itil:manage-rfc update / in-progress-transition)
