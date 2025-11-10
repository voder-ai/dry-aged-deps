#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToFile, fileURLToPath, pathToFileURL } from 'url';
import { execFileSync } from 'child_process';
import { printOutdated } from '../src/print-outdated.js';

/**
 * dry-aged-deps CLI
 * Lists outdated npm dependencies and shows how long they have been outdated.
 */
async function main() {
  // Resolve __dirname for ESM
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // CLI arguments
  const args = process.argv.slice(2);

  // Help flag
  if (args.includes('-h') || args.includes('--help')) {
    console.log('Usage: dry-aged-deps [options]');
    console.log('');
    console.log('Options:');
    console.log('  -h, --help             Show help');
    console.log('  -v, --version          Show version');
    console.log('  --format=<format>      Output format: table (default), json, xml');
    process.exit(0);
  }

  // Version flag
  if (args.includes('-v') || args.includes('--version')) {
    const pkgPath = path.join(__dirname, '..', 'package.json');
    const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    console.log(pkgJson.version);
    process.exit(0);
  }

  // Format flag parsing
  const validFormats = ['table', 'json', 'xml'];
  let format = 'table';
  const formatArg = args.find((arg) => arg.startsWith('--format='));
  if (formatArg) {
    format = formatArg.split('=')[1];
  } else {
    const idx = args.indexOf('--format');
    if (idx !== -1 && args.length > idx + 1) {
      format = args[idx + 1];
    }
  }
  if (!validFormats.includes(format)) {
    console.error(
      `Invalid format: ${format}. Valid values are: ${validFormats.join(', ')}`
    );
    process.exit(2);
  }

  let data;
  let fetchVersionTimesOverride;
  let checkVulnerabilitiesOverride;

  if (process.env.DRY_AGED_DEPS_MOCK === '1') {
    // Load mock module for testing
    const mockPath = pathToFileURL(
      path.resolve(__dirname, '../test/helpers/cli.outdated.mock.js')
    ).href;
    const mock = await import(mockPath);
    data = mock.outdatedData;
    fetchVersionTimesOverride = mock.fetchVersionTimes;
    checkVulnerabilitiesOverride = mock.checkVulnerabilities;
  } else {
    // Run npm outdated in JSON mode
    let outputStr;
    try {
      outputStr = execFileSync('npm', ['outdated', '--json'], {
        encoding: 'utf8',
      });
    } catch (err) {
      if (err.stdout) {
        outputStr = err.stdout.toString();
      } else {
        console.error('Error running npm outdated:', err.message);
        process.exit(1);
      }
    }
    // Parse JSON output
    try {
      data = outputStr ? JSON.parse(outputStr) : {};
    } catch (parseErr) {
      console.error('Failed to parse npm outdated output:', parseErr.message);
      process.exit(1);
    }
  }

  // Print results
  try {
    await printOutdated(data, {
      format,
      fetchVersionTimes: fetchVersionTimesOverride,
      checkVulnerabilities: checkVulnerabilitiesOverride,
    });
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
