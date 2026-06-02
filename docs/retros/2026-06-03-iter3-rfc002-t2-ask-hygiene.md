# Ask Hygiene — 2026-06-03 iter 3 (RFC-002 T2)

AFK `/wr-itil:work-problems` iter 3 on `dry-aged-deps`. Scope: RFC-002 T2 — write failing test for severity → soak-modifier; flip RFC-002 `accepted → in-progress` via T8 trigger; commit `789a18b`.

| Call # | Header | Classification | Citation |
| ------ | ------ | -------------- | -------- |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

## Notes

Zero `AskUserQuestion` invocations this iter. AFK constraint per P135 / ADR-044 (`NEVER call AskUserQuestion mid-iter in AFK`) was respected throughout. The gate-review path (architect, jtbd, voice-tone, risk-scorer wip + pipeline + external-comms) all delegated to subagents that returned verdicts without surfacing user-decision prompts back through the main turn.

Decision points in this iter were framework-resolved:

- Test file placement → ADR-0020 (universal co-location of paired tests).
- Test contract (`severityToModifier`, `effectiveSoakMs`) → `prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md` Requirements section (REQ-EXPOSURE-POLICY-TABLE, REQ-EXPOSURE-EFFECTIVE-SOAK, REQ-EXPOSURE-PURE-FUNCTION).
- Commit type (`test:`) and trailer (`Refs: RFC-002`) → CLAUDE.md §Commit Messages + RFC-002 T8.
- Single-commit grain (test + RFC rename in one commit) → ADR-014 (upstream framework).
- RFC status edit (`accepted → in-progress` in both YAML frontmatter and body) → RFC-002 §Tasks T8 transition trigger.
- Pre-commit risk gating sequence (external-comms risk → external-comms voice-tone → pipeline risk → commit) → repo-local hook contracts, observable in the gate-decline error messages.

Every decision had a framework artefact resolving it. No user-judgment-bound questions were surfaced.
