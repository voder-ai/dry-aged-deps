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
 * @param {any} error - The error to handle.
 * @param {string} format - The output format.
 * @supports prompts/008.0-DEV-JSON-OUTPUT.md REQ-ERROR-FORMAT
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-ERROR-FORMAT
 */
function handleError(error, format) {
  // @story prompts/009.0-DEV-XML-OUTPUT.md
  // @req REQ-ERROR-FORMAT
  if (format === 'xml') {
    // @story prompts/009.0-DEV-XML-OUTPUT.md
    // @req REQ-ERROR-FORMAT
    const timestamp = new Date().toISOString();
    console.log(xmlFormatter({ timestamp, error }));
    // @story prompts/009.0-DEV-XML-OUTPUT.md
    // @req REQ-ERROR-FORMAT
  } else if (format === 'json') {
    // @story prompts/008.0-DEV-JSON-OUTPUT.md
    // @req REQ-ERROR-FORMAT
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
    // @story prompts/008.0-DEV-JSON-OUTPUT.md
    // @req REQ-ERROR-FORMAT
  } else {
    // @story prompts/014.0-DEV-INVALID-OPTION-ERROR.md
    // @req REQ-ERROR-EXIT-CODE
    console.error(error.message);
    // @story prompts/014.0-DEV-INVALID-OPTION-ERROR.md
    // @req REQ-ERROR-EXIT-CODE
  }
  process.exit(2);
}

/**
 * Load outdated data either from mock, skip, or by running `npm outdated --json`.
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

  // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
  // @req REQ-NPM-COMMAND
  if (process.env.DRY_AGED_DEPS_MOCK === '1') {
    // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
    // @req REQ-NPM-COMMAND
    const mockPath = pathToFileURL(path.resolve(__dirname, '../test/helpers/cli.outdated.mock.js')).href;
    const mock = await import(mockPath);
    data = mock.outdatedData;
    fetchVersionTimesOverride = mock.fetchVersionTimes;
    checkVulnerabilitiesOverride = mock.checkVulnerabilities;
    // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
    // @req REQ-NPM-COMMAND
  } else if (format === 'json' && fs.existsSync(path.join(process.cwd(), 'package.json'))) {
    // @story prompts/008.0-DEV-JSON-OUTPUT.md
    // @req REQ-JSON-SCHEMA
    data = {};
    // @story prompts/008.0-DEV-JSON-OUTPUT.md
    // @req REQ-JSON-SCHEMA
  } else {
    // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
    // @req REQ-NPM-COMMAND
    let outputStr;
    // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
    // @req REQ-NPM-COMMAND
    try {
      outputStr = execFileSync('npm', ['outdated', '--json'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
      // @req REQ-NPM-COMMAND
    } catch (err) {
      // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
      // @req REQ-NPM-COMMAND
      /** @type {any} */
      const errorAny = err;
      // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
      // @req REQ-NPM-COMMAND
      if (errorAny.stdout && errorAny.stdout.toString().trim()) {
        // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
        // @req REQ-NPM-COMMAND
        outputStr = errorAny.stdout.toString();
        // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
        // @req REQ-NPM-COMMAND
      } else {
        // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
        // @req REQ-NPM-COMMAND
        throw errorAny;
        // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
        // @req REQ-NPM-COMMAND
      }
    }
    // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
    // @req REQ-OUTPUT-DISPLAY
    try {
      data = outputStr ? JSON.parse(outputStr) : {};
      // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
      // @req REQ-OUTPUT-DISPLAY
    } catch (parseErr) {
      // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
      // @req REQ-OUTPUT-DISPLAY
      if (format === 'json' || format === 'xml') {
        // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
        // @req REQ-OUTPUT-DISPLAY
        throw /** @type {Error} */ (parseErr);
        // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
        // @req REQ-OUTPUT-DISPLAY
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
 * @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-NPM-COMMAND
 * @returns {Promise<void>}
 */
async function main() {
  const args = process.argv.slice(2);

  // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
  // @req REQ-OUTPUT-DISPLAY
  if (args.includes('-h') || args.includes('--help')) {
    // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
    // @req REQ-OUTPUT-DISPLAY
    printHelp();
    return;
    // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
    // @req REQ-OUTPUT-DISPLAY
  }

  // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
  // @req REQ-OUTPUT-DISPLAY
  if (args.includes('-v') || args.includes('--version')) {
    // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
    // @req REQ-OUTPUT-DISPLAY
    printVersion();
    return;
    // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
    // @req REQ-OUTPUT-DISPLAY
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
  // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
  // @req REQ-NPM-COMMAND
  try {
    // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
    // @req REQ-NPM-COMMAND
    ({ data, fetchVersionTimesOverride, checkVulnerabilitiesOverride } = await loadOutdatedData(format));
    // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
    // @req REQ-NPM-COMMAND
  } catch (error) {
    // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
    // @req REQ-NPM-COMMAND
    handleError(/** @type {Error & {code?: string, details?: string}} */ (error), format);
    // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
    // @req REQ-NPM-COMMAND
  }

  // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
  // @req REQ-OUTPUT-DISPLAY
  try {
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

    // @story prompts/013.0-DEV-CHECK-MODE.md
    // @req REQ-CHECK-FLAG
    if (checkMode) {
      // @story prompts/013.0-DEV-CHECK-MODE.md
      // @req REQ-CHECK-FLAG
      process.exit(summary.safeUpdates > 0 ? 1 : 0);
      // @story prompts/013.0-DEV-CHECK-MODE.md
      // @req REQ-CHECK-FLAG
    }
    // @story prompts/011.0-DEV-AUTO-UPDATE.md
    // @req REQ-UPDATE-FLAG
    if (updateMode) {
      // @story prompts/011.0-DEV-AUTO-UPDATE.md
      // @req REQ-UPDATE-FLAG
      process.exit(0);
      // @story prompts/011.0-DEV-AUTO-UPDATE.md
      // @req REQ-UPDATE-FLAG
    }
    process.exit(summary.safeUpdates > 0 ? 1 : 0);
    // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
    // @req REQ-OUTPUT-DISPLAY
  } catch (error) {
    // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
    // @req REQ-OUTPUT-DISPLAY
    handleError(/** @type {Error & {code?: string, details?: string}} */ (error), format);
    // @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
    // @req REQ-OUTPUT-DISPLAY
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
