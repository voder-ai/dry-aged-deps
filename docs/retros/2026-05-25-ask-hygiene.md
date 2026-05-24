# Ask Hygiene — 2026-05-25

Per ADR-044 (Decision-Delegation Contract). Lazy count is the regression metric — target 0.

| Call # | Header              | Classification | Citation                                                                                                                                                                                                                                                                                               |
| ------ | ------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1      | Test path           | direction      | Gap: no framework resolves "how to test a new workflow locally when the push:watch gate blocks on pending deps" — genuine multi-path fork (apply-locally / feature-branch-dispatch / file-ticket). (User rejected the framing and pushed directly; the ask was a real fork, not framework-resolvable.) |
| 2      | Persistent-fail PRs | direction      | Gap: ADR-0017 design-time choice for new workflow behaviour (independent dated PRs vs skip-if-same-bump vs close-prior) — no prior ADR/JTBD settled it; user chose skip-if-same-bump.                                                                                                                  |
| 3      | Default mode        | direction      | Gap: new-feature design choice (unfixable surface on-by-default vs opt-in) — JTBD-006 informs but does not dictate; user chose on-by-default.                                                                                                                                                          |
| 4      | Severity floor      | taste          | Gap: authentic preference on a novel artefact (unfixable severity floor: all / moderate+ / high+) — no guide settles it; user chose all-severities.                                                                                                                                                    |

**Lazy count: 0**
**Direction count: 3**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 1**
**Correction-followup count: 0**

Notes: all four asks were genuine design forks for new capabilities (workflow consolidation, unfixable-vuln feature) where the framework did not pre-resolve the decision. No framework-resolvable decision was sub-contracted back to the user. Numerous other decisions this session were taken silently per the act-on-obvious / framework-resolution boundary (commit types, ticket filing, briefing rotation, override fix), correctly not surfaced as asks.
