// @ts-check

import { fetchVersionTimes as defaultFetchVersionTimes } from './fetch-version-times.js';
import { calculateAgeInDays as defaultCalculateAgeInDays } from './age-calculator.js';
import { checkVulnerabilities as defaultCheckVulnerabilities } from './check-vulnerabilities.js';
import { loadPackageJson } from './load-package-json.js';
import { buildRows } from './build-rows.js';
import { applyFilters } from './apply-filters.js';
import { handleJsonOutput, handleXmlOutput, handleTableOutput } from './print-outdated-handlers.js';
import { printUnfixableSection } from './print-outdated-utils.js';
import { computeUnfixable } from './compute-unfixable.js';
import { updatePackages } from './update-packages.js';
import { getThresholds } from './print-utils.js';

/**
 * Handle scenario when there are no outdated dependencies.
 * @param {string} format - Output format ('table', 'json', 'xml').
 * @param {boolean} returnSummary - Whether to return summary object.
 * @param {{prod:{minAge:number,minSeverity:string},dev:{minAge:number,minSeverity:string}}} thresholds - Thresholds configuration.
 * @param {Record<string, string>} [excludeMap] - Excluded packages map.
 * @param {Array<{ name: string, severity: string, advisory: string, reason: string, via: Array<string> }>} [unfixable] - Known-vulnerable-but-unfixable rows.
 * @returns {Object|undefined} summary for xml mode or if returnSummary is true
 * @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-OUTPUT-DISPLAY
 * @supports prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md REQ-UNFIXABLE-DETECT
 */
export function handleNoOutdated(format, returnSummary, thresholds, excludeMap = {}, unfixable = []) {
  const summary = {
    totalOutdated: 0,
    safeUpdates: 0,
    filteredByAge: 0,
    filteredBySecurity: 0,
  };
  // @supports prompts/008.0-DEV-JSON-OUTPUT.md REQ-CLI-FLAG
  if (format === 'json') {
    return handleJsonOutput({
      rows: [],
      summary,
      thresholds,
      vulnMap: new Map(),
      filterReasonMap: new Map(),
      excludeMap,
      unfixable,
    });
  }
  // @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-CLI-FLAG
  if (format === 'xml') {
    return handleXmlOutput({
      rows: [],
      summary,
      thresholds,
      vulnMap: new Map(),
      filterReasonMap: new Map(),
      excludeMap,
      unfixable,
    });
  }
  console.log('All dependencies are up to date.');
  // @supports prompts/015.0-DEV-EXCLUDE-PACKAGES.md REQ-EXCLUDE-OUTPUT
  const excludedCount = Object.keys(excludeMap).length;
  if (excludedCount > 0) {
    console.log(`${excludedCount} package(s) excluded from analysis (see .dry-aged-deps.json)`);
  }
  // @supports prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md REQ-UNFIXABLE-TABLE
  printUnfixableSection(unfixable);
  // @supports prompts/013.0-DEV-CHECK-MODE.md REQ-CHECK-FLAG
  if (returnSummary) return summary;
  return;
}

/**
 * Filter out excluded packages from the data object.
 * @param {Record<string, any>} data - Outdated packages data.
 * @param {Record<string, string>} excludeMap - Packages to exclude (name -> reason).
 * @returns {Record<string, any>} Filtered data without excluded packages.
 * @supports prompts/015.0-DEV-EXCLUDE-PACKAGES.md REQ-EXCLUDE-FILTER
 */
function applyExclusions(data, excludeMap) {
  const excludedNames = new Set(Object.keys(excludeMap));
  if (excludedNames.size === 0) return data;
  return Object.fromEntries(Object.entries(data).filter(([name]) => !excludedNames.has(name)));
}

/**
 * Resolve the unfixable-vulnerability rows from the relevant CLI/config options.
 * Extracted from printOutdated to keep that function within the complexity limit.
 * @param {Set<string>} safePackages - names dry-aged-deps will recommend a safe update for
 * @param {{ unfixable?: boolean, unfixableLevel?: string, runProjectAudit?: () => Promise<Array<object>> }} options
 * @param {boolean} [updateMode] - true in --update mode, where there is no output surface to skip the audit cost
 * @returns {Promise<Array<{ name: string, severity: string, advisory: string, reason: string, via: Array<string> }>>}
 * @supports prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md REQ-UNFIXABLE-DEFAULT-ON REQ-UNFIXABLE-SEVERITY-FLOOR
 */
function resolveUnfixable(safePackages, options, updateMode = false) {
  return computeUnfixable({
    safePackages,
    // Explicit opt-in: the user-facing "on by default" lives in parseOptions
    // (which passes unfixable:true unless --no-unfixable). Defaulting the
    // programmatic API to off keeps embedders — and the existing unit tests —
    // from unexpectedly shelling out to `npm audit`.
    enabled: options.unfixable === true && !updateMode,
    severityFloor: options.unfixableLevel, // undefined → 'low' (surface all) inside computeUnfixable
    runProjectAudit: options.runProjectAudit, // injectable; defaults inside computeUnfixable
  });
}

