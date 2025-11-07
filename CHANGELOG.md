# Changelog

All notable changes to this project will be documented in this file.

## [0.1.1] - 2024-06-08

### Fixed

- Bugfixes and minor improvements

## [0.1.0] - 2024-06-05

### Added

- CLI tool executable `dry-aged-deps` to list outdated npm dependencies with version age.
- `fetchVersionTimes` function to retrieve publish times of package versions via `npm view <package> time --json`.
- `calculateAgeInDays` function to compute the number of days since a given publish date.
- Tabulated output with columns: Name, Current, Wanted, Latest, Age (days).
