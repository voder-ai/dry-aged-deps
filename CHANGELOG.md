# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- `--check` flag for CI/CD enforcement with standardized exit codes (coming soon)
- Configuration-file support (`.dry-aged-deps.json`) (coming soon)

## [0.1.2] - 2025-11-11

### Added

- Support for JSON output format (`--format=json`) and XML output format (`--format=xml`).

### Changed

- Standardized exit codes: 0 for no safe updates, 1 for safe updates, 2 for errors (ADR 0003, ADR 0004).

## [0.1.1] - 2024-06-08

### Fixed

- Bugfixes and minor improvements

## [0.1.0] - 2024-06-05

### Added

- CLI tool executable `dry-aged-deps` to list outdated npm dependencies with version age.
- `fetchVersionTimes` function to retrieve publish times of package versions via `npm view <package> time --json`.
- `calculateAgeInDays` function to compute the number of days since a given publish date.
- Tabulated output with columns: Name, Current, Wanted, Latest, Age (days).
