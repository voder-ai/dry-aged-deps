// @ts-nocheck - handler for JSON output of printOutdated
// Extracted from src/print-outdated.js to reduce complexity and improve maintainability

import { jsonFormatter } from './json-formatter.js';
import { xmlFormatter } from './xml-formatter.js';
import { prepareJsonItems } from './output-utils.js';
import { getTimestamp } from './print-utils.js';

/**
 * Handle JSON output for printOutdated function.
 * @param {Array<[string, string, string, string, number|string, string]>} rows - Array of [name, current, wanted, latest, age, depType].
 * @param {Object} summary - Summary object returned from applyFilters
 * @param {{ prod: { minAge: number, minSeverity: string }, dev: { minAge: number, minSeverity: string } }} thresholds
 * @param {Map<string, {count: number, maxSeverity: string, details: Array<any>}>} vulnMap
 * @param {Map<string, string>} filterReasonMap
 * @returns {Object} summary
 */
export function handleJsonOutput(rows, summary, thresholds, vulnMap, filterReasonMap) {
  const timestamp = getTimestamp();
  const items = prepareJsonItems(rows, thresholds, vulnMap, filterReasonMap);
  console.log(jsonFormatter({ rows: items, summary, thresholds, timestamp }));
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
  const timestamp = getTimestamp();
  const items = rows.map(([name, current, wanted, latest, age, depType]) => {
    const minAge = depType === 'prod' ? thresholds.prod.minAge : thresholds.dev.minAge;
    const filteredByAge = typeof age !== 'number' || age < minAge;
    const vulnInfo = vulnMap.get(name) || {
      count: 0,
      maxSeverity: 'none',
      details: [],
    };
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
