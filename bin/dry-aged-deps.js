#!/usr/bin/env node

// CLI tool to list outdated npm dependencies
const { execSync } = require('child_process');

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
 * Print outdated dependencies information
 * @param {Record<string, { current: string; wanted: string; latest: string }> } data
 */
function printOutdated(data) {
  const entries = Object.entries(data);
  if (entries.length === 0) {
    console.log('All dependencies are up to date.');
    return;
  }
  console.log('Outdated packages:');
  // Header
  console.log(['Name', 'Current', 'Wanted', 'Latest'].join('	'));
  // Rows
  for (const [name, info] of entries) {
    console.log([name, info.current, info.wanted, info.latest].join('	'));
  }
}

try {
  // Run npm outdated in JSON mode
  const output = execSync('npm outdated --json', { encoding: 'utf8' });
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