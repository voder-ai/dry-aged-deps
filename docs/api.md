# API Reference

This document describes the public API exposed by `dry-aged-deps` for programmatic use.

## fetchVersionTimes(packageName)

Retrieve the publish timestamps of all versions for a given npm package.

### Signature

```js
import { fetchVersionTimes } from 'dry-aged-deps';

/**
 * Fetch version publish times for an npm package.
 * @param {string} packageName - The name of the npm package.
 * @returns {Promise<Record<string, string>>} Promise resolving to a mapping of version to ISO publish date string.
 * @throws {Error} If the package name is invalid or npm view fails.
 */
async function fetchVersionTimes(packageName)
```

### Parameters

- `packageName` (string): The name of the npm package. Must match `/^[a-z0-9@\-\/\_.]+$/i`.

### Returns

A promise that resolves to an object mapping each published version (e.g., "1.2.3") to its publish date as an ISO string.

### Example

```js
import { fetchVersionTimes } from 'dry-aged-deps';

const times = fetchVersionTimes('lodash');
console.log(times['4.17.21']);
// => "2020-04-02T21:31:34.000Z"
```

## calculateAgeInDays(publishDate)

Calculate how many days have passed since a given publish date.

### Signature

```js
import { calculateAgeInDays } from 'dry-aged-deps';

/**
 * Calculate the age in days since the publish date.
 * @param {string} publishDate - ISO date string of the version publish time.
 * @returns {number} Number of full days since the publish date.
 */
function calculateAgeInDays(publishDate)
```

### Parameters

- `publishDate` (string): An ISO 8601 date-time string (e.g., `"2023-01-15T12:00:00.000Z"`).

### Returns

An integer representing the number of full days between the given date and the current system time.

### Example

```js
import { calculateAgeInDays } from 'dry-aged-deps';

const age = calculateAgeInDays('2020-01-01T00:00:00.000Z');
console.log(age);
// => e.g., 900 (depending on current date)
```

## checkVulnerabilities(packageName, version)

Check if a specific package version has known vulnerabilities.

### Signature

```js
import { checkVulnerabilities } from 'dry-aged-deps';

/**
 * Check if a specific package version has known vulnerabilities.
 * @param {string} packageName - The name of the npm package.
 * @param {string} version - The version to check.
 * @returns {Promise<{ count: number; vulnerabilities: { info: number; low: number; moderate: number; high: number; critical: number }; details: Array<object> }>} Promise resolving to an object containing the total number of vulnerabilities, a breakdown by severity, and detailed vulnerability entries.
 * @throws {Error} If the packageName is invalid or audit fails unexpectedly.
 */
async function checkVulnerabilities(packageName, version)
```

### Parameters

- `packageName` (string): The name of the npm package.
- `version` (string): The package version to check (e.g., `"1.2.3"`).

### Returns

A promise that resolves to an object with:

- `count` (number): Total number of vulnerabilities found.
- `vulnerabilities` (object): Mapping of severity levels (`info`, `low`, `moderate`, `high`, `critical`) to the count of vulnerabilities at each level.
- `details` (array): Detailed information for each vulnerability issue.

### Example

```js
import { checkVulnerabilities } from 'dry-aged-deps';

const report = await checkVulnerabilities('lodash', '4.17.21');
console.log(report.count); // => 0
console.log(report.vulnerabilities); // => { info: 0, low: 0, moderate: 0, high: 0, critical: 0 }
```

## printOutdated(data, options)

Print and/or format outdated dependencies with age thresholds and security checks.

### Signature

```js
import { printOutdated } from 'dry-aged-deps';

/**
 * Print outdated dependencies information with age thresholds and security checks.
 * @param {Record<string, { current: string; wanted: string; latest: string }>} data
 * @param {object} [options] - Configuration overrides and output formatting.
 * @param {function} [options.fetchVersionTimes] - Custom fetchVersionTimes function.
 * @param {function} [options.calculateAgeInDays] - Custom calculateAgeInDays function.
 * @param {function} [options.checkVulnerabilities] - Custom checkVulnerabilities function.
 * @param {string} [options.format] - Output format: "table", "json", or "xml".
 * @param {number} [options.prodMinAge] - Minimum age in days for production dependencies.
 * @param {number} [options.devMinAge] - Minimum age in days for dev dependencies.
 * @param {string} [options.prodMinSeverity] - Severity threshold for production dependencies.
 * @param {string} [options.devMinSeverity] - Severity threshold for dev dependencies.
 * @returns {Object|undefined} Returns a summary object in JSON/XML modes; undefined in table mode.
 */
async function printOutdated(data, options)
```

### Parameters

- `data` (object): Mapping of package names to outdated info (`current`, `wanted`, `latest`).
- `options` (object, optional): Configuration overrides and format settings:
  - `fetchVersionTimes` (function): Custom fetchVersionTimes implementation.
  - `calculateAgeInDays` (function): Custom calculateAgeInDays implementation.
  - `checkVulnerabilities` (function): Custom checkVulnerabilities implementation.
  - `format` (string): Output format: "table", "json", or "xml".
  - `prodMinAge` (number): Minimum age in days for production dependencies.
  - `devMinAge` (number): Minimum age in days for dev dependencies.
  - `prodMinSeverity` (string): Severity threshold for production dependencies.
  - `devMinSeverity` (string): Severity threshold for dev dependencies.
  - `updateMode` (boolean): If true, updates dependencies to recommended versions instead of printing.
  - `skipConfirmation` (boolean): If true, skips confirmation prompts during update operations.

