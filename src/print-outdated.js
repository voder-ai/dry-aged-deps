#!/usr/bin/env node

import { fetchVersionTimes as defaultFetchVersionTimes } from './fetch-version-times.js';
import { calculateAgeInDays as defaultCalculateAgeInDays } from './age-calculator.js';
import { checkVulnerabilities as defaultCheckVulnerabilities } from './check-vulnerabilities.js';
import { jsonFormatter } from './json-formatter.js';
import { xmlFormatter } from './xml-formatter.js';

/**
 * Print outdated dependencies information with age
 * @param {Record<string, { current: string; wanted: string; latest: string }>} data
 * @param {{ fetchVersionTimes?: function, calculateAgeInDays?: function, checkVulnerabilities?: function, format?: string, minAge?: number, minSeverity?: string }} [options]
 * @returns {Object|undefined} summary for xml mode
 */
export async function printOutdated(data, options = {}) {
  const fetchVersionTimes = options.fetchVersionTimes || defaultFetchVersionTimes;
  const calculateAgeInDays = options.calculateAgeInDays || defaultCalculateAgeInDays;
  const checkVulnerabilities = options.checkVulnerabilities || defaultCheckVulnerabilities;
  const format = options.format || 'table';

  // Configurable thresholds
  const minAge = typeof options.minAge === 'number' ? options.minAge : 7;
  const minSeverity = options.minSeverity || 'none';

  const entries = Object.entries(data);

  // JSON output (minimal)
  if (format === 'json') {
    const rows = entries.map(([name, info]) => [name, info.current, info.wanted, info.latest, null]);
    const totalOutdated = rows.length;
    const summary = {
      totalOutdated,
      safeUpdates: totalOutdated,
      filteredByAge: 0,
      filteredBySecurity: 0,
      minAge,
    };
    const timestamp = new Date().toISOString();
    console.log(jsonFormatter({ rows, summary, timestamp }));
    return summary;
  }

  // No outdated dependencies
  if (entries.length === 0) {
    if (format === 'xml') {
      const timestamp = new Date().toISOString();
      const summary = {
        totalOutdated: 0,
        safeUpdates: 0,
        filteredByAge: 0,
        filteredBySecurity: 0,
        minAge,
      };
      const thresholds = { prod: { minAge, minSeverity }, dev: { minAge, minSeverity } };
      console.log(xmlFormatter({ rows: [], summary, thresholds, timestamp }));
      return summary;
    }
    console.log('All dependencies are up to date.');
    return;
  }

  // Fetch version times and calculate ages
  const ageTasks = entries.map(([name, info]) =>
    (async () => {
      let age = 'N/A';
      try {
        const versionTimes = await fetchVersionTimes(name);
        const latestTime = versionTimes[info.latest];
        if (latestTime) {
          age = calculateAgeInDays(latestTime);
        }
      } catch (err) {
        if (format !== 'xml' && format !== 'json') {
          console.error(`Warning: failed to fetch version times for ${name}: ${err.message}`);
        }
      }
      return [name, info.current, info.wanted, info.latest, age];
    })()
  );
  const rows = await Promise.all(ageTasks);

  // Filter by age threshold
  const matureRows = rows.filter(([, , , , age]) => typeof age === 'number' && age >= minAge);

  // Vulnerability filtering
  const safeRows = [];
  const vulnMap = new Map();
  const filterReasonMap = new Map();
  for (const row of matureRows) {
    const [name, , , latest] = row;
    let include = true;
    let vulnCount = 0;
    try {
      vulnCount = await checkVulnerabilities(name, latest);
      if (vulnCount !== 0) {
        include = false;
        filterReasonMap.set(name, 'security');
      }
    } catch (err) {
      if (format !== 'xml' && format !== 'json') {
        console.error(`Warning: failed to check vulnerabilities for ${name}@${latest}: ${err.message}`);
      }
      // treat failures as safe
    }
    vulnMap.set(name, { count: vulnCount, maxSeverity: vulnCount > 0 ? minSeverity : 'none', details: [] });
    if (include) {
      safeRows.push(row);
    }
  }

  const totalOutdated = rows.length;
  const filteredByAge = totalOutdated - matureRows.length;
  const filteredBySecurity = matureRows.length - safeRows.length;
  const summary = {
    totalOutdated,
    safeUpdates: safeRows.length,
    filteredByAge,
    filteredBySecurity,
    minAge,
  };
  const timestamp = new Date().toISOString();

  // XML output (enriched)
  if (format === 'xml') {
    const thresholds = { prod: { minAge, minSeverity }, dev: { minAge, minSeverity } };
    const items = rows.map(([name, current, wanted, latest, age]) => {
      const filteredByAge = typeof age !== 'number' || age < minAge;
      const vulnInfo = vulnMap.get(name) || { count: 0, maxSeverity: 'none', details: [] };
      const filteredBySecurity = vulnInfo.count > 0;
      const filtered = filteredByAge || filteredBySecurity;
      const filterReason = filterReasonMap.get(name) || (filteredByAge ? 'age' : '');
      const dependencyType = '';
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
        dependencyType,
      };
    });
    console.log(xmlFormatter({ rows: items, summary, thresholds, timestamp }));
    return summary;
  }

  // Table output (default)
  console.log('Outdated packages:');
  console.log(['Name', 'Current', 'Wanted', 'Latest', 'Age (days)'].join('	'));

  if (matureRows.length === 0) {
    console.log(
      `No outdated packages with mature versions (>= ${minAge} days old) found.`
    );
    return;
  }
  if (safeRows.length === 0) {
    console.log(
      `No outdated packages with safe, mature versions (>= ${minAge} days old, no vulnerabilities) found.`
    );
    return;
  }

  for (const row of safeRows) {
    console.log(row.join('	'));
  }
}