# 0002. Support JSON and XML Output Formats

Date: 2025-11-10

## Status

Accepted

## Context

The `dry-aged-deps` CLI currently supports only a default table output format, which is human-readable but not easily consumable by automation systems or other tools. As part of expanding integration with CI/CD pipelines and programmatic usage, there is a need to provide machine-readable output formats.

Key integration scenarios include:

- CI jobs that need to parse available updates and take conditional actions.
- Automated tooling that consumes update information for dashboards or reporting.
- Programmatic libraries using `dry-aged-deps` output directly.

## Decision

We will introduce two additional output formats—JSON and XML—alongside the existing table format. The CLI will accept a `--format` flag with values `table`, `json`, or `xml`. The machine-readable formats will adhere to a stable schema documented in the public API reference.

## Rationale

- **Machine Readability**: JSON and XML are widely supported and facilitate automation.
- **Integration**: CI/CD pipelines and other automation tools can easily consume and process the data.
- **Consistency**: A clear schema reduces parsing errors and mismatches.
- **Flexibility**: Allows downstream tools to transform or validate output without screen-scraping.

## Consequences

### Positive

- Enables robust CI/CD integration and tooling.
- Improves programmatic library usage.
- Future-proofing: easy to add new formats (e.g., CSV) if needed.

### Negative

- Additional implementation and maintenance overhead for formatters.
- Slight increase in bundle size due to additional modules.

## Implementation

1. Create `src/json-formatter.js` and `src/xml-formatter.js` to encapsulate formatting logic.
2. Update `printOutdated` to delegate JSON and XML output to the respective formatter modules when `--format` is specified.
3. Document schema and usage in `docs/api.md` and `README.md` under "Output Formats" and "Options".
4. Add unit tests and integration tests for JSON and XML outputs.

## Alternatives Considered

- **CSV Output**: Simpler than XML, but lacks hierarchical structure for nested data.
- **Only JSON**: JSON is dominant for automation, but some environments (e.g., legacy systems) prefer XML.
- **Custom DSL**: Not appropriate; reinventing formats is not justified for a CLI tool.

## References

- API Reference: `docs/api.md`
- CLI Help: `bin/dry-aged-deps.js`
