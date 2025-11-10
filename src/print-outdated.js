#!/usr/bin/env node

import { fetchVersionTimes as defaultFetchVersionTimes } from './fetch-version-times.js';
import { calculateAgeInDays as defaultCalculateAgeInDays } from './age-calculator.js';
import { checkVulnerabilities as defaultCheckVulnerabilities } from './check-vulnerabilities.js';
import { xmlFormatter } from './xml-formatter.js';
import { jsonFormatter } from './json-formatter.js';

/**
 * Print outdated dependencies information with age
 * @param {Record<string, { current: string; wanted: string; latest: string }>} data
 * @param {{ fetchVersionTimes?: function, calculateAgeInDays?: function, checkVulnerabilities?: function, format?: string, minAge?: number, minSeverity?: string }} [options]
 */
export async function printOutdated(data, options = {}) {
  const fetchVersionTimes = options.fetchVersionTimes || defaultFetchVersionTimes;
  const calculateAgeInDays = options.calculateAgeInDays || defaultCalculateAgeInDays;
  const checkVulnerabilities = options.checkVulnerabilities || defaultCheckVulnerabilities;
  const format = options.format || 'table';

  // Configurable thresholds
  const minAge = typeof options.minAge === 'number' ? options.minAge : 7;
  // const minSeverity = options.minSeverity || 'none'; // not implemented for now

  const entries = Object.entries(data);

  // Short-circuit JSON and XML formats (minimal output without network calls)
  if (format === 'json' || format === 'xml') {
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
      safeUpdates: rows.length,
      filteredByAge: 0,
      filteredBySecurity: 0,
      minAge,
    };
    const timestamp = new Date().toISOString();
    if (format === 'json') {
      console.log(jsonFormatter({ rows, summary, timestamp }));
    } else {
      console.log(xmlFormatter({ rows, summary, timestamp }));
    }
    return;
  }

  // No outdated dependencies
  if (entries.length === 0) {
    if (format === 'xml') {
      const timestamp = new Date().toISOString();
      console.log(
        xmlFormatter({
          rows: [],
          summary: {
            totalOutdated: 0,
            safeUpdates: 0,
            filteredByAge: 0,
            filteredBySecurity: 0,
            minAge,
          },
          timestamp,
        })
      );
      return;
    } else if (format === 'json') {
      const timestamp = new Date().toISOString();
      console.log(
        jsonFormatter({
          rows: [],
          summary: {
            totalOutdated: 0,
            safeUpdates: 0,
            filteredByAge: 0,
            filteredBySecurity: 0,
            minAge,
          },
          timestamp,
        })
      );
      return;
    } else {
      console.log('All dependencies are up to date.');
      return;
    }
  }

  // Build rows [name, current, wanted, latest, age]
  const tasks = entries.map(([name, info]) =>
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
          console.error(
            `Warning: failed to fetch version times for ${name}: ${err.message}`
          );
        }
      }
      return [name, info.current, info.wanted, info.latest, age];
    })()
  );
  const rows = await Promise.all(tasks);

  // Filter by age threshold
  const matureRows = rows.filter((row) => {
    const age = row[4];
    return typeof age === 'number' && age >= minAge;
  });

  // Vulnerability filtering
  const safeRows = [];
  for (const row of matureRows) {
    const [name, , , latest] = row;
    let include = true;
    try {
      const vulnCount = await checkVulnerabilities(name, latest);
      if (vulnCount !== 0) {
        include = false;
      }
    } catch (err) {
      if (format !== 'xml' && format !== 'json') {
        console.error(
          `Warning: failed to check vulnerabilities for ${name}@${latest}: ${err.message}`
        );
      }
      include = true;
    }
    if (include) {
      safeRows.push(row);
    }
  }

  if (format === 'json') {
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
    console.log(jsonFormatter({ rows: safeRows, summary, timestamp }));
    return;
  }

  if (format === 'xml') {
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
    console.log(xmlFormatter({ rows: safeRows, summary, timestamp }));
    return;
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
