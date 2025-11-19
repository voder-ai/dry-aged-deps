// @ts-check
/**
 * @file Main entry point for dry-aged-deps programmatic API.
 * @module dry-aged-deps
 */
// src/index.js
// Main entry point for programmatic usage of dry-aged-deps

export { fetchVersionTimes } from './fetch-version-times.js';
export { calculateAgeInDays } from './age-calculator.js';
export { checkVulnerabilities } from './check-vulnerabilities.js';
export { jsonFormatter } from './json-formatter.js';
export { xmlFormatter } from './xml-formatter.js';
export { printOutdated } from './print-outdated.js';
