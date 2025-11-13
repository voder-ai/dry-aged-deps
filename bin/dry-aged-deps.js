#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { execFileSync } from 'child_process';
import { printOutdated } from '../src/print-outdated.js';
import { xmlFormatter } from '../src/xml-formatter.js';
import { parseOptions } from '../src/cli-options.js';

/**
 * dry-aged-deps CLI
 * Lists outdated npm dependencies and shows how long they have been outdated.
 */
async function main() {
  // Resolve __dirname for ESM
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Parse CLI options
  const args = process.argv.slice(2);
  const options = parseOptions(args);
  const {
    format,
    prodMinAge,
    devMinAge,
    prodMinSeverity,
    devMinSeverity,
    updateMode,
    skipConfirmation,
    returnSummary: checkMode
  } = options;

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
      '  --prod-min-age=<days>  Minimum age for production dependencies (falls back to --min-age)'
    );
    console.log(
      '  --dev-min-age=<days>   Minimum age for development dependencies (falls back to --min-age)'
    );
    console.log(
      '  --severity=<level>     Vulnerability severity threshold: none, low, moderate, high, critical (default: none)'
    );
    console.log(
      '  --prod-severity=<lvl>  Severity threshold for production dependencies (falls back to --severity)'
    );
    console.log(
      '  --dev-severity=<lvl>   Severity threshold for development dependencies (falls back to --severity)'
    );
    console.log(
      '  --check                 Check mode: exit code 1 if safe updates available, 0 if none, 2 on error'
    );
    console.log(
      '  --update               Update dependencies to latest safe versions'
    );
    console.log(
      '  -y, --yes               Skip confirmation prompts (assume yes)'
    );
    console.log(
      '  --config-file=<file>    Path to JSON config file (default: .dry-aged-deps.json). CLI flags override config file values'
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
  } else if (
    format === 'json' &&
    fs.existsSync(path.join(process.cwd(), 'package.json'))
  ) {
    // Skip running npm outdated in JSON mode when package.json present
    data = {};
  } else {
    // Run npm outdated via npm outdated --json
    let outputStr;
    try {
      outputStr = execFileSync('npm', ['outdated', '--json'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
    } catch (err) {
      if (err.stdout && err.stdout.toString().trim()) {
        outputStr = err.stdout.toString();
      } else {
        if (format === 'xml') {
          const timestamp = new Date().toISOString();
          console.log(xmlFormatter({ timestamp, error: err }));
          process.exit(2);
        } else if (format === 'json') {
          const ts = new Date().toISOString();
          console.log(
            JSON.stringify(
              {
                timestamp: ts,
                error: {
                  message: err.message,
                  code: err.code || '',
                  details: err.details || '',
                  story: 'prompts/008.0-DEV-JSON-OUTPUT.md',
                },
              },
              null,
              2
            )
          );
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
      } else if (format === 'json') {
        const ts = new Date().toISOString();
        console.log(
          JSON.stringify(
            {
              timestamp: ts,
              error: {
                message: parseErr.message,
                code: parseErr.code || '',
                details: parseErr.details || '',
                story: 'prompts/008.0-DEV-JSON-OUTPUT.md',
              },
            },
            null,
            2
          )
        );
        process.exit(2);
      }
      console.error('Failed to parse npm outdated output:', parseErr.message);
      process.exit(1);
    }
  }

  // Print results
  try {
    const summary = await printOutdated(data, {
      format,
      fetchVersionTimes: fetchVersionTimesOverride,
      checkVulnerabilities: checkVulnerabilitiesOverride,
      prodMinAge,
      devMinAge,
      prodMinSeverity,
      devMinSeverity,
      updateMode,
      skipConfirmation,
      returnSummary: checkMode,
    });
    if (checkMode) {
      if (summary.safeUpdates > 0) process.exit(1);
      else process.exit(0);
    }
    process.exit(0);
  } catch (err) {
    if (format === 'xml') {
      const timestamp = new Date().toISOString();
      console.log(xmlFormatter({ timestamp, error: err }));
      process.exit(2);
    } else if (format === 'json') {
      const ts = new Date().toISOString();
      console.log(
        JSON.stringify(
          {
            timestamp: ts,
            error: {
              message: err.message,
              code: err.code || '',
              details: err.details || '',
              story: 'prompts/008.0-DEV-JSON-OUTPUT.md',
            },
          },
          null,
          2
        )
      );
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