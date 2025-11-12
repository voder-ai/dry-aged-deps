#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fetchVersionTimes as defaultFetchVersionTimes } from './fetch-version-times.js';
import { calculateAgeInDays as defaultCalculateAgeInDays } from './age-calculator.js';
import { checkVulnerabilities as defaultCheckVulnerabilities } from './check-vulnerabilities.js';
import { jsonFormatter } from './json-formatter.js';
import { xmlFormatter } from './xml-formatter.js';
import { filterByAge } from './filter-by-age.js';
import { filterBySecurity } from './filter-by-security.js';

/**
 * Print outdated dependencies information with age
 * @param {Record<string, { current: string; wanted: string; latest: string }>} data
 * @param {{ fetchVersionTimes?: function, calculateAgeInDays?: function, checkVulnerabilities?: function, format?: string, prodMinAge?: number, devMinAge?: number, prodMinSeverity?: string, devMinSeverity?: string, returnSummary?: boolean }} [options]
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

  // Configurable thresholds - support both old and new parameter names
  const prodMinAge =
    typeof options.prodMinAge === 'number' ? options.prodMinAge : 7;
  const devMinAge =
    typeof options.devMinAge === 'number' ? options.devMinAge : 7;
  const prodMinSeverity = options.prodMinSeverity || 'none';
  const devMinSeverity = options.devMinSeverity || 'none';

  // Read package.json to determine dependency types
  let packageJson = { dependencies: {}, devDependencies: {} };
  try {
    const pkgPath = path.join(process.cwd(), 'package.json');
    const pkgContent = fs.readFileSync(pkgPath, 'utf8');
    packageJson = JSON.parse(pkgContent);
  } catch {
    // If we can't read package.json, treat all as dev dependencies
  }

  // Helper to determine if a package is prod or dev
  const getDependencyType = (packageName) => {
    if (packageJson.dependencies && packageName in packageJson.dependencies) {
      return 'prod';
    }
    return 'dev';
  };

  const entries = Object.entries(data);

  // JSON output (minimal)
  if (format === 'json') {
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

  // Fetch version times and calculate ages
  const ageTasks = entries.map(([name, info]) =>
    (async () => {
      let age = 'N/A';
      const depType = getDependencyType(name);
      try {
        const versionTimes = await fetchVersionTimes(name);
        const latestTime = versionTimes[info.latest];
        if (latestTime) {
          age = calculateAgeInDays(latestTime);
        }
      } catch (err) {
        if (format !== 'xml' && format !== 'json') {
          console.error(
            `Warning: failed to fetch version times for ${name}: ${err.message}`
          );
        }
      }
      return [name, info.current, info.wanted, info.latest, age, depType];
    })()
  );
  const rows = await Promise.all(ageTasks);

  // Filter by age threshold using helper
  const matureRows = filterByAge(rows, { prodMinAge, devMinAge });

  // Vulnerability filtering using helper
  const { safeRows, vulnMap, filterReasonMap } = await filterBySecurity(
    matureRows,
    checkVulnerabilities,
    { prodMinSeverity, devMinSeverity },
    format
  );

  const totalOutdated = rows.length;
  const filteredByAge = totalOutdated - matureRows.length;
  const filteredBySecurity = matureRows.length - safeRows.length;
  const summary = {
    totalOutdated,
    safeUpdates: safeRows.length,
    filteredByAge,
    filteredBySecurity,
  };
  const timestamp = new Date().toISOString();

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
