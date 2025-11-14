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
 * Factory for string flag parsers.
 *
 * @param {string} flag - Flag name without leading hyphens.
 * @returns {(args: string[], defaultValue: string, validValues?: string[]) => string}
 */
function createStringFlagParser(flag) {
  return (args, defaultValue, validValues) =>
    parseStringFlag(args, flag, defaultValue, validValues);
}

/**
 * Factory for integer flag parsers.
 *
 * @param {string} flag - Flag name without leading hyphens.
 * @param {number} [min=1] - Minimum allowed value.
 * @param {number} [max=Infinity] - Maximum allowed value.
 * @returns {(args: string[], defaultValue: number) => number}
 */
function createIntegerFlagParser(flag, min = 1, max = Infinity) {
  return (args, defaultValue) =>
    parseIntegerFlag(args, flag, defaultValue, min, max);
}

/**
 * Parse the --format flag.
 */
export const parseFormatFlag = createStringFlagParser('format');

/**
 * Parse the --severity flag.
 */
export const parseSeverityFlag = createStringFlagParser('severity');

/**
 * Parse the --prod-severity flag.
 */
export const parseProdSeverityFlag = createStringFlagParser('prod-severity');

/**
 * Parse the --dev-severity flag.
 */
export const parseDevSeverityFlag = createStringFlagParser('dev-severity');

/**
 * Parse the --min-age flag.
 * @story prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md
 * @req REQ-CLI-MIN-AGE-VALIDATION - CLI --min-age must be an integer between 1 and 365
 */
export const parseMinAgeFlag = createIntegerFlagParser('min-age', 1, 365);

/**
 * Parse the --prod-min-age flag.
 */
export const parseProdMinAgeFlag = createIntegerFlagParser('prod-min-age', 1);

/**
 * Parse the --dev-min-age flag.
 */
export const parseDevMinAgeFlag = createIntegerFlagParser('dev-min-age', 1);