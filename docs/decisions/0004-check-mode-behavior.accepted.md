---
status: 'accepted'
date: 2025-11-10
decision-makers: ['Tom Howard']
consulted: []
informed: []
reassessment-date: 2027-05-10
---

# 0004. Add Check Mode for CI/CD Enforcement

## Context and Problem Statement

To enable strict dependency-freshness policies in CI/CD pipelines, we need a mode where the CLI not only reports safe updates but also fails the build when safe updates are available. Teams want to enforce that no safe updates accumulate without action.

Without a dedicated check mode, pipelines must parse textual output or rely on ambiguous exit codes to detect available updates, leading to brittle scripts.

## Decision Drivers

- **CI/CD enforcement**: make it easy to enforce dependency-freshness policies without custom parsing.
- **Clarity**: leverage standardised exit codes (ADR-0003) for clear success/failure semantics.
- **Opt-in**: default behaviour remains informational; enforcement must be explicit.
- **Consistency**: align with exit-code standardisation in ADR-0003.

## Considered Options

1. **`--check` flag with explicit enforcement semantics**, leaving default mode informational.
2. **Implicit enforcement** — always treat exit `1` as CI failure, requiring callers to opt out.
3. **No check mode** — require pipelines to parse output to detect updates.

## Decision Outcome

Chosen option: **`--check` flag**, because opt-in enforcement preserves the default informational behaviour, makes the intent explicit at the call site, and composes cleanly with the exit-code contract in ADR-0003.

### Behaviour in check mode

- Exit code `1` if safe updates are available.
- Exit code `0` if no safe updates are available.
- Exit code `2` on any error (invalid input, execution failures, unexpected exceptions).

The default (informational) mode retains existing behaviour (exit `1` on updates, `0` if none, `2` on errors), but pipelines can opt into enforcement semantics by using `--check` to treat exit `1` as failure.

### Rationale

- **CI/CD enforcement**: makes it easy to enforce dependency-freshness policies without custom parsing.
- **Clarity**: leverages standardised exit codes for clear success/failure semantics.
- **Opt-in**: default behaviour remains informational; enforcement is explicit.
- **Consistency**: aligns with exit-code standardisation (ADR-0003).

## Consequences

### Good

- Simplifies pipeline scripts: `npx dry-aged-deps --check` directly controls build success.
- Clear separation between informational reporting and enforcement.
- Encourages teams to stay up to date with safe, vetted dependency versions.

### Neutral

- Adds one CLI flag to document and maintain.
- The same exit-code semantics apply across `--format=table`, `--format=json`, and `--format=xml`.

### Bad

- Teams relying on exit `1` in default mode for informational purposes might need to adjust scripts.

## Confirmation

This decision is implemented when:

1. `bin/dry-aged-deps.js` parses a `--check` flag.
2. After `printOutdated` completes, the check-mode branch inspects the returned summary (in JSON/XML modes) or infers safe updates from console output.
3. In check mode, the process exits `1` when `summary.safeUpdates > 0`, otherwise `0`.
4. Help text and documentation (`README.md`, `docs/api.md`) describe `--check` usage and exit-code semantics.
5. Unit and integration tests verify exit codes and output in both check and default modes.

## Pros and Cons of the Options

### Option 1 — `--check` flag (chosen)

- Good: explicit, opt-in, composes with ADR-0003.
- Good: backwards compatible with existing informational usage.
- Bad: adds a flag and a documentation surface.

### Option 2 — Implicit enforcement

- Good: zero flags.
- Bad: surprising for ad-hoc CLI users.
- Rejection reason: violates the principle that enforcement should be explicit.

### Option 3 — No check mode

- Good: smallest surface area.
- Bad: forces every pipeline to parse output.
- Rejection reason: defeats the integration use case.

## Reassessment Criteria

Reassess this decision when:

- A new mode (for example `--strict`) requires a semantic that `--check` cannot model.
- Pipeline integration patterns evolve in a way that makes `--check` redundant.

## References

- User Story: `prompts/013.0-DEV-CHECK-MODE.md`
- ADR-0003: CLI Exit Code Standardization
- `bin/dry-aged-deps.js` — CLI implementation
