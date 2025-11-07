# API Reference

This document describes the public API exposed by dry-aged-deps for programmatic use.

## fetchVersionTimes(packageName)

Retrieve the publish timestamps of all versions for a given npm package.

### Signature

```js
const { fetchVersionTimes } = require('dry-aged-deps');

/**
 * Fetch version publish times for an npm package.
 * @param {string} packageName - The name of the npm package.
 * @returns {Record<string, string>} Mapping of version to ISO publish date string.
 * @throws {Error} If the package name is invalid or npm view fails.
 */
function fetchVersionTimes(packageName)
```

### Parameters

- `packageName` (string): The name of the npm package. Must match `/^[a-z0-9@\-\/_\.]+$/i`.

### Returns

An object mapping each published version (e.g., `"1.2.3"`) to its publish date as an ISO string.

### Example

```js
const times = fetchVersionTimes('lodash');
console.log(times['4.17.21']);
// => "2020-04-02T21:31:34.000Z"
```

## calculateAgeInDays(publishDate)

Calculate how many days have passed since a given publish date.

### Signature

```js
const { calculateAgeInDays } = require('dry-aged-deps');

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
const age = calculateAgeInDays('2020-01-01T00:00:00.000Z');
console.log(age);
// => e.g., 900 (depending on current date)
```
