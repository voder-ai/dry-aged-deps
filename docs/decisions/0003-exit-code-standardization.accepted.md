---
status: "accepted"
date: 2025-11-10
decision-makers: ["Tom Howard"]
consulted: []
informed: []
reassessment-date: 2027-05-10
---

# 0003. Standardize CLI Exit Codes

## Context and Problem Statement

The `dry-aged-deps` CLI historically used exit codes inconsistently across commands and error conditions. For reliable automation and CI/CD integration, we need a clear, documented exit code strategy. Tools and pipelines rely on exit codes to determine success, failure, or error states.

Prior behaviour:

- Exit code `0`: general success or help/version output.
- Exit code `1`: used for both informational cases (updates available) and parsing failures.
- Exit code `>1`: miscellaneous errors.

This ambiguity complicated CI flows:

- A non-zero exit might be treated as failure even when just indicating available updates.
- Pipelined steps could not distinguish between report-only failures and actual errors.

## Decision Drivers

- **Clarity**: distinct codes must separate informational state from errors.
- **Automation**: CI/CD pipelines must be able to accurately detect "updates exist" versus "an error occurred".
- **Consistency**: align with Unix conventions (0 = success, non-zero = failure).
- **Forward-compatibility**: leave room to add more modes (for example `--strict`) without renegotiating the contract.

## Considered Options

1. **Three-code scheme**: `0` = success/no updates, `1` = safe updates available (informational by default, CI failure in check mode), `2` = error.
2. **Two-code scheme**: `0` = success regardless of updates, `1` = error. Loses the "updates available" signal.
3. **Mode-specific codes**: every CLI mode uses its own code mapping. More expressive but harder to remember and brittle.

## Decision Outcome

Chosen option: **three-code scheme**, because it gives automation a single deterministic contract that survives the introduction of new modes and aligns with the principle that exit code `2` is reserved for tool errors (mirroring `getopt` and similar conventions).

| Code | Meaning |
| ---- | ------- |
| 0 | Success: no safe updates available, or command completed successfully |
| 1 | Updates available: safe updates exist (informational in default mode, CI failure in check mode) |
| 2 | Error: invalid input, parsing failure, execution error, or unexpected exception |

### Implementation

- Default (informational) mode exits with code `1` when safe updates exist; pipelines may treat this as a warning.
- `--check` mode interprets code `1` as CI failure for enforceable policy.
- Any invalid flags or unexpected errors exit with code `2`.

## Consequences

### Good

- Simplifies pipeline scripts and conditionals.
- Enables clearer documentation and user expectations.
- Facilitates adding more modes (for example `--strict`) in future without renegotiating the contract.

### Neutral

- The same exit-code contract applies across `--format=table`, `--format=json`, and `--format=xml`.

### Bad

- Users may need to update existing scripts that misinterpret exit `1` as an error.

## Confirmation

This decision is implemented when:

1. The CLI argument parsing in `bin/dry-aged-deps.js` maps all error and exit paths to the three documented codes.
2. README and API documentation describe the exit-code contract.
3. ADR-0004 references this ADR to define how exit codes apply under `--check`.
4. Tests assert exit codes for the success, updates-available, and error paths.

## Pros and Cons of the Options

### Option 1 — Three-code scheme (chosen)

- Good: deterministic, easy to consume, room to grow.
- Good: aligns with Unix conventions for tool errors (code 2).
- Bad: one-time migration for scripts that relied on prior behaviour.

### Option 2 — Two-code scheme

- Good: minimal.
- Bad: loses the "updates available" signal entirely, forcing string parsing.
- Rejection reason: defeats the integration use case.

### Option 3 — Mode-specific codes

- Good: maximal expressivity.
- Bad: hard to remember; brittle as modes evolve.
- Rejection reason: more cost than value.

## Reassessment Criteria

Reassess this decision when:

- A new mode requires a fundamentally different exit-code semantic that the three-code scheme cannot accommodate.
- A widely adopted convention for CLI exit codes changes and the project should follow.

## References

- ADR-0004: Add Check Mode for CI/CD Enforcement.
- `bin/dry-aged-deps.js` — CLI implementation.
