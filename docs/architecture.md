# Architecture Overview

This document provides an overview of the core architecture and module layout of the `dry-aged-deps` project.

## Module Layout

```
bin/
  dry-aged-deps.js          # CLI entrypoint
src/
  age-calculator.js         # Calculate age in days since publish time
  apply-filters.js          # Apply security and age filters to rows
  build-rows.js             # Build dependency rows with version times and age
  check-vulnerabilities.js  # Check package vulnerabilities with npm audit
  cli-options-helpers.js    # CLI flag parsing helpers
  cli-options.js            # Parse CLI arguments and config file
  config-loader.js          # Load and validate CLI config file
  fetch-version-times.js    # Fetch npm package version publish times
  filter-by-age.js          # Filter rows by age threshold
  filter-by-security.js     # Filter rows by security threshold
  index.js                  # Programmatic API exports
  json-formatter.js         # JSON output formatter
  load-package-json.js      # Load dependencies from package.json
  output-utils.js           # Utilities for output formatting
  print-outdated-handlers.js# Output handlers for printOutdated (JSON, XML, table)
  print-outdated.js         # Outdated dependencies printer logic
  print-utils.js            # Utilities for threshold and timestamp for output
  security-helpers.js       # Helper functions for security analysis
  security-smart-search.js  # Smart search algorithm for security vulnerabilities
  update-packages.js        # Update dependencies to safe versions
  vulnerability-evaluator.js# Evaluate vulnerability report details
  xml-formatter.js          # XML output formatter
docs/
  api.md                    # Public API documentation
  architecture.md           # This architecture overview
  developer-guidelines.md   # Development guidelines
  branching.md              # Branching strategies
  eslint-flat-config.md     # ESLint config details
  decisions/                # Architectural Decision Records
test/
  *.test.js                 # Unit and integration tests for modules and CLI
  fixtures/                 # Test fixtures (mock projects, configs, etc.)
```

## Components

### CLI (`bin/dry-aged-deps.js`)

- Parses command-line arguments (`--help`, `--version`, `--format`, `--check`, etc.).
- Executes `npm outdated --json` via `child_process.execFileSync`.
- Delegates to `printOutdated` to filter and format output.
- Handles exit codes based on normal and check modes, and error conditions.

### Version Time Fetcher (`src/fetch-version-times.js`)

- Exposes `fetchVersionTimes(packageName)`.
- Validates package name against a regex to prevent injection.
- Calls `npm view <package> time --json` to retrieve publish timestamps.
- Filters out non-version entries (`created`, `modified`).
- Returns a map of version strings to ISO date strings.

### Age Calculator (`src/age-calculator.js`)

- Exposes `calculateAgeInDays(publishDate)`.
- Converts ISO date strings to epoch times and computes difference from current time.
- Returns the integer number of days.

### Vulnerability Checker (`src/check-vulnerabilities.js`)

- Exposes `checkVulnerabilities(packageName, version)`.
- Creates a temporary `package.json` and runs `npm audit --json`.
- Parses audit output and counts vulnerabilities of all severities.
- Cleans up temporary files after check.

### Output Formatters

- **JSON**: `src/json-formatter.js` formats data into a JSON string.
- **XML**: `src/xml-formatter.js` formats data into an XML string with escape handling.

### Print Logic (`src/print-outdated.js`)

- Exposes `printOutdated(data, options)` for table, JSON, or XML output.
- Fetches version times and ages, filters by threshold and security.
- Formats output according to `--format` and handles filtering statistics.

### Programmatic API (`src/index.js`)

- Aggregates and re-exports all public functions for library use:
  `fetchVersionTimes`, `calculateAgeInDays`, `checkVulnerabilities`, `jsonFormatter`, `xmlFormatter`, `printOutdated`.

## Design Decisions

- **ES Modules**: Unified on ESM for consistency and modern tooling support (see [0001-use-es-modules.md](decisions/0001-use-es-modules.md)).
- **Synchronous CLI**: Uses sync child processes for predictable CLI behavior.
- **Modular**: Small, focused modules for easy testing and maintenance.
- **Check Mode**: Adds CI enforcement mode without changing default behavior.

## CI/CD Pipeline

The CI & Publish workflow defined in `.github/workflows/ci-publish.yml` includes a vulnerability scan step that runs `npm audit --audit-level=moderate` across all dependencies (production and development) without the `--production` flag. This ensures that no known vulnerabilities in any dependencies are missed.

## Future Considerations

- **Async Refactor**: Migrate to async child processes for performance.
- **Parallel Fetch**: Fetch version times concurrently.
- **Caching**: Implement caching of version data.
- **TypeScript**: Add static typing for improved developer experience.
