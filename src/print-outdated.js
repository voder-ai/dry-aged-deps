#!/usr/bin/env node

// src/print-outdated.js

/**
 * Print outdated dependencies information with age
 * @param {Record<string, { current: string; wanted: string; latest: string }>} data
 * @param {{ fetchVersionTimes?: function, calculateAgeInDays?: function }} [options]
 */
function printOutdated(data, options = {}) {
  const fetchVersionTimes =
    options.fetchVersionTimes || require('./fetch-version-times').fetchVersionTimes;
  const calculateAgeInDays =
    options.calculateAgeInDays || require('./age-calculator').calculateAgeInDays;

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
    } catch {
      // ignore errors fetching times
    }

    console.log([
      name,
      info.current,
      info.wanted,
      info.latest,
      age,
    ].join('	'));
  }
}

module.exports = { printOutdated };
