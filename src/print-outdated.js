/* eslint-disable traceability/valid-req-reference , traceability/valid-annotation-format , traceability/valid-annotation-format */
// @ts-check

import { fetchVersionTimes as defaultFetchVersionTimes } from './fetch-version-times.js';
import { calculateAgeInDays as defaultCalculateAgeInDays } from './age-calculator.js';
import { checkVulnerabilities as defaultCheckVulnerabilities } from './check-vulnerabilities.js';
import { loadPackageJson } from './load-package-json.js';
import { buildRows } from './build-rows.js';
import { applyFilters } from './apply-filters.js';
import { handleJsonOutput, handleXmlOutput, handleTableOutput } from './print-outdated-handlers.js';
import { updatePackages } from './update-packages.js';
import { getThresholds } from './print-utils.js';

/**
 * Handle scenario when there are no outdated dependencies.
 * @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
 * @req REQ-OUTPUT-DISPLAY - Display results in npm outdated style output with filters
 * @req REQ-FORMAT-SUPPORT - Support table, json, xml formats
 * @param {string} format - Output format ('table', 'json', 'xml').
 * @param {boolean} returnSummary - Whether to return summary object.
 * @param {{prod:{minAge:number,minSeverity:string},dev:{minAge:number,minSeverity:string}}} thresholds - Thresholds configuration.
 * @returns {Object|undefined} summary for xml mode or if returnSummary is true
 */
export function handleNoOutdated(format, returnSummary, thresholds) {
  const summary = {
    totalOutdated: 0,
    safeUpdates: 0,
    filteredByAge: 0,
    filteredBySecurity: 0,
  };
  if (format === 'json') {
    return handleJsonOutput({ rows: [], summary, thresholds, vulnMap: new Map(), filterReasonMap: new Map() });
  }
  if (format === 'xml') {
    return handleXmlOutput({ rows: [], summary, thresholds, vulnMap: new Map(), filterReasonMap: new Map() });
  }
  console.log('All dependencies are up to date.');
  if (returnSummary) return summary;
  return;
}

/**
 * Print outdated dependencies information with age
 * @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
 * @story prompts/003.0-DEV-IDENTIFY-OUTDATED.md
 * @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
 * @story prompts/008.0-DEV-JSON-OUTPUT.md
 * @story prompts/009.0-DEV-XML-OUTPUT.md
 * @req REQ-NPM-COMMAND - Execute `npm outdated --json` using child_process
 * @req REQ-OUTPUT-DISPLAY - Display results in npm outdated style output with filters
 * @req REQ-FORMAT-SUPPORT - Support table, json, xml formats
 * @req REQ-FORMAT-JSON - Delegate JSON output branch
 * @req REQ-UPDATE-MODE - Delegate update mode branch
 * @req REQ-FORMAT-XML - Delegate XML output branch
 * @req REQ-NO-OUTDATED-BRANCH - Handle no outdated dependencies scenario
 * @param {Record<string, { current: string; wanted: string; latest: string }>} data
 * @param {{ fetchVersionTimes?: function, calculateAgeInDays?: function, checkVulnerabilities?: function, format?: string, prodMinAge?: number, devMinAge?: number, prodMinSeverity?: string, devMinSeverity?: string, returnSummary?: boolean, updateMode?: boolean, skipConfirmation?: boolean }} [options]
 * @param {object} [options] - Options object containing CLI and function overrides.
 * @returns {Promise<Object|undefined>} summary for xml mode or if returnSummary is true
 */
export async function printOutdated(data, options = {}) {
  const fetchVersionTimes = options.fetchVersionTimes || defaultFetchVersionTimes;
  const calculateAgeInDays = options.calculateAgeInDays || defaultCalculateAgeInDays;
  const checkVulnerabilities = options.checkVulnerabilities || defaultCheckVulnerabilities;
  const format = options.format || 'table';
  const returnSummary = options.returnSummary === true;
  const updateMode = options.updateMode === true;
  const skipConfirmation = options.skipConfirmation === true;

  // Configurable thresholds - support both old and new parameter names
  const prodMinAge = typeof options.prodMinAge === 'number' ? options.prodMinAge : 7;
  const devMinAge = typeof options.devMinAge === 'number' ? options.devMinAge : 7;
  const prodMinSeverity = options.prodMinSeverity || 'none';
  const devMinSeverity = options.devMinSeverity || 'none';
  const thresholds = /** @type {any} */ (getThresholds(prodMinAge, prodMinSeverity, devMinAge, devMinSeverity));

  // Load package.json to determine dependency types
  const { dependencies: prodDeps, devDependencies: _devDeps } = loadPackageJson();
  const getDependencyType = (/** @type {string} */ packageName) => (packageName in prodDeps ? 'prod' : 'dev');

  const entries = Object.entries(data);

  // No outdated dependencies
  // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
  // @req REQ-NO-OUTDATED-BRANCH - Handle no outdated dependencies scenario
  if (entries.length === 0) {
    return handleNoOutdated(format, returnSummary, thresholds);
  }

  // Build rows
  const rows = await buildRows(data, {
    fetchVersionTimes,
    calculateAgeInDays,
    getDependencyType,
    format,
  });

  // Apply filters
  const { safeRows, matureRows, vulnMap, filterReasonMap, summary } = await applyFilters(rows, {
    prodMinAge,
    devMinAge,
    prodMinSeverity,
    devMinSeverity,
    checkVulnerabilities,
    format,
  });

  // @story prompts/008.0-DEV-JSON-OUTPUT.md
  // @req REQ-FORMAT-JSON - Delegate JSON output branch
  if (format === 'json') {
    return handleJsonOutput({ rows: safeRows, summary, thresholds, vulnMap, filterReasonMap });
  }

  // @story prompts/011.0-DEV-AUTO-UPDATE.md
  // @req REQ-UPDATE-MODE - Delegate update mode branch
  if (updateMode) {
    const result = await updatePackages(safeRows, skipConfirmation, summary);
    return result;
  }

  // @story prompts/009.0-DEV-XML-OUTPUT.md
  // @req REQ-FORMAT-XML - Delegate XML output branch
  if (format === 'xml') {
    return handleXmlOutput({ rows, summary, thresholds, vulnMap, filterReasonMap });
  }

  return handleTableOutput({ safeRows, matureRows, summary, prodMinAge, devMinAge, returnSummary });
}