### Returns

- In JSON/XML modes, returns a summary object:
  - `totalOutdated` (number)
  - `safeUpdates` (number)
  - `filteredByAge` (number)
  - `filteredBySecurity` (number)
- In table mode, logs to console and returns `undefined`.

### Example

```js
import { printOutdated } from 'dry-aged-deps';

const outdated = {
  lodash: { current: '4.17.20', wanted: '4.17.21', latest: '4.17.21' },
};
await printOutdated(outdated, { format: 'json', prodMinAge: 7 });
```

## jsonFormatter({ rows, summary, thresholds, timestamp })

Format outdated data into a JSON string.

### Signature

```js
import { jsonFormatter } from 'dry-aged-deps';

/**
 * Format outdated dependencies data into a JSON string.
 * @param {object} params
 * @param {Array<Array<any>>} params.rows - Array of rows: [name, current, wanted, latest, age].
 * @param {object} params.summary - Summary of filtering: totalOutdated, safeUpdates, filteredByAge, filteredBySecurity.
 * @param {object} [params.thresholds] - Threshold settings for prod and dev.
 * @param {string} params.timestamp - ISO timestamp of the report.
 * @returns {string} JSON string.
 */
function jsonFormatter({ rows, summary, thresholds, timestamp })
```

### Parameters

- `rows` (Array): List of package entries.
- `summary` (object): Filtering summary.
- `thresholds` (object, optional): Threshold settings.
- `timestamp` (string): ISO-formatted timestamp.

### Returns

A formatted JSON string.

### Example

```js
import { jsonFormatter } from 'dry-aged-deps';

const output = jsonFormatter({
  rows: [['lodash', '4.17.20', '4.17.21', '4.17.21', 365]],
  summary: {
    totalOutdated: 1,
    safeUpdates: 1,
    filteredByAge: 0,
    filteredBySecurity: 0,
  },
  thresholds: {
    prod: { minAge: 7, minSeverity: 'none' },
    dev: { minAge: 7, minSeverity: 'none' },
  },
  timestamp: new Date().toISOString(),
});
console.log(output);
```

## xmlFormatter({ rows, summary, thresholds, timestamp, error })

Format outdated data into an XML string.

### Signature

```js
import { xmlFormatter } from 'dry-aged-deps';

/**
 * Format outdated dependencies data into an XML string.
 * @param {object} params
 * @param {Array<any>} [params.rows] - Outdated package entries as array or object rows.
 * @param {object} params.summary - Summary of filtering results.
 * @param {object} [params.thresholds] - Threshold settings for prod and dev.
 * @param {string} [params.timestamp] - ISO timestamp of the report.
 * @param {Error} [params.error] - Optional error object to include.
 * @returns {string} XML string.
 */
function xmlFormatter({ rows, summary, thresholds, timestamp, error })
```

### Parameters

- `rows` (Array): Entries for packages; can be array or object structures.
- `summary` (object): Filtering summary.
- `thresholds` (object, optional): Threshold settings.
- `timestamp` (string, optional): ISO-formatted timestamp.
- `error` (Error, optional): Error details to include.

### Returns

A formatted XML string.

### Example

```js
import { xmlFormatter } from 'dry-aged-deps';

const xml = xmlFormatter({
  rows: [],
  summary: {
    totalOutdated: 0,
    safeUpdates: 0,
    filteredByAge: 0,
    filteredBySecurity: 0,
  },
  thresholds: {
    prod: { minAge: 7, minSeverity: 'none' },
    dev: { minAge: 7, minSeverity: 'none' },
  },
  timestamp: new Date().toISOString(),
});
console.log(xml);
```

## CLI Configuration File Support

`dry-aged-deps` will automatically load a JSON configuration file from the current working directory. By default, it looks for `.dry-aged-deps.json`, but you can specify a custom path using the `--config-file=<file>` CLI flag.

Supported schema:

```json
{
  "minAge": number,
  "severity": "none" | "low" | "moderate" | "high" | "critical",
  "prod": {
    "minAge": number,
    "minSeverity": "none" | "low" | "moderate" | "high" | "critical"
  },
  "dev": {
    "minAge": number,
    "minSeverity": "none" | "low" | "moderate" | "high" | "critical"
  },
  "format": "table" | "json" | "xml"
}
```

Merge precedence: CLI flags override config file values, which override built-in defaults.

## CI/CD Integration

To enforce dependency freshness policies in your CI/CD pipelines, use the `--check` flag. In check mode, the exit codes are:

### Exit Codes

- `0`: No safe updates available (success).
- `1`: Safe updates available (failure).
- `2`: Execution error (invalid input, unexpected exceptions; applies across table, JSON, and XML formats).

These exit codes are consistent across all output formats (table, JSON, XML).

Example GitHub Actions workflow:

```yaml
# GitHub Actions - Enforce dependency freshness
name: Check Dependencies
on: [pull_request]

jobs:
  check-deps:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Check for outdated dependencies
        run: npx dry-aged-deps --check
        # Fails if safe updates are available

      - name: Show available updates on failure
        if: failure()
        run: npx dry-aged-deps --format=json
```