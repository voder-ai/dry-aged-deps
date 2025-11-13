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
    const summary = handleJsonOutput(data, { prodMinAge, devMinAge, prodMinSeverity, devMinSeverity });
    return summary;
  }

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
    const timestamp = new Date().toISOString();
    if (format === 'xml') {
      console.log(xmlFormatter({ rows: [], summary, thresholds, timestamp }));
      return summary;
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
    const pkgPath = path.join(process.cwd(), 'package.json');
    if (safeRows.length === 0) {
      console.log('No safe updates available.');
      return summary;
    }
    console.log('The following packages will be updated:');
    for (const [name, current, wanted] of safeRows) {
      console.log(`  ${name}: ${current} → ${wanted}`);
    }
    if (!skipConfirmation) {
      const { createInterface } = await import('readline');
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      const answer = await new Promise((resolve) => {
        rl.question('Update package.json? [y/N] ', (ans) => {
          rl.close();
          resolve(ans.trim().toLowerCase());
        });
      });
      if (answer !== 'y' && answer !== 'yes') {
        console.log('Aborted.');
        return summary;
      }
    }
    // Create backup before applying changes
    const backupPath = pkgPath + '.backup';
    try {
      fs.copyFileSync(pkgPath, backupPath);
      console.log(`Created backup of package.json at ${backupPath}`);
    } catch (err) {
      console.error(`Failed to create backup: ${err.message}`);
      return summary;
    }
    // Apply updates to package.json
    try {
      const pkgContent = fs.readFileSync(pkgPath, 'utf8');
      const pkgData = JSON.parse(pkgContent);
      /* eslint-disable security/detect-object-injection */
      for (const [name, , wanted, , , depType] of safeRows) {
        if (depType === 'prod') {
          if (!pkgData.dependencies) pkgData.dependencies = {};
          pkgData.dependencies[name] = wanted;
        } else {
          if (!pkgData.devDependencies) pkgData.devDependencies = {};
          pkgData.devDependencies[name] = wanted;
        }
      }
      /* eslint-enable security/detect-object-injection */
      fs.writeFileSync(
        pkgPath,
        JSON.stringify(pkgData, null, 2) + '\n',
        'utf8'
      );
      console.log(`Updated package.json with ${safeRows.length} safe packages`);
      console.log("Run 'npm install' to install the updates");
    } catch (err) {
      console.error(`Failed to update package.json: ${err.message}`);
    }
    return summary;
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