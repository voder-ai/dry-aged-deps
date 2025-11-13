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
  let value = defaultValue;
  const prefix = `--${flag}=`;
  const eqArg = args.find((a) => a.startsWith(prefix));
  if (eqArg) {
    value = eqArg.slice(prefix.length);
  } else {
    const idx = args.indexOf(`--${flag}`);
    if (idx !== -1) {
      if (args.length > idx + 1) {
        value = args[idx + 1];
      } else {
        console.error(`Missing value for --${flag}`);
        process.exit(2);
      }
    }
  }
  if (validValues && !validValues.includes(value)) {
    console.error(
      `Invalid ${flag}: ${value}. Valid values are: ${validValues.join(', ')}`
    );
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
  let num = defaultValue;
  const prefix = `--${flag}=`;
  const eqArg = args.find((a) => a.startsWith(prefix));
  if (eqArg) {
    const str = eqArg.slice(prefix.length);
    if (!/^[0-9]+$/.test(str)) {
      console.error(`Invalid ${flag}: ${str}. Must be an integer >= ${min}.`);
      process.exit(2);
    }
    num = parseInt(str, 10);
    if (num < min || num > max) {
      console.error(
        `Invalid ${flag}: ${str}. Must be an integer between ${min} and ${max}.`
      );
      process.exit(2);
    }
  } else {
    const idx = args.indexOf(`--${flag}`);
    if (idx !== -1) {
      if (args.length > idx + 1) {
        const str = args[idx + 1];
        if (!/^[0-9]+$/.test(str)) {
          console.error(`Invalid ${flag}: ${str}. Must be an integer >= ${min}.`);
          process.exit(2);
        }
        num = parseInt(str, 10);
        if (num < min || num > max) {
          console.error(
            `Invalid ${flag}: ${str}. Must be an integer between ${min} and ${max}.`
          );
          process.exit(2);
        }
      } else {
        console.error(`Missing value for --${flag}`);
        process.exit(2);
      }
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
  return parseIntegerFlag(args, 'min-age', defaultMinAge, 1, 365);
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
  return parseIntegerFlag(args, 'prod-min-age', defaultProdMinAge, 1, 365);
}

/**
 * Parse the --dev-min-age flag.
 */
export function parseDevMinAgeFlag(args, defaultDevMinAge) {
  return parseIntegerFlag(args, 'dev-min-age', defaultDevMinAge, 1, 365);
}

/**
 * Parse the --prod-severity flag.
 */
export function parseProdSeverityFlag(
  args,
  defaultProdMinSeverity,
  validSeverities
) {
  return parseStringFlag(
    args,
    'prod-severity',
    defaultProdMinSeverity,
    validSeverities
  );
}

/**
 * Parse the --dev-severity flag.
 */
export function parseDevSeverityFlag(
  args,
  defaultDevMinSeverity,
  validSeverities
) {
  return parseStringFlag(
    args,
    'dev-severity',
    defaultDevMinSeverity,
    validSeverities
  );
}
