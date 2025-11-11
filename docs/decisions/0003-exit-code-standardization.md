# 0003. Standardize CLI Exit Codes

Date: 2025-11-10

## Status

Accepted

## Context

The `dry-aged-deps` CLI historically used exit codes inconsistently across commands and error conditions. For reliable automation and CI/CD integration, we need a clear, documented exit code strategy. Tools and pipelines rely on exit codes to determine success, failure, or error states.

Current behavior:
- Exit code `0`: general success or help/version output
- Exit code `1`: used for both informational cases (updates available) and parsing failures
- Exit code `>1`: misc errors

This ambiguity complicates CI flows:
- A non-zero exit might be treated as failure even when just indicating available updates.
- Pipelined steps cannot distinguish between report-only failures and actual errors.

## Decision

We will standardize exit codes as follows:

| Code | Meaning                                                                         |
| ---- | ------------------------------------------------------------------------------- |
| 0    | Success: no safe updates available, or command completed successfully            |
| 1    | Updates available: safe updates exist (informational in default mode, CI failure in check mode) |
| 2    | Error: invalid input, parsing failure, execution error, or unexpected exception |

Implementations:
- Default (informational) mode exits with code `1` when safe updates exist; pipelines may treat this as a warning.
- `--check` mode interprets code `1` as CI failure for enforceable policy.
- Any invalid flags or unexpected errors exit with code `2`.

## Rationale

- **Clarity**: Distinct codes separate informational state from errors.
- **Automation**: CI/CD pipelines can accurately detect if updates exist vs. an error occurred.
- **Consistency**: Aligns with Unix conventions (0=success, non-zero=failure).

## Consequences

### Positive

- Simplifies pipeline scripts and conditionals.
- Enables clearer documentation and user expectations.
- Facilitates adding more modes (e.g., `--strict`) in future.

### Negative

- Users may need to update existing scripts that misinterpret exit `1` as error.

## Implementation Notes

- Update CLI argument parsing in `bin/dry-aged-deps.js` to map all error/exit paths to the new codes.
- Update documentation (README, API docs) to reflect exit codes.
- Add ADR for check-mode to show how exit codes apply when `--check` is used.
