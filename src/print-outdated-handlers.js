// @ts-nocheck - handler for JSON output of printOutdated
// Extracted from src/print-outdated.js to reduce complexity and improve maintainability

import { jsonFormatter } from './json-formatter.js';

/**
 * Handle JSON output for printOutdated function.
 * @param {Record<string, { current: string; wanted: string; latest: string }>} data - Outdated dependency info
 * @param {object} thresholdsOpts
 * @param {number} thresholdsOpts.prodMinAge
 * @param {number} thresholdsOpts.devMinAge
 * @param {string} thresholdsOpts.prodMinSeverity
 * @param {string} thresholdsOpts.devMinSeverity
 * @returns {{ totalOutdated: number, safeUpdates: number, filteredByAge: number, filteredBySecurity: number }} summary
 */
export function handleJsonOutput(data, thresholdsOpts) {
  const { prodMinAge, devMinAge, prodMinSeverity, devMinSeverity } =
    thresholdsOpts;
  const entries = Object.entries(data);
  // Build rows for JSON output, age set to null
  const rows = entries.map(([name, info]) => [
    name,
    info.current,
    info.wanted,
    info.latest,
    null,
  ]);
  const totalOutdated = rows.length;
  const summary = {
    totalOutdated,
    safeUpdates: totalOutdated,
    filteredByAge: 0,
    filteredBySecurity: 0,
  };
  const thresholds = {
    prod: { minAge: prodMinAge, minSeverity: prodMinSeverity },
    dev: { minAge: devMinAge, minSeverity: devMinSeverity },
  };
  const timestamp = new Date().toISOString();
  console.log(jsonFormatter({ rows, summary, thresholds, timestamp }));
  return summary;
}
