#!/usr/bin/env node

// src/print-outdated.js

const fetchVersionTimesModule = require('./fetch-version-times');
const ageCalculatorModule = require('./age-calculator');

/**
 * Print outdated dependencies information with age
 * @param {Record<string, { current: string; wanted: string; latest: string }>} data
 */
function printOutdated(data) {
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
      const versionTimes = fetchVersionTimesModule.fetchVersionTimes(name);
      const latestTime = versionTimes[info.latest];
      if (latestTime) {
        age = ageCalculatorModule.calculateAgeInDays(latestTime);
      }
    } catch (err) {
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
