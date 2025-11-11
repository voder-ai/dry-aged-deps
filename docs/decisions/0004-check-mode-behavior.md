# 0004. Add Check Mode for CI/CD Enforcement

Date: 2025-11-10

## Status

Accepted

## Context

To enable strict dependency freshness policies in CI/CD pipelines, we need a mode where the CLI not only reports safe updates but also fails the build when safe updates are available. Teams want to enforce that no safe updates accumulate without action.

Without a dedicated check mode, pipelines must parse textual output or rely on ambiguous exit codes to detect available updates, leading to brittle scripts.

## Decision

Introduce a `--check` flag to the CLI. In check mode:

- Exit code `1` if safe updates are available
- Exit code `0` if no safe updates are available
- Exit code `2` on any error (invalid input, execution failures, unexpected exceptions)

The default (informational) mode retains existing behavior (exit `1` on updates, `0` if none, `2` on errors) but pipelines can opt into enforcement semantics by using `--check` to treat exit `1` as failure.

## Rationale

- **CI/CD Enforcement**: Makes it easy to enforce dependency freshness policies without custom parsing.
- **Clarity**: Leverages standardized exit codes for clear success/failure semantics.
- **Opt-In**: Default behavior remains informational; enforcement is explicit.
- **Consistency**: Aligns with exit code standardization (ADR 0003).

## Consequences

### Positive

- Simplifies pipeline scripts: `npx dry-aged-deps --check` directly controls build success.
- Clear separation between informational reporting and enforcement.
- Encourages teams to stay up-to-date with safe, vetted dependency versions.

### Negative

- Teams relying on exit `1` in default mode for informational purposes might need to adjust scripts.
- Adds another CLI flag to document and maintain.

## Implementation Notes

1. Parse `--check` flag in `bin/dry-aged-deps.js`.
2. After `printOutdated` completes, inspect the returned summary (in JSON/XML modes) or infer safe updates from console output.
3. In check mode, exit `1` when `summary.safeUpdates > 0`, otherwise exit `0`.
4. Update help text and documentation (`README.md`, `docs/api.md`) with `--check` usage and exit code semantics.
5. Add unit and integration tests to verify exit codes and output in both check and default modes.

## References

- User Story: `013.0-DEV-CHECK-MODE`
- ADR 0003: CLI Exit Code Standardization
- `bin/dry-aged-deps.js` CLI implementation
