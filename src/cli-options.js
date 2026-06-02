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
  parseUnfixableLevelFlag,
} from './cli-options-helpers.js';

/** Valid severity floors for the unfixable surface. */
const VALID_UNFIXABLE_LEVELS = ['low', 'moderate', 'high', 'critical'];

/**
 * Derive the unfixable-surface options from CLI args + config.
 * Extracted to keep parseOptions within the complexity limit.
 * @param {string[]} args - CLI arguments.
 * @param {Record<string, any>} config - Loaded config file object.
 * @returns {{ unfixable: boolean, unfixableLevel: string }}
 * @supports prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md REQ-UNFIXABLE-DEFAULT-ON REQ-UNFIXABLE-SEVERITY-FLOOR
 */
function parseUnfixableOptions(args, config) {
  // On by default; config `unfixable: false` or `--no-unfixable` disables.
  const unfixable = config.unfixable !== false && !args.includes('--no-unfixable');
  const unfixableLevel = parseUnfixableLevelFlag(args, config['unfixable-level'] ?? 'low', VALID_UNFIXABLE_LEVELS);
  return { unfixable, unfixableLevel };
}

/**
 * Derive the overrides-hygiene surface enable flag from CLI args + config.
 * Mirrors parseUnfixableOptions for the RFC-001 surface.
 * @param {string[]} args - CLI arguments.
 * @param {Record<string, any>} config - Loaded config file object.
 * @returns {boolean}
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-DEFAULT-ON
 */
function parseOverridesHygieneOption(args, config) {
  // On by default; config `overrides-hygiene: false` or `--no-overrides-hygiene` disables.
  return config['overrides-hygiene'] !== false && !args.includes('--no-overrides-hygiene');
}

/**
 * Derive the exposure-aware-soak modifier enable flag from CLI args + config.
 * Inverted sibling of parseOverridesHygieneOption — default-OFF for v1 per
 * RFC-002 §Summary and JTBD-006 trust-default-policy contract. v2 default
 * flip requires its own ADR per RFC-002 §Reassessment.
 * @param {string[]} args - CLI arguments.
 * @param {Record<string, any>} config - Loaded config file object.
 * @returns {boolean}
 * @supports prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md REQ-EXPOSURE-CLI-FLAG REQ-EXPOSURE-OFF-BY-DEFAULT-PRESERVED
 */
function parseExposureAwareSoakOption(args, config) {
  if (args.includes('--no-exposure-aware-soak')) return false;
  if (args.includes('--exposure-aware-soak')) return true;
  return config['exposure-aware-soak'] === true;
}

/**
 * Bundle the surface-flag parsers (unfixable, overrides-hygiene, exposure-aware-soak)
 * so parseOptions stays within the max-lines-per-function cap.
 * @param {string[]} args
 * @param {Record<string, any>} config
 * @returns {{ unfixable: boolean, unfixableLevel: string, overridesHygiene: boolean, exposureAwareSoak: boolean }}
 */
function parseSurfaceFlags(args, config) {
  const { unfixable, unfixableLevel } = parseUnfixableOptions(args, config);
  return {
    unfixable,
    unfixableLevel,
    overridesHygiene: parseOverridesHygieneOption(args, config),
    exposureAwareSoak: parseExposureAwareSoakOption(args, config),
  };
}

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
 * @property {object|undefined} exclude - Packages to exclude from analysis (name -> reason).
 * @property {boolean} unfixable - Whether to surface known-vulnerable-but-unfixable packages.
 * @property {string} unfixableLevel - Minimum severity floor for the unfixable surface.
 * @property {boolean} overridesHygiene - Whether to surface stale or vulnerable package.json `overrides` pins.
 * @property {boolean} exposureAwareSoak - Whether to apply the RFC-002 exposure-aware soak modifier (default-OFF for v1).
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
    '--no-unfixable',
    '--unfixable-level',
    '--no-overrides-hygiene',
    '--exposure-aware-soak',
    '--no-exposure-aware-soak',
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

  const { unfixable, unfixableLevel, overridesHygiene, exposureAwareSoak } = parseSurfaceFlags(args, config);

  return {
    format,
    prodMinAge,
    devMinAge,
    prodMinSeverity,
    devMinSeverity,
    updateMode,
    skipConfirmation,
    returnSummary: checkMode,
    exclude: config.exclude,
    unfixable,
    unfixableLevel,
    overridesHygiene,
    exposureAwareSoak,
  };
}
