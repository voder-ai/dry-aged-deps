// @ts-nocheck
/**
 * Helper to extract raw flag value from CLI args.
 *
 * @param {string[]} args - CLI arguments.
 * @param {string} flag - Flag name without leading hyphens.
 * @returns {string|undefined} The raw flag value if provided; undefined if flag not present. Exits with code 2 if flag provided without a value.
 */
function getFlagRawValue(args, flag) {
  const prefix = `--${flag}=`;
  const eqArg = args.find((a) => a.startsWith(prefix));
  if (eqArg) {
    return eqArg.slice(prefix.length);
  }
  const idx = args.indexOf(`--${flag}`);
  if (idx !== -1) {
    if (args.length > idx + 1) {
      return args[idx + 1];
    }
    console.error(`Missing value for --${flag}`);
    process.exit(2);
  }
  return undefined;
}

/**
 * Generic helper to parse string flags with optional validation.
 *
 * @param {string[]} args - CLI arguments.
 * @param {string} flag - Flag name, e.g., 'format', 'severity'.
 * @param {string} defaultValue - Default value if flag not provided.
 * @param {string[]} [validValues] - Optional array of valid values.
 * @returns {string} Parsed flag value.
 */
function parseStringFlag(args, flag, defaultValue, validValues) {
  const raw = getFlagRawValue(args, flag);
  const value = raw !== undefined ? raw : defaultValue;
  if (validValues && !validValues.includes(value)) {
    console.error(`Invalid ${flag}: ${value}. Valid values are: ${validValues.join(', ')}`);
    process.exit(2);
  }
  return value;
}

/**
 * Generic helper to parse integer flags with min/max bounds.
 *
 * @param {string[]} args - CLI arguments.
 * @param {string} flag - Flag name, e.g., 'min-age', 'prod-min-age'.
 * @param {number} defaultValue - Default numeric value.
 * @param {number} [min=1] - Minimum allowed value (inclusive).
 * @param {number} [max=Infinity] - Maximum allowed value (inclusive).
 * @returns {number} Parsed integer flag value.
 */
function parseIntegerFlag(args, flag, defaultValue, min = 1, max = Infinity) {
  const raw = getFlagRawValue(args, flag);
  let num = defaultValue;
  if (raw !== undefined) {
    if (!/^[0-9]+$/.test(raw)) {
      console.error(`Invalid ${flag}: ${raw}. Must be an integer >= ${min}.`);
      process.exit(2);
    }
    num = parseInt(raw, 10);
    if (num < min || num > max) {
      console.error(`Invalid ${flag}: ${raw}. Must be an integer between ${min} and ${max}.`);
      process.exit(2);
    }
  }
  return num;
}

/**
 * Parse the --format flag.
 */
export function parseFormatFlag(args, defaultFormat, validFormats) {
  return parseStringFlag(args, 'format', defaultFormat, validFormats);
}

/**
 * Parse the --min-age flag.
 */
export function parseMinAgeFlag(args, defaultMinAge) {
  return parseIntegerFlag(args, 'min-age', defaultMinAge, 1);
}

/**
 * Parse the --severity flag.
 */
export function parseSeverityFlag(args, defaultSeverity, validSeverities) {
  return parseStringFlag(args, 'severity', defaultSeverity, validSeverities);
}

/**
 * Parse the --prod-min-age flag.
 */
export function parseProdMinAgeFlag(args, defaultProdMinAge) {
  return parseIntegerFlag(args, 'prod-min-age', defaultProdMinAge, 1);
}

/**
 * Parse the --dev-min-age flag.
 */
export function parseDevMinAgeFlag(args, defaultDevMinAge) {
  return parseIntegerFlag(args, 'dev-min-age', defaultDevMinAge, 1);
}

/**
 * Parse the --prod-severity flag.
 */
export function parseProdSeverityFlag(args, defaultProdMinSeverity, validSeverities) {
  return parseStringFlag(args, 'prod-severity', defaultProdMinSeverity, validSeverities);
}

/**
 * Parse the --dev-severity flag.
 */
export function parseDevSeverityFlag(args, defaultDevMinSeverity, validSeverities) {
  return parseStringFlag(args, 'dev-severity', defaultDevMinSeverity, validSeverities);
}
