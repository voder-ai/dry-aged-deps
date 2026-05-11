---
status: 'accepted'
date: 2025-11-10
decision-makers: ['Tom Howard']
consulted: []
informed: []
reassessment-date: 2027-05-10
---

# 0002. Support JSON and XML Output Formats

## Context and Problem Statement

The `dry-aged-deps` CLI previously supported only a default table output format, which is human-readable but not easily consumable by automation systems or other tools. As part of expanding integration with CI/CD pipelines and programmatic usage, there is a need to provide machine-readable output formats.

Key integration scenarios include:

- CI jobs that need to parse available updates and take conditional actions.
- Automated tooling that consumes update information for dashboards or reporting.
- Programmatic libraries using `dry-aged-deps` output directly.

## Decision Drivers

- **Machine readability**: automation cannot reliably screen-scrape a human-formatted table.
- **Integration**: CI/CD pipelines and other automation tools must be able to consume and process the data.
- **Schema consistency**: a clear, stable schema reduces parsing errors and version-drift mismatches.
- **Flexibility**: downstream tools should be able to transform or validate output without screen-scraping.

## Considered Options

1. **JSON and XML output formats alongside the existing table format**, selected via a `--format` flag with values `table`, `json`, `xml`.
2. **CSV output only** — simpler than XML but lacks hierarchical structure for nested data.
3. **JSON only** — JSON is dominant for automation, but some environments (legacy systems, enterprise integrations) prefer XML.
4. **A custom DSL** — purpose-built textual format.

## Decision Outcome

Chosen option: **JSON and XML output formats alongside the existing table format**, because the CLI must serve both modern automation (JSON) and environments where XML is still the consumed format, while preserving the existing human-readable default.

The CLI will accept a `--format` flag with values `table`, `json`, or `xml`. The machine-readable formats will adhere to a stable schema documented in the public API reference.

### Rationale

- **Machine readability**: JSON and XML are widely supported and facilitate automation.
- **Integration**: CI/CD pipelines and other automation tools can easily consume and process the data.
- **Consistency**: a clear schema reduces parsing errors and mismatches.
- **Flexibility**: allows downstream tools to transform or validate output without screen-scraping.

## Consequences

### Good

- Enables robust CI/CD integration and tooling.
- Improves programmatic library usage.
- Future-proofing: easy to add new formats (for example CSV) if needed.

### Neutral

- Requires documenting the schema and keeping the documentation in sync with the implementation.

### Bad

- Additional implementation and maintenance overhead for formatters.
- Slight increase in bundle size due to additional modules.

## Confirmation

This decision is implemented when:

1. `src/json-formatter.js` and `src/xml-formatter.js` exist and encapsulate formatting logic for their respective formats.
2. `printOutdated` delegates JSON and XML output to the respective formatter modules when `--format=json` or `--format=xml` is specified.
3. The schema is documented in `docs/api.md` and `README.md` under "Output Formats" and "Options".
4. Unit tests and integration tests exist for JSON and XML outputs and assert against the documented schema.

## Pros and Cons of the Options

### Option 1 — JSON + XML + table (chosen)

- Good: serves automation (JSON), legacy integrations (XML), and human reading (table) without forcing any consumer to handle a format they did not ask for.
- Good: extensible — new formats can be added behind the same `--format` flag.
- Bad: two formatter modules to maintain.

### Option 2 — CSV output

- Good: simpler than XML.
- Bad: lacks hierarchical structure required for nested data such as vulnerability details.
- Rejection reason: insufficient expressivity for the domain.

### Option 3 — JSON only

- Good: smallest implementation surface; JSON is the lingua franca of CI tooling.
- Bad: some environments still prefer or require XML.
- Rejection reason: under-serves a real audience for a small additional cost.

### Option 4 — Custom DSL

- Bad: reinventing formats is not justified for a CLI tool.
- Rejection reason: not appropriate.

## Reassessment Criteria

Reassess this decision when:

- A new dominant interchange format emerges that meaningfully displaces JSON or XML.
- The XML format goes unused for an extended period and could be removed.
- Schema changes are required that would break existing consumers (requires a major-version coordinate).

## References

- API Reference: `docs/api.md`
- CLI Help: `bin/dry-aged-deps.js`
