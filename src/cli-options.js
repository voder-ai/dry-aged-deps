// @ts-check
import { loadConfigFile } from './config-loader.js';
import {
  parseFormatFlag,
  parseMinAgeFlag,
  parseSeverityFlag,
  parseProdMinAgeFlag,
  parseDevMinAgeFlag,
  parseProdSeverityFlag,
  parseDevSeverityFlag,
} from './cli-options-helpers.js';

/**
 * Options derived from CLI arguments and config file.
 *
 * @typedef {Object} CliOptions
 * @property {string} format - Output format: table, json, or xml.
 * @property {number} prodMinAge - Minimum age (days) for production dependencies.
 * @property {number} devMinAge - Minimum age (days) for development dependencies.
 * @property {string} prodMinSeverity - Vulnerability severity threshold for production dependencies.
 * @property {string} devMinSeverity - Vulnerability severity threshold for development dependencies.
 * @property {boolean} updateMode - Whether to update dependencies to latest safe versions.
 * @property {boolean} skipConfirmation - Whether to skip confirmation prompts.
 * @property {boolean} returnSummary - If true, return summary instead of printing (check mode).
 */

/**
 * Parse CLI arguments and optional config file to derive options for dry-aged-deps.
 * Exits the process with code 2 on invalid input or configuration.
 *
 * @supports prompts/013.0-DEV-CHECK-MODE.md REQ-CHECK-FLAG
 * @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-UPDATE-FLAG
 * @supports prompts/010.0-DEV-CONFIG-FILE-SUPPORT.md REQ-CONFIG-LOCATION
 * @supports prompts/008.0-DEV-JSON-OUTPUT.md REQ-CLI-FLAG
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-CLI-FLAG
 * @supports prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md REQ-CLI-FLAG
 * @supports prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md REQ-CLI-FLAG
 * @supports prompts/014.0-DEV-INVALID-OPTION-ERROR.md REQ-OPTION-VALIDATION
 * @supports prompts/014.0-DEV-INVALID-OPTION-ERROR.md REQ-UNKNOWN-OPTION-ERROR
 * @supports prompts/014.0-DEV-INVALID-OPTION-ERROR.md REQ-ERROR-EXIT-CODE
 * @supports prompts/014.0-DEV-INVALID-OPTION-ERROR.md REQ-HELP-SUGGESTION
 * @supports prompts/014.0-DEV-INVALID-OPTION-ERROR.md REQ-DID-YOU-MEAN
 * @param {string[]} argv - CLI arguments (excluding node and script path).
 * @returns {import('./cli-options').CliOptions} Parsed CLI options.
 */
export function parseOptions(argv) {
  const args = argv;

  // Detect unknown CLI options
  const allowedOptions = [
    '--check',
    '--update',
    '--yes',
    '-y',
    '--config-file',
    '--format',
    '--min-age',
    '--prod-min-age',
    '--dev-min-age',
    '--severity',
    '--prod-severity',
    '--dev-severity',
    '--help',
    '-h',
    '--version',
    '-v',
  ];
  const unknownArgs = args.filter(
    (a) => a.startsWith('-') && !allowedOptions.some((opt) => a === opt || a.startsWith(`${opt}=`))
  );
  // @supports prompts/014.0-DEV-INVALID-OPTION-ERROR.md REQ-UNKNOWN-OPTION-ERROR
  if (unknownArgs.length > 0) {
    unknownArgs.forEach((arg) => {
      console.error(`Error: Unknown option '${arg}'`);
      let suggestion;
      // @supports prompts/014.0-DEV-INVALID-OPTION-ERROR.md REQ-DID-YOU-MEAN
      if (arg === '--json') suggestion = '--format=json';
      // @supports prompts/014.0-DEV-INVALID-OPTION-ERROR.md REQ-DID-YOU-MEAN
      else if (arg.startsWith('--format')) suggestion = '--format';
      // @supports prompts/014.0-DEV-INVALID-OPTION-ERROR.md REQ-HELP-SUGGESTION
      if (suggestion) {
        console.error(`Did you mean '${suggestion}'?`);
      }
    });
    console.error(`Use 'dry-aged-deps --help' to see all available options.`);
    process.exit(2);
  }

  const checkMode = args.includes('--check');
  const updateMode = args.includes('--update');
  const skipConfirmation = args.includes('--yes') || args.includes('-y');

  // Allowed values for severity and format
  const validSeverities = ['none', 'low', 'moderate', 'high', 'critical'];
  const validFormats = ['table', 'json', 'xml'];

  // Config file support
  const configFileArg = args.find((a) => a.startsWith('--config-file='));
  const configFileName = configFileArg ? configFileArg.split('=')[1] : '.dry-aged-deps.json';
  /** @type {any} */
  const config = loadConfigFile(configFileName, configFileArg, validSeverities, validFormats);

  const defaultFormat = config.format ?? 'table';
  const format = parseFormatFlag(args, defaultFormat, validFormats);

  const defaultMinAge = config.minAge ?? 7;
  const minAge = parseMinAgeFlag(args, defaultMinAge);

  const defaultProdMinAge = config.prod?.minAge ?? minAge;
  const defaultDevMinAge = config.dev?.minAge ?? minAge;
  const prodMinAge = parseProdMinAgeFlag(args, defaultProdMinAge);
  const devMinAge = parseDevMinAgeFlag(args, defaultDevMinAge);

  const defaultSeverity = config.severity ?? 'none';
  const severity = parseSeverityFlag(args, defaultSeverity, validSeverities);

  const defaultProdMinSeverity = config.prod?.minSeverity ?? severity;
  const defaultDevMinSeverity = config.dev?.minSeverity ?? severity;
  const prodMinSeverity = parseProdSeverityFlag(args, defaultProdMinSeverity, validSeverities);
  const devMinSeverity = parseDevSeverityFlag(args, defaultDevMinSeverity, validSeverities);

  return {
    format,
    prodMinAge,
    devMinAge,
    prodMinSeverity,
    devMinSeverity,
    updateMode,
    skipConfirmation,
    returnSummary: checkMode,
  };
}
