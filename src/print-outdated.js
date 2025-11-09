#!/usr/bin/env node

import { fetchVersionTimes as defaultFetchVersionTimes } from './fetch-version-times.js';
import { calculateAgeInDays as defaultCalculateAgeInDays } from './age-calculator.js';

/**
 * Print outdated dependencies information with age
 * @param {Record<string, { current: string; wanted: string; latest: string }>} data
 * @param {{ fetchVersionTimes?: function, calculateAgeInDays?: function }} [options]
 */
export async function printOutdated(data, options = {}) {
  const fetchVersionTimes =
    options.fetchVersionTimes || defaultFetchVersionTimes;
  const calculateAgeInDays =
    options.calculateAgeInDays || defaultCalculateAgeInDays;

  const entries = Object.entries(data);
  if (entries.length === 0) {
    console.log('All dependencies are up to date.');
    return;
  }

  console.log('Outdated packages:');
  // Header with Age column
  console.log(['Name', 'Current', 'Wanted', 'Latest', 'Age (days)'].join('	'));

  // Fetch all version times in parallel
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
        console.error(
          `Warning: failed to fetch version times for ${name}: ${err.message}`
        );
      }
      return [name, info.current, info.wanted, info.latest, age];
    })()
  );

  const rows = await Promise.all(tasks);

  // Filter to only show packages with mature versions (>= 7 days old)
  const MIN_AGE_DAYS = 7;
  const matureRows = rows.filter((row) => {
    const age = row[4]; // age is the 5th element (index 4)
    // Include if age is a number >= 7, exclude 'N/A' and ages < 7
    return typeof age === 'number' && age >= MIN_AGE_DAYS;
  });

  if (matureRows.length === 0) {
    console.log(
      'No outdated packages with mature versions (>= 7 days old) found.'
    );
    return;
  }

  for (const row of matureRows) {
    console.log(row.join('	'));
  }
}
