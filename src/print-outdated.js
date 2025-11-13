#!/usr/bin/env node
// @ts-nocheck - TODO: Fix type annotations incrementally

import fs from 'fs';
import path from 'path';
import { fetchVersionTimes as defaultFetchVersionTimes } from './fetch-version-times.js';
import { calculateAgeInDays as defaultCalculateAgeInDays } from './age-calculator.js';
import { checkVulnerabilities as defaultCheckVulnerabilities } from './check-vulnerabilities.js';
import { xmlFormatter } from './xml-formatter.js';
import { loadPackageJson } from './load-package-json.js';
import { buildRows } from './build-rows.js';
import { applyFilters } from './apply-filters.js';
import { handleJsonOutput } from './print-outdated-handlers.js';
import { updatePackages } from './update-packages.js';

/**
 * Handle JSON format output for outdated dependencies.
 * Extracted from printOutdated to reduce complexity.
 * @param {Record<string, { current: string; wanted: string; latest: string }>} data
 * @param {number} prodMinAge
 * @param {number} devMinAge
 * @param {string} prodMinSeverity
 * @param {string} devMinSeverity
 * @returns {Object} Summary object
 */
function handleJsonFormat(data, prodMinAge, devMinAge, prodMinSeverity, devMinSeverity) {
  return handleJsonOutput(data, {
    prodMinAge,
    devMinAge,
    prodMinSeverity,
    devMinSeverity,
  });
}

/**
 * Handle case where there are no outdated dependencies.
 * Extracted from printOutdated to reduce complexity.
 * @param {string} format
 * @param {{prod:{minAge:number,minSeverity:string}, dev:{minAge:number,minSeverity:string}}} thresholds
 * @param {boolean} returnSummary
 * @returns {Object|undefined} Summary object if needed
 */
function handleNoOutdated(format, thresholds, returnSummary) {
  const summary = {
    totalOutdated: 0,
    safeUpdates: 0,
    filteredByAge: 0,
    filteredBySecurity: 0,
  };
  const timestamp = new Date().toISOString();
  if (format === 'xml') {
    console.log(xmlFormatter({ rows: [], summary, thresholds, timestamp }));
    return summary;
  }
  console.log('All dependencies are up to date.');
  if (returnSummary) return summary;
  return;
}

// complexity is tolerated in this file due to CLI orchestration; review during refactors
/**
 * Print outdated dependencies information with age
 * @param {Record<string, { current: string; wanted: string; latest: string }>} data
 * @param {{ fetchVersionTimes?: function, calculateAgeInDays?: function, checkVulnerabilities?: function, format?: string, prodMinAge?: number, devMinAge?: number, prodMinSeverity?: string, devMinSeverity?: string, returnSummary?: boolean, updateMode?: boolean, skipConfirmation?: boolean }} [options]
 * @returns {Object|undefined} summary for xml mode or if returnSummary is true
 */
export async function printOutdated(data, options = {}) {
  const fetchVersionTimes =
    options.fetchVersionTimes || defaultFetchVersionTimes;
  const calculateAgeInDays =
    options.calculateAgeInDays || defaultCalculateAgeInDays;
  const checkVulnerabilities =
    options.checkVulnerabilities || defaultCheckVulnerabilities;
  const format = options.format || 'table';
  const returnSummary = options.returnSummary === true;
  const updateMode = options.updateMode === true;
  const skipConfirmation = options.skipConfirmation === true;

  // Configurable thresholds - support both old and new parameter names
  const prodMinAge =
    typeof options.prodMinAge === 'number' ? options.prodMinAge : 7;
  const devMinAge =
    typeof options.devMinAge === 'number' ? options.devMinAge : 7;
  const prodMinSeverity = options.prodMinSeverity || 'none';
  const devMinSeverity = options.devMinSeverity || 'none';

  // Load package.json to determine dependency types
  const { dependencies: prodDeps, devDependencies: _devDeps } =
    loadPackageJson();
  const getDependencyType = (packageName) =>
    packageName in prodDeps ? 'prod' : 'dev';

  const entries = Object.entries(data);

  // Story: prompts/008.0-DEV-JSON-OUTPUT.md - minimal JSON output
  if (format === 'json') {
    return handleJsonFormat(data, prodMinAge, devMinAge, prodMinSeverity, devMinSeverity);
  }

  // No outdated dependencies
  if (entries.length === 0) {
    const thresholds = {
      prod: { minAge: prodMinAge, minSeverity: prodMinSeverity },
      dev: { minAge: devMinAge, minSeverity: devMinSeverity },
    };
    return handleNoOutdated(format, thresholds, returnSummary);
  }

  // Build rows
  const rows = await buildRows(data, {
    fetchVersionTimes,
    calculateAgeInDays,
    getDependencyType,
    format,
  });

  // Apply filters
  const { safeRows, matureRows, vulnMap, filterReasonMap, summary } =
    await applyFilters(rows, {
      prodMinAge,
      devMinAge,
      prodMinSeverity,
      devMinSeverity,
      checkVulnerabilities,
      format,
    });

  const timestamp = new Date().toISOString();

  if (updateMode) {
    const result = await updatePackages(safeRows, skipConfirmation, summary);
    return result;
  }

  // XML output (enriched)
  if (format === 'xml') {
    const thresholds = {
      prod: { minAge: prodMinAge, minSeverity: prodMinSeverity },
      dev: { minAge: devMinAge, minSeverity: devMinSeverity },
    };
    const items = rows.map(([name, current, wanted, latest, age, depType]) => {
      const minAge = depType === 'prod' ? prodMinAge : devMinAge;
      const filteredByAge = typeof age !== 'number' || age < minAge;
      const vulnInfo = vulnMap.get(name) || {
        count: 0,
        maxSeverity: 'none',
        details: [],
      };
      const filteredBySecurity = vulnInfo.count > 0;
      const filtered = filteredByAge || filteredBySecurity;
      const filterReason =
        filterReasonMap.get(name) || (filteredByAge ? 'age' : '');
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

  // Table output (default)
  console.log('Outdated packages:');
  console.log(
    ['Name', 'Current', 'Wanted', 'Latest', 'Age (days)', 'Type'].join('	')
  );

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