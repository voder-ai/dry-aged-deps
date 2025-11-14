#!/usr/bin/env node
// @ts-nocheck
/* eslint-disable complexity */

import { fetchVersionTimes as defaultFetchVersionTimes } from './fetch-version-times.js';
import { calculateAgeInDays as defaultCalculateAgeInDays } from './age-calculator.js';
import { checkVulnerabilities as defaultCheckVulnerabilities } from './check-vulnerabilities.js';
import { loadPackageJson } from './load-package-json.js';
import { buildRows } from './build-rows.js';
import { applyFilters } from './apply-filters.js';
import { handleJsonOutput, handleXmlOutput, handleTableOutput } from './print-outdated-handlers.js';
import { updatePackages } from './update-packages.js';

// complexity is tolerated in this file due to CLI orchestration; review during refactors
/**
 * Print outdated dependencies information with age
 * @param {Record<string, { current: string; wanted: string; latest: string }>} data
 * @param {{ fetchVersionTimes?: function, calculateAgeInDays?: function, checkVulnerabilities?: function, format?: string, prodMinAge?: number, devMinAge?: number, prodMinSeverity?: string, devMinSeverity?: string, returnSummary?: boolean, updateMode?: boolean, skipConfirmation?: boolean }} [options]
 * @returns {Object|undefined} summary for xml mode or if returnSummary is true
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

  // Load package.json to determine dependency types
  const { dependencies: prodDeps, devDependencies: _devDeps } = loadPackageJson();
  const getDependencyType = (packageName) => (packageName in prodDeps ? 'prod' : 'dev');

  const entries = Object.entries(data);

  // No outdated dependencies
  if (entries.length === 0) {
    const summary = {
      totalOutdated: 0,
      safeUpdates: 0,
      filteredByAge: 0,
      filteredBySecurity: 0,
    };
    const thresholds = {
      prod: { minAge: prodMinAge, minSeverity: prodMinSeverity },
      dev: { minAge: devMinAge, minSeverity: devMinSeverity },
    };
    if (format === 'json') {
      return handleJsonOutput([], summary, thresholds, new Map(), new Map());
    }
    if (format === 'xml') {
      return handleXmlOutput([], summary, thresholds, new Map(), new Map());
    }
    console.log('All dependencies are up to date.');
    if (returnSummary) return summary;
    return;
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

  if (format === 'json') {
    return handleJsonOutput(
      safeRows,
      summary,
      {
        prod: { minAge: prodMinAge, minSeverity: prodMinSeverity },
        dev: { minAge: devMinAge, minSeverity: devMinSeverity },
      },
      vulnMap,
      filterReasonMap
    );
  }

  if (updateMode) {
    const result = await updatePackages(safeRows, skipConfirmation, summary);
    return result;
  }

  if (format === 'xml') {
    return handleXmlOutput(
      rows,
      summary,
      {
        prod: { minAge: prodMinAge, minSeverity: prodMinSeverity },
        dev: { minAge: devMinAge, minSeverity: devMinSeverity },
      },
      vulnMap,
      filterReasonMap
    );
  }

  return handleTableOutput(safeRows, matureRows, summary, prodMinAge, devMinAge, returnSummary);
}