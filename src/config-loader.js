import fs from 'fs';
import path from 'path';

/**
 * Assert a condition or exit with error.
 * @param {boolean} condition - Condition to assert.
 * @param {string} message - Error message to log on failure.
 */
function assert(condition, message) {
  if (!condition) {
    console.error(message);
    process.exit(2);
  }
}

/**
 * Ensure a value is a non-null object (not array).
 * @param {*} value - Value to check.
 * @param {string} name - Name used in error messages.
 */
function ensureObject(value, name) {
  assert(
    typeof value === 'object' && value !== null && !Array.isArray(value),
    `Invalid config format in ${name}: must be a JSON object`
  );
}

/**
 * Validate that an object contains only allowed keys.
 * @param {object} obj - Object to validate.
 * @param {string[]} allowedKeys - Keys permitted in the object.
 * @param {string} context - Context suffix for error messages.
 */
function validateKeys(obj, allowedKeys, context) {
  Object.keys(obj).forEach((key) => {
    assert(
      allowedKeys.includes(key),
      `Unknown config key${context}: ${key}`
    );
  });
}

/**
 * Validate an integer value is within 1-365.
 * @param {number|undefined} value - Value to validate.
 * @param {string} name - Name used in error message.
 */
function validateRangeInt(value, name) {
  if (value === undefined) return;
  assert(
    Number.isInteger(value) && value >= 1 && value <= 365,
    `Invalid config value for ${name}: ${value}. Must be integer 1-365`
  );
}

/**
 * Validate a severity or format value against a list of valid values.
 * @param {string|undefined} value - Value to validate.
 * @param {string[]} validList - List of permitted values.
 * @param {string} name - Name used in error message.
 */
function validateAgainstList(value, validList, name) {
  if (value === undefined) return;
  assert(
    validList.includes(value),
    `Invalid config value for ${name}: ${value}. Valid values: ${validList.join(
      ', '
    )}`
  );
}

/**
 * Load and validate configuration from a config file.
 * @param {string} configFileName - Name of the config file (relative to cwd).
 * @param {string|undefined} configFileArg - CLI arg if provided.
 * @param {string[]} validSeverities - List of valid severities.
 * @param {string[]} validFormats - List of valid formats.
 * @returns {object} Parsed config or empty object if none.
 */
export function loadConfigFile(
  configFileName,
  configFileArg,
  validSeverities,
  validFormats
) {
  const configFilePath = path.resolve(process.cwd(), configFileName);
  let config = {};

  if (fs.existsSync(configFilePath)) {
    let raw;
    try {
      raw = fs.readFileSync(configFilePath, 'utf8');
      config = JSON.parse(raw);
    } catch (err) {
      console.error(
        `Invalid JSON in config file ${configFileName}: ${err.message}`
      );
      process.exit(2);
    }

    ensureObject(config, configFileName);
    validateKeys(config, ['minAge', 'severity', 'prod', 'dev', 'format'], '');

    validateRangeInt(config.minAge, 'minAge');
    validateAgainstList(config.severity, validSeverities, 'severity');
    validateAgainstList(config.format, validFormats, 'format');

    if (config.prod !== undefined) {
      ensureObject(config.prod, 'prod');
      validateKeys(config.prod, ['minAge', 'minSeverity'], ' in prod');
      validateRangeInt(config.prod.minAge, 'prod.minAge');
      validateAgainstList(
        config.prod.minSeverity,
        validSeverities,
        'prod.minSeverity'
      );
    }

    if (config.dev !== undefined) {
      ensureObject(config.dev, 'dev');
      validateKeys(config.dev, ['minAge', 'minSeverity'], ' in dev');
      validateRangeInt(config.dev.minAge, 'dev.minAge');
      validateAgainstList(
        config.dev.minSeverity,
        validSeverities,
        'dev.minSeverity'
      );
    }
  } else if (configFileArg) {
    console.error(`Configuration file not found: ${configFileName}`);
    process.exit(2);
  }

  return config;
}
