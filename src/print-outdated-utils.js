// @ts-nocheck
import { jsonFormatter } from './json-formatter.js';
import { xmlFormatter } from './xml-formatter.js';
import { prepareJsonItems } from './output-utils.js';
import { getTimestamp } from './print-utils.js';

/**
 * @typedef {Object} FilterSummary
 * @property {number} totalOutdated - Total number of outdated dependencies detected.
 * @property {number} safeUpdates - Number of safe updates available.
 * @property {number} filteredByAge - Number of dependencies filtered out by age threshold.
 * @property {number} filteredBySecurity - Number of dependencies filtered out by security threshold.
 */

/**
 * @typedef {Object} Thresholds
 * @property {{ minAge: number; minSeverity: string }} prod - Production dependency thresholds.
 * @property {{ minAge: number; minSeverity: string }} dev - Development dependency thresholds.
 */

/**
 * Output JSON formatted results.
 * @story prompts/008.0-DEV-JSON-OUTPUT.md
 * @req REQ-HANDLER-JSON - Delegate JSON output handling
 * @param {{ rows: Array<[string, string, string, string, number|string, string]>, summary: FilterSummary, thresholds: Thresholds, vulnMap: Map<string, object>, filterReasonMap: Map<string, string> }} options
 * @returns {FilterSummary} Summary object returned from filtering.
 */
export function handleJsonOutput({ rows, summary, thresholds, vulnMap, filterReasonMap }) {
  const timestamp = getTimestamp();
  const items = prepareJsonItems(rows, thresholds, vulnMap, filterReasonMap);
  console.log(jsonFormatter({ rows: items, summary, thresholds, timestamp }));
  return summary;
}

/**
 * Output XML formatted results.
 * @story prompts/009.0-DEV-XML-OUTPUT.md
 * @req REQ-HANDLER-XML - Delegate XML output handling
 * @param {{ rows: Array<[string, string, string, string, number|string, string]>, summary: FilterSummary, thresholds: Thresholds, vulnMap: Map<string, object>, filterReasonMap: Map<string, string> }} options
 * @returns {FilterSummary} Summary object returned from filtering.
 */
export function handleXmlOutput({ rows, summary, thresholds, vulnMap, filterReasonMap }) {
  const timestamp = getTimestamp();
  const items = rows.map(([name, current, wanted, latest, age, depType]) => {
    const minAge = depType === 'prod' ? thresholds.prod.minAge : thresholds.dev.minAge;
    const filteredByAge = typeof age === 'number' && age < minAge;
    const vulnInfo = vulnMap.get(name) || { count: 0, maxSeverity: 'none', details: [] };
    const filteredBySecurity = vulnInfo.count > 0;
    const filtered = filteredByAge || filteredBySecurity;
    const filterReason = filterReasonMap.get(name) || (filteredByAge ? 'age' : '');
    return {
      name,
      current,
      wanted,
      latest,
      recommended: wanted,
      age: typeof age === 'number' ? age : null,
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
 * Output table formatted results.
 * @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
 * @req REQ-HANDLER-TABLE - Delegate table output handling
 * @param {{ safeRows: Array<Array>, matureRows: Array<Array>, summary: FilterSummary, prodMinAge: number, devMinAge: number, returnSummary: boolean }} options
 * @returns {FilterSummary|undefined} Summary when returnSummary is true or undefined otherwise.
 */
export function handleTableOutput({ safeRows, matureRows, summary, prodMinAge, devMinAge, returnSummary }) {
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
