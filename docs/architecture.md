# Architecture Overview

This document provides an overview of the core architecture and module layout of the `dry-aged-deps` project.

## Module Layout

```
bin/
  dry-aged-deps.js       # CLI entrypoint
src/
  fetch-version-times.js # Fetch npm package version publish times
  age-calculator.js      # Calculate age in days since publish time
docs/
  api.md                 # API reference for public functions
  architecture.md        # This architecture overview
  stories/               # User stories and planning documents
test/
  fetch-version-times.test.js
  age-calculator.test.js
  cli.test.js
  helpers/cli-helper.js
```

## Components

### CLI (`bin/dry-aged-deps.js`)

- Parses command-line arguments (`--help` flag).
- Executes `npm outdated --json` via `child_process.execFileSync`.
- Delegates to `printOutdated` to format output.
- Handles both zero-exit (`npm outdated` returns code 0) and non-zero exit codes (packages outdated).
- Gracefully handles JSON parsing errors and missing outdated data.

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

## Design Decisions

- **Incremental CLI Design:** The CLI wraps existing npm commands (`outdated`, `view`) rather than re-implementing registry API calls, reducing maintenance.
- **Synchronous Execution:** Uses synchronous child processes for simplicity and predictable output in a CLI context.
- **Modularity:** Core logic is split into discrete, testable modules (`fetchVersionTimes`, `calculateAgeInDays`).
- **Resilience:** Each version time fetch is wrapped in `try/catch` to prevent a single failure from aborting the entire output.
- **Testing:** Modules have unit tests via Vitest. CLI has integration-like tests mocking subprocesses.

## Future Considerations

- **Asynchronous Refactor:** Migrate to async child processes and promise-based flows for improved performance and non-blocking behavior.
- **Parallel Fetching:** Fetch version times concurrently for multiple packages to reduce overall runtime.
- **Caching:** Introduce a cache to avoid repeated registry calls for the same package/version within a session.
- **Customizable Output:** Support JSON or CSV output formats and adjustable date formats.
- **TypeScript Migration:** Add static typing for improved developer experience and reduced runtime errors.