/**
 * Print outdated dependencies information with age
 * @param {Record<string, { current: string; wanted: string; latest: string }>} data
 * @param {{ fetchVersionTimes?: function, calculateAgeInDays?: function, checkVulnerabilities?: function, format?: string, prodMinAge?: number, devMinAge?: number, prodMinSeverity?: string, devMinSeverity?: string, returnSummary?: boolean, updateMode?: boolean, skipConfirmation?: boolean, exclude?: Record<string, string>, unfixable?: boolean, unfixableLevel?: string, runProjectAudit?: () => Promise<Array<object>> }} [options]
 * @param {object} [options] - Options object containing CLI and function overrides.
 * @returns {Promise<Object|undefined>} summary for xml mode or if returnSummary is true
 * @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-NPM-COMMAND
 * @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-OUTPUT-DISPLAY
 * @supports prompts/003.0-DEV-IDENTIFY-OUTDATED.md REQ-SMART-SEARCH
 * @supports prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md REQ-AUDIT-CHECK
 * @supports prompts/008.0-DEV-JSON-OUTPUT.md REQ-CLI-FLAG
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-CLI-FLAG
 * @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-UPDATE-FLAG
 */
export async function printOutdated(data, options = {}) {
  const fetchVersionTimes = options.fetchVersionTimes || defaultFetchVersionTimes;
  const calculateAgeInDays = options.calculateAgeInDays || defaultCalculateAgeInDays;
  const checkVulnerabilities = options.checkVulnerabilities || defaultCheckVulnerabilities;
  const format = options.format || 'table';
  const returnSummary = options.returnSummary === true;
  const updateMode = options.updateMode === true;
  const skipConfirmation = options.skipConfirmation === true;
  const excludeMap = options.exclude || {};

  // Configurable thresholds - support both old and new parameter names
  const prodMinAge = typeof options.prodMinAge === 'number' ? options.prodMinAge : 7;
  const devMinAge = typeof options.devMinAge === 'number' ? options.devMinAge : 7;
  const prodMinSeverity = options.prodMinSeverity || 'none';
  const devMinSeverity = options.devMinSeverity || 'none';
  const thresholds = /** @type {any} */ (getThresholds(prodMinAge, prodMinSeverity, devMinAge, devMinSeverity));

  // Load package.json to determine dependency types
  const { dependencies: prodDeps, devDependencies: _devDeps } = loadPackageJson();
  /** @story prompts/007.0-DEV-SEPARATE-PROD-DEV-THRESHOLDS.md */
  const getDependencyType = (/** @type {string} */ packageName) => (packageName in prodDeps ? 'prod' : 'dev');

  // @supports prompts/015.0-DEV-EXCLUDE-PACKAGES.md REQ-EXCLUDE-FILTER
  const filteredData = applyExclusions(data, excludeMap);

  const entries = Object.entries(filteredData);

  // No outdated dependencies
  // @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-OUTPUT-DISPLAY
  if (entries.length === 0) {
    // Transitive vulns can exist even with zero outdated direct deps, so the
    // unfixable surface still runs here (safe-update set is empty).
    const unfixable = await resolveUnfixable(new Set(), options);
    return handleNoOutdated(format, returnSummary, thresholds, excludeMap, unfixable);
  }

  // Build rows
  const rows = await buildRows(filteredData, {
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

  // @supports prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md REQ-UNFIXABLE-DETECT
  // The absence of a package from safeRows is the unfixable signal (ADR-0018).
  // resolveUnfixable returns [] (and skips the audit) in update mode.
  const unfixable = await resolveUnfixable(new Set(safeRows.map((row) => row[0])), options, updateMode);

  // @supports prompts/008.0-DEV-JSON-OUTPUT.md REQ-CLI-FLAG
  if (format === 'json') {
    return handleJsonOutput({ rows: safeRows, summary, thresholds, vulnMap, filterReasonMap, excludeMap, unfixable });
  }

  // @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-UPDATE-FLAG
  if (updateMode) {
    const result = await updatePackages(safeRows, skipConfirmation, summary);
    return result;
  }

  // @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-CLI-FLAG
  if (format === 'xml') {
    return handleXmlOutput({ rows, summary, thresholds, vulnMap, filterReasonMap, excludeMap, unfixable });
  }

  return handleTableOutput({
    safeRows,
    matureRows,
    summary,
    prodMinAge,
    devMinAge,
    returnSummary,
    excludeMap,
    unfixable,
  });
}
