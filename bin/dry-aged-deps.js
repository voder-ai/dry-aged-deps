#!/usr/bin/env node

import { execFileSync } from 'child_process';
import { printOutdated } from '../src/print-outdated.js';

/*
 * dry-aged-deps CLI
 * Lists outdated npm dependencies and shows how long they have been outdated.
 */

// Parse CLI arguments for help flag
const args = process.argv.slice(2);
if (args.includes('-h') || args.includes('--help')) {
  console.log('Usage: dry-aged-deps [options]');
  console.log('');
  console.log('Options:');
  console.log('  -h, --help    Show help');
  process.exit(0);
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
