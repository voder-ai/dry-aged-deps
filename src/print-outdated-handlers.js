// @ts-nocheck - handler for JSON output of printOutdated
// Extracted from src/print-outdated.js to reduce complexity and improve maintainability

import { jsonFormatter } from './json-formatter.js';
import { xmlFormatter } from './xml-formatter.js';

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

/**
 * Handle XML output for printOutdated function.
 * @param {Array<any>} rows - Rows array from buildRows on original data
 * @param {Object} summary - Summary object returned from applyFilters
 * @param {{prod:{minAge:number,minSeverity:string}, dev:{minAge:number,minSeverity:string}}} thresholds
 * @param {Map<string, any>} vulnMap
 * @param {Map<string, string>} filterReasonMap
 * @returns {Object} summary
 */
export function handleXmlOutput(rows, summary, thresholds, vulnMap, filterReasonMap) {
  const timestamp = new Date().toISOString();
  const items = rows.map(([name, current, wanted, latest, age, depType]) => {
    const minAge = depType === 'prod' ? thresholds.prod.minAge : thresholds.dev.minAge;
    const filteredByAge = typeof age !== 'number' || age < minAge;
    const vulnInfo = vulnMap.get(name) || { count: 0, maxSeverity: 'none', details: [] };
    const filteredBySecurity = vulnInfo.count > 0;
    const filtered = filteredByAge || filteredBySecurity;
    const filterReason = filterReasonMap.get(name) || (filteredByAge ? 'age' : '');
    return {
      name,
      current,
      wanted,
      latest,
      age,
      recommended: wanted,
      vulnerabilities: vulnInfo,
      filtered,
      filterReason,
      dependencyType: depType,
    };
  });
  console.log(xmlFormatter({ rows: items, summary, thresholds, timestamp }));
  return summary;
}

/**
 * Handle table output for printOutdated function.
 * @param {Array<Array>} safeRows
 * @param {Array<Array>} matureRows
 * @param {Object} summary
 * @param {number} prodMinAge
 * @param {number} devMinAge
 * @param {boolean} returnSummary
 * @returns {Object|undefined}
 */
export function handleTableOutput(safeRows, matureRows, summary, prodMinAge, devMinAge, returnSummary) {
  console.log('Outdated packages:');
  console.log(['Name', 'Current', 'Wanted', 'Latest', 'Age (days)', 'Type'].join('	'));

  if (matureRows.length === 0) {
    console.log(
      `No outdated packages with mature versions found (prod >= ${prodMinAge} days, dev >= ${devMinAge} days).`
    );
    if (returnSummary) return summary;
    return;
  }
  if (safeRows.length === 0) {
    console.log(
      `No outdated packages with safe, mature versions (>= ${prodMinAge}/${devMinAge} days old, no vulnerabilities) found.`
    );
    if (returnSummary) return summary;
    return;
  }

  for (const row of safeRows) {
    console.log(row.join('	'));
  }
  if (returnSummary) return summary;
  return;
}