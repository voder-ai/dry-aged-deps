#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { execFileSync } from 'child_process';
import { printOutdated } from '../src/print-outdated.js';
import { xmlFormatter } from '../src/xml-formatter.js';

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
    console.log(
      '  --format=<format>      Output format: table (default), json, xml'
    );
    console.log(
      '  --min-age=<days>       Minimum age in days (1-365) for including versions (default: 7)'
    );
    console.log(
      '  --severity=<level>     Vulnerability severity threshold: none, low, moderate, high, critical (default: none)'
    );
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
  const fmtEq = args.find((a) => a.startsWith('--format='));
  if (fmtEq) {
    format = fmtEq.split('=')[1];
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

  // Parse --min-age flag
  let minAge = 7;
  const minAgeEq = args.find((a) => a.startsWith('--min-age='));
  if (minAgeEq) {
    const v = minAgeEq.split('=')[1];
    if (!/^[0-9]+$/.test(v)) {
      console.error(
        `Invalid min-age: ${v}. Must be an integer between 1 and 365.`
      );
      process.exit(2);
    }
    minAge = parseInt(v, 10);
    if (minAge < 1 || minAge > 365) {
      console.error(
        `Invalid min-age: ${v}. Must be an integer between 1 and 365.`
      );
      process.exit(2);
    }
  } else {
    const idx = args.indexOf('--min-age');
    if (idx !== -1) {
      if (args.length > idx + 1) {
        const v = args[idx + 1];
        if (!/^[0-9]+$/.test(v)) {
          console.error(
            `Invalid min-age: ${v}. Must be an integer between 1 and 365.`
          );
          process.exit(2);
        }
        minAge = parseInt(v, 10);
        if (minAge < 1 || minAge > 365) {
          console.error(
            `Invalid min-age: ${v}. Must be an integer between 1 and 365.`
          );
          process.exit(2);
        }
      } else {
        console.error('Missing value for --min-age');
        process.exit(2);
      }
    }
  }

  // Parse --severity flag
  const validSeverities = ['none', 'low', 'moderate', 'high', 'critical'];
  let minSeverity = 'none';
  const sevEq = args.find((a) => a.startsWith('--severity='));
  if (sevEq) {
    const v = sevEq.split('=')[1];
    if (!validSeverities.includes(v)) {
      console.error(
        `Invalid severity: ${v}. Valid values are: ${validSeverities.join(', ')}`
      );
      process.exit(2);
    }
    minSeverity = v;
  } else {
    const idx = args.indexOf('--severity');
    if (idx !== -1) {
      if (args.length > idx + 1) {
        const v = args[idx + 1];
        if (!validSeverities.includes(v)) {
          console.error(
            `Invalid severity: ${v}. Valid values are: ${validSeverities.join(', ')}`
          );
          process.exit(2);
        }
        minSeverity = v;
      } else {
        console.error('Missing value for --severity');
        process.exit(2);
      }
    }
  }

  // Load data
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
  } else if (format === 'json') {
    // Minimal for JSON format
    data = {};
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
        if (format === 'xml') {
          const timestamp = new Date().toISOString();
          console.log(xmlFormatter({ timestamp, error: err }));
          process.exit(2);
        }
        console.error('Error running npm outdated:', err.message);
        process.exit(1);
      }
    }
    // Parse JSON output
    try {
      data = outputStr ? JSON.parse(outputStr) : {};
    } catch (parseErr) {
      if (format === 'xml') {
        const timestamp = new Date().toISOString();
        console.log(xmlFormatter({ timestamp, error: parseErr }));
        process.exit(2);
      }
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
      minAge,
      minSeverity,
    });
    process.exit(0);
  } catch (err) {
    if (format === 'xml') {
      const timestamp = new Date().toISOString();
      console.log(xmlFormatter({ timestamp, error: err }));
      process.exit(2);
    }
    console.error(err.message);
    process.exit(2);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});