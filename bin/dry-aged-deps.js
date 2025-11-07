#!/usr/bin/env node

import { execFileSync } from 'child_process';
import { printOutdated } from '../src/print-outdated.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
  console.log('  -v, --version Show version');
  process.exit(0);
}

// Version flag
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
if (args.includes('-v') || args.includes('--version')) {
  const pkgPath = path.join(__dirname, '..', 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  console.log(pkgJson.version);
  process.exit(0);
}

// Helper to print results and exit successfully or handle errors
function handleOutdatedOutput(data) {
  printOutdated(data)
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err.message);
      process.exit(1);
    });
}

try {
  // Run npm outdated in JSON mode
  const outputStr = execFileSync('npm', ['outdated', '--json'], {
    encoding: 'utf8',
  });
  let data;
  try {
    data = outputStr ? JSON.parse(outputStr) : {};
  } catch (parseErr) {
    console.error('Failed to parse npm outdated output:', parseErr.message);
    process.exit(1);
  }
  handleOutdatedOutput(data);
} catch (err) {
  // npm outdated exits with non-zero code if outdated packages found
  if (err.stdout) {
    let data;
    try {
      data = JSON.parse(err.stdout.toString() || '{}');
    } catch (parseErr) {
      console.error('Failed to parse npm outdated output:', parseErr.message);
      process.exit(1);
    }
    handleOutdatedOutput(data);
  } else {
    console.error('Error running npm outdated:', err.message);
    process.exit(1);
  }
}
