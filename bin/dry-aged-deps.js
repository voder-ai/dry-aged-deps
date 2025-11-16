#!/usr/bin/env node
// @ts-nocheck

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { execFileSync } from 'child_process';
import { printOutdated } from '../src/print-outdated.js';
import { xmlFormatter } from '../src/xml-formatter.js';
import { parseOptions } from '../src/cli-options.js';

/**
 * Print usage help for the CLI.
 * @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
 * @req REQ-CLI-HELP - Provide help documentation for CLI options.
 */
function printHelp() {
  console.log('Usage: dry-aged-deps [options]');
  console.log('');
  console.log('Options:');
  console.log('  -h, --help             Show help');
  console.log('  -v, --version          Show version');
  console.log('  --format=<format>      Output format: table (default), json, xml');
  console.log('  --min-age=<days>       Minimum age in days (1-365) for including versions (default: 7)');
  console.log('  --prod-min-age=<days>  Minimum age for production dependencies (falls back to --min-age)');
  console.log('  --dev-min-age=<days>   Minimum age for development dependencies (falls back to --min-age)');
  console.log(
    '  --severity=<level>     Vulnerability severity threshold: none, low, moderate, high, critical (default: none)'
  );
  console.log('  --prod-severity=<lvl>  Severity threshold for production dependencies (falls back to --severity)');
  console.log('  --dev-severity=<lvl>   Severity threshold for development dependencies (falls back to --severity)');
  console.log('  --check                 Check mode: exit code 1 if safe updates available, 0 if none, 2 on error');
  console.log('  --update               Update dependencies to latest safe versions');
  console.log('  -y, --yes               Skip confirmation prompts (assume yes)');
  console.log(
    '  --config-file=<file>    Path to JSON config file (default: .dry-aged-deps.json). CLI flags override config file values'
  );
}

/**
 * Print the installed package version.
 * @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
 * @req REQ-CLI-VERSION - Provide version information.
 */
function printVersion() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const pkgPath = path.join(__dirname, '..', 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  console.log(pkgJson.version);
}

/**
 * Handle errors by formatting output according to the selected format.
 * @param {Error} error - The error to handle.
 * @param {string} format - The output format.
 * @story prompts/008.0-DEV-JSON-OUTPUT.md
 * @story prompts/009.0-DEV-XML-OUTPUT.md
 * @req REQ-ERROR-HANDLING - Consistent error output in all formats.
 */
function handleError(error, format) {
  if (format === 'xml') {
    const timestamp = new Date().toISOString();
    console.log(xmlFormatter({ timestamp, error }));
  } else if (format === 'json') {
    const ts = new Date().toISOString();
    console.log(
      JSON.stringify(
        {
          timestamp: ts,
          error: {
            message: error.message,
            code: error.code || '',
            details: error.details || '',
            story: 'prompts/008.0-DEV-JSON-OUTPUT.md',
          },
        },
        null,
        2
      )
    );
  } else {
    console.error(error.message);
  }
  process.exit(2);
}

/**
 * Load outdated data either from mock, skip, or by running `npm outdated --json`.
 * @param {string} format - Output format.
 * @returns {Promise<{data: object, fetchVersionTimesOverride: function|undefined, checkVulnerabilitiesOverride: function|undefined}>}
 * @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
 * @req REQ-DATA-LOADING - Load npm outdated data appropriately.
 */
async function loadOutdatedData(format) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  let data;
  let fetchVersionTimesOverride;
  let checkVulnerabilitiesOverride;

  if (process.env.DRY_AGED_DEPS_MOCK === '1') {
    const mockPath = pathToFileURL(path.resolve(__dirname, '../test/helpers/cli.outdated.mock.js')).href;
    const mock = await import(mockPath);
    data = mock.outdatedData;
    fetchVersionTimesOverride = mock.fetchVersionTimes;
    checkVulnerabilitiesOverride = mock.checkVulnerabilities;
  } else if (format === 'json' && fs.existsSync(path.join(process.cwd(), 'package.json'))) {
    data = {};
  } else {
    let outputStr;
    try {
      outputStr = execFileSync('npm', ['outdated', '--json'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
    } catch (err) {
      const errorAny = err;
      if (errorAny.stdout && errorAny.stdout.toString().trim()) {
        outputStr = errorAny.stdout.toString();
      } else {
        throw errorAny;
      }
    }
    try {
      data = outputStr ? JSON.parse(outputStr) : {};
    } catch (parseErr) {
      if (format === 'json' || format === 'xml') {
        throw parseErr;
      }
      throw new Error(`Failed to parse npm outdated output: ${parseErr.message}`);
    }
  }
  return { data, fetchVersionTimesOverride, checkVulnerabilitiesOverride };
}

/**
 * Main CLI entrypoint.
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('-h') || args.includes('--help')) {
    printHelp();
    return;
  }

  if (args.includes('-v') || args.includes('--version')) {
    printVersion();
    return;
  }

  const options = parseOptions(args);
  const {
    format,
    prodMinAge,
    devMinAge,
    prodMinSeverity,
    devMinSeverity,
    updateMode,
    skipConfirmation,
    returnSummary: checkMode,
  } = options;

  let data, fetchVersionTimesOverride, checkVulnerabilitiesOverride;
  try {
    ({ data, fetchVersionTimesOverride, checkVulnerabilitiesOverride } = await loadOutdatedData(format));
  } catch (error) {
    handleError(error, format);
  }

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
      returnSummary: true,
    });

    if (checkMode) {
      process.exit(summary.safeUpdates > 0 ? 1 : 0);
    }
    if (updateMode) {
      process.exit(0);
    }
    process.exit(summary.safeUpdates > 0 ? 1 : 0);
  } catch (error) {
    handleError(error, format);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});