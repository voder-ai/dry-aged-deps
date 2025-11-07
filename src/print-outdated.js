#!/usr/bin/env node

import { fetchVersionTimes as defaultFetchVersionTimes } from './fetch-version-times.js';
import { calculateAgeInDays as defaultCalculateAgeInDays } from './age-calculator.js';

/**
 * Print outdated dependencies information with age
 * @param {Record<string, { current: string; wanted: string; latest: string }>} data
 * @param {{ fetchVersionTimes?: function, calculateAgeInDays?: function }} [options]
 */
export function printOutdated(data, options = {}) {
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

  for (const [name, info] of entries) {
    let age = 'N/A';
    try {
      const versionTimes = fetchVersionTimes(name);
      const latestTime = versionTimes[info.latest];
      if (latestTime) {
        age = calculateAgeInDays(latestTime);
      }
    } catch (err) {
      console.error(`Warning: failed to fetch version times for ${name}: ${err.message}`);
    }

    console.log([name, info.current, info.wanted, info.latest, age].join('	'));
  }
}
