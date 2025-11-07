#!/usr/bin/env node

/*
 * dry-aged-deps CLI
 * Lists outdated npm dependencies and shows how long they have been outdated.
 */

const { execFileSync } = require('child_process');
const { fetchVersionTimes } = require('../src/fetch-version-times');
const { calculateAgeInDays } = require('../src/age-calculator');

// Parse CLI arguments for help flag
const args = process.argv.slice(2);
if (args.includes('-h') || args.includes('--help')) {
  console.log('Usage: dry-aged-deps [options]');
  console.log('');
  console.log('Options:');
  console.log('  -h, --help    Show help');
  process.exit(0);
}

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
      const versionTimes = fetchVersionTimes(name);
      const latestTime = versionTimes[info.latest];
      if (latestTime) {
        age = calculateAgeInDays(latestTime);
      }
    } catch (err) {
      // ignore errors fetching times
    }

    console.log([name, info.current, info.wanted, info.latest, age].join('	'));
  }
}

try {
  // Run npm outdated in JSON mode
  const output = execFileSync('npm', ['outdated', '--json'], { encoding: 'utf8' });
  const data = output ? JSON.parse(output) : {};
  printOutdated(data);
} catch (err) {
  // npm outdated exits with non-zero code if outdated packages found
  if (err.stdout) {
    try {
      const data = JSON.parse(err.stdout.toString() || '{}');
      printOutdated(data);
      process.exit(0);
    } catch (parseErr) {
      console.error('Failed to parse npm outdated output:', parseErr);
      process.exit(1);
    }
  } else {
    console.error('Error running npm outdated:', err.message);
    process.exit(1);
  }
}