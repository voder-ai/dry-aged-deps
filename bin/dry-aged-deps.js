#!/usr/bin/env node
// @ts-check

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { execFileSync } from 'child_process';
import { printOutdated } from '../src/print-outdated.js';
import { xmlFormatter } from '../src/xml-formatter.js';
import { parseOptions } from '../src/cli-options.js';

/**
 * @typedef {import('../src/cli-options.js').CliOptions} CliOptions
 */

/**
 * Print usage help for the CLI.
 *
 * @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-OUTPUT-DISPLAY
 * @supports prompts/014.0-DEV-INVALID-OPTION-ERROR.md REQ-HELP-SUGGESTION
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
  console.log('');
  console.log('Examples of invalid option error messages:');
  console.log('  $ dry-aged-deps --json');
  console.log("    Error: Unknown option '--json'");
  console.log("    Did you mean '--format=json'? ");
  console.log("    Use 'dry-aged-deps --help' to see all available options.");
  console.log('');
  console.log('  $ dry-aged-deps --format=yaml');
  console.log('    Error: Invalid format: yaml. Valid values are: table, json, xml');
  console.log("    Use 'dry-aged-deps --help' for more information.");
}

/**
 * Print the installed package version.
 *
 * @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-OUTPUT-DISPLAY
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
 *
 * @param {any} error - The error to handle.
 * @param {string} format - The output format.
 * @supports prompts/008.0-DEV-JSON-OUTPUT.md REQ-ERROR-FORMAT
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-ERROR-FORMAT
 */
function handleError(error, format) {
  if (format === 'xml') {
    // @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-ERROR-FORMAT
    const timestamp = new Date().toISOString();
    console.log(xmlFormatter({ timestamp, error }));
  } else if (format === 'json') {
    // @supports prompts/008.0-DEV-JSON-OUTPUT.md REQ-ERROR-FORMAT
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
    // @supports prompts/014.0-DEV-INVALID-OPTION-ERROR.md REQ-ERROR-EXIT-CODE
    console.error(error.message);
  }
  process.exit(2);
}

/**
 * Load outdated data either from mock, skip, or by running `npm outdated --json`.
 *
 * @param {string} format - Output format.
 * @returns {Promise<{data: object, fetchVersionTimesOverride: function|undefined, checkVulnerabilitiesOverride: function|undefined}>}
 * @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-NPM-COMMAND REQ-JSON-PARSE
 */
async function loadOutdatedData(format) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  let data;
  let fetchVersionTimesOverride;
  let checkVulnerabilitiesOverride;

  if (process.env.DRY_AGED_DEPS_MOCK === '1') {
    // @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-NPM-COMMAND
    const mockPath = pathToFileURL(path.resolve(__dirname, '../test/helpers/cli.outdated.mock.js')).href;
    const mock = await import(mockPath);
    data = mock.outdatedData;
    fetchVersionTimesOverride = mock.fetchVersionTimes;
    checkVulnerabilitiesOverride = mock.checkVulnerabilities;
  } else {
    let outputStr;
    try {
      // @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-NPM-COMMAND
      outputStr = execFileSync('npm', ['outdated', '--json'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
    } catch (err) {
      // @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-NPM-COMMAND
      /** @type {any} */
      const errorAny = err;
      if (errorAny.stdout && errorAny.stdout.toString().trim()) {
        outputStr = errorAny.stdout.toString();
      } else {
        // @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-NPM-COMMAND
        throw errorAny;
      }
    }
    try {
      // @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-OUTPUT-DISPLAY
      data = outputStr ? JSON.parse(outputStr) : {};
    } catch (parseErr) {
      // @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-JSON-PARSE
      if (format === 'json' || format === 'xml') {
        // @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-OUTPUT-DISPLAY
        throw /** @type {Error} */ (parseErr);
      }
      /** @type {Error} */
      const errObj = parseErr;
      throw new Error(`Failed to parse npm outdated output: ${errObj.message}`);
    }
  }
  return { data, fetchVersionTimesOverride, checkVulnerabilitiesOverride };
}

/**
 * Main CLI entrypoint.
 *
 * @returns {Promise<void>}
 * @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-NPM-COMMAND
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('-h') || args.includes('--help')) {
    // @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-OUTPUT-DISPLAY
    printHelp();
    return;
  }

  if (args.includes('-v') || args.includes('--version')) {
    // @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-OUTPUT-DISPLAY
    printVersion();
    return;
  }

  /** @type {CliOptions} */
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
    // @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-NPM-COMMAND
    ({ data, fetchVersionTimesOverride, checkVulnerabilitiesOverride } = await loadOutdatedData(format));
  } catch (error) {
    // @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-NPM-COMMAND
    handleError(/** @type {Error & {code?: string, details?: string}} */ (error), format);
  }

  try {
    // @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-OUTPUT-DISPLAY
    const summary = /** @type {{ safeUpdates: number }} */ (
      await printOutdated(/** @type {any} */ (data), {
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
      })
    );

    if (checkMode) {
      // @supports prompts/013.0-DEV-CHECK-MODE.md REQ-CHECK-FLAG
      process.exit(summary.safeUpdates > 0 ? 1 : 0);
    }
    if (updateMode) {
      // @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-UPDATE-FLAG
      process.exit(0);
    }
    process.exit(summary.safeUpdates > 0 ? 1 : 0);
  } catch (error) {
    // @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-OUTPUT-DISPLAY
    handleError(/** @type {Error & {code?: string, details?: string}} */ (error), format);
  }
}

// @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-OUTPUT-DISPLAY
main().catch((err) => {
  console.error(err);
  process.exit(2);
});
