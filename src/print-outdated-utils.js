// @ts-check
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
 * @supports prompts/008.0-DEV-JSON-OUTPUT.md REQ-CLI-FLAG
 * @param {{ rows: Array<[string, string, string, string, number|string, string]>, summary: FilterSummary, thresholds: Thresholds, vulnMap: Map<string, object>, filterReasonMap: Map<string, string>, excludeMap?: Record<string, string>, unfixable?: Array<{ name: string, severity: string, advisory: string, reason: string, via: Array<string> }> }} options
 * @returns {FilterSummary} Summary object returned from filtering.
 */
export function handleJsonOutput({
  rows,
  summary,
  thresholds,
  vulnMap,
  filterReasonMap,
  excludeMap = {},
  unfixable = [],
}) {
  const timestamp = getTimestamp();
  const items = prepareJsonItems(rows, thresholds, vulnMap, filterReasonMap);
  const excluded = Object.entries(excludeMap).map(([name, reason]) => ({ name, reason }));
  console.log(jsonFormatter({ rows: items, summary, thresholds, timestamp, excluded, unfixable }));
  return summary;
}

/**
 * Output XML formatted results.
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-CLI-FLAG
 * @param {{ rows: Array<[string, string, string, string, number|string, string]>, summary: FilterSummary, thresholds: Thresholds, vulnMap: Map<string, object>, filterReasonMap: Map<string, string>, excludeMap?: Record<string, string>, unfixable?: Array<{ name: string, severity: string, advisory: string, reason: string, via: Array<string> }> }} options
 * @returns {FilterSummary} Summary object returned from filtering.
 */
export function handleXmlOutput({
  rows,
  summary,
  thresholds,
  vulnMap,
  filterReasonMap,
  excludeMap = {},
  unfixable = [],
}) {
  const timestamp = getTimestamp();
  const items = prepareJsonItems(rows, thresholds, vulnMap, filterReasonMap);
  const excluded = Object.entries(excludeMap).map(([name, reason]) => ({ name, reason }));
  console.log(xmlFormatter({ rows: items, summary, thresholds, timestamp, excluded, unfixable }));
  return summary;
}

/**
 * Print the "Known vulnerabilities without safe fix" section, if any.
 * Appears after the outdated table (JTBD-005: existing columns unchanged;
 * the surface is a separate appended section, never a new column).
 * @param {Array<{ name: string, severity: string, advisory: string, reason: string }>} unfixable
 * @returns {void}
 * @supports prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md REQ-UNFIXABLE-TABLE
 */
export function printUnfixableSection(unfixable) {
  if (!unfixable || unfixable.length === 0) return;
  console.log('');
  console.log('Known vulnerabilities without safe fix:');
  console.log(['Name', 'Severity', 'Advisory', 'Reason'].join('\t'));
  for (const { name, severity, advisory, reason } of unfixable) {
    console.log([name, severity, advisory, reason].join('\t'));
  }
}

/**
 * Output table formatted results.
 * @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-OUTPUT-DISPLAY
 * @param {{ safeRows: Array<Array>, matureRows: Array<Array>, summary: FilterSummary, prodMinAge: number, devMinAge: number, returnSummary: boolean, excludeMap?: Record<string, string>, unfixable?: Array<{ name: string, severity: string, advisory: string, reason: string }> }} options
 * @returns {FilterSummary|undefined} Summary when returnSummary is true or undefined otherwise.
 */
export function handleTableOutput({
  safeRows,
  matureRows,
  summary,
  prodMinAge,
  devMinAge,
  returnSummary,
  excludeMap = {},
  unfixable = [],
}) {
  // @supports prompts/015.0-DEV-EXCLUDE-PACKAGES.md REQ-EXCLUDE-OUTPUT
  const excludedCount = Object.keys(excludeMap).length;

  console.log('Outdated packages:');
  console.log(['Name', 'Current', 'Wanted', 'Latest', 'Age (days)', 'Type'].join('	'));

  // @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-OUTPUT-DISPLAY
  if (matureRows.length === 0) {
    console.log(
      `No outdated packages with mature versions found (prod >= ${prodMinAge} days, dev >= ${devMinAge} days).`
    );
    if (excludedCount > 0) {
      console.log(`${excludedCount} package(s) excluded from analysis (see .dry-aged-deps.json)`);
    }
    printUnfixableSection(unfixable);
    // @supports prompts/013.0-DEV-CHECK-MODE.md REQ-CHECK-FLAG
    if (returnSummary) return summary; // returns {FilterSummary} when returnSummary is true
    return undefined; // returns undefined when returnSummary is false
  }

  // @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-OUTPUT-DISPLAY
  if (safeRows.length === 0) {
    console.log(
      `No outdated packages with safe, mature versions (>= ${prodMinAge}/${devMinAge} days old, no vulnerabilities) found.`
    );
    if (excludedCount > 0) {
      console.log(`${excludedCount} package(s) excluded from analysis (see .dry-aged-deps.json)`);
    }
    printUnfixableSection(unfixable);
    // @supports prompts/013.0-DEV-CHECK-MODE.md REQ-CHECK-FLAG
    if (returnSummary) return summary; // returns {FilterSummary} when returnSummary is true
    return undefined; // returns undefined when returnSummary is false
  }

  // @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-OUTPUT-DISPLAY
  for (const row of safeRows) {
    console.log(row.join('\t'));
  }
  if (excludedCount > 0) {
    console.log(`${excludedCount} package(s) excluded from analysis (see .dry-aged-deps.json)`);
  }
  printUnfixableSection(unfixable);
  // @supports prompts/013.0-DEV-CHECK-MODE.md REQ-CHECK-FLAG
  if (returnSummary) return summary; // returns {FilterSummary} when returnSummary is true
  return undefined; // returns undefined when returnSummary is false
}
