// @ts-check
/**
 * Configuration loader for CLI options, supports JSON config file.
 * @module config-loader
 */
import fs from 'fs';
import path from 'path';

/**
 * Assert a condition or exit with error.
 * @param {boolean} condition - Condition to assert.
 * @param {string} message - Error message to log on failure.
 * @returns void
 * @supports prompts/014.0-DEV-INVALID-OPTION-ERROR.md REQ-ERROR-EXIT-CODE
 */
function assert(condition, message) {
  // @supports prompts/014.0-DEV-INVALID-OPTION-ERROR.md REQ-ERROR-EXIT-CODE
  if (!condition) {
    console.error(message);
    process.exit(2);
  }
}

/**
 * Ensure a value is a non-null object (not array).
 * @param {*} value - Value to check.
 * @param {string} name - Name used in error messages.
 * @returns void
 * @supports prompts/010.0-DEV-CONFIG-FILE-SUPPORT.md REQ-VALIDATION
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
 * @returns void
 * @supports prompts/010.0-DEV-CONFIG-FILE-SUPPORT.md REQ-VALIDATION
 */
function validateKeys(obj, allowedKeys, context) {
  Object.keys(obj).forEach((key) => {
    assert(allowedKeys.includes(key), `Unknown config key${context}: ${key}`);
  });
}

/**
 * Validate an integer value is within 1-365.
 * @param {number|undefined} value - Value to validate.
 * @param {string} name - Name used in error message.
 * @returns void
 * @supports prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md REQ-VALIDATION
 */
function validateRangeInt(value, name) {
  // @supports prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md REQ-VALIDATION
  if (value === undefined) {
    return;
  }
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
 * @returns void
 * @supports prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md REQ-VALIDATION
 * @supports prompts/008.0-DEV-JSON-OUTPUT.md REQ-VALIDATION
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-VALIDATION
 */
function validateAgainstList(value, validList, name) {
  // @supports prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md REQ-VALIDATION
  if (value === undefined) {
    return;
  }
  assert(
    validList.includes(value),
    `Invalid config value for ${name}: ${value}. Valid values: ${validList.join(', ')}`
  );
}

/**
 * Load and validate configuration from a config file.
 * @param {string} configFileName - Name of the config file (relative to cwd).
 * @param {string|undefined} configFileArg - CLI arg if provided.
 * @param {string[]} validSeverities - List of valid severities.
 * @param {string[]} validFormats - List of valid formats.
 * @returns {object} Parsed config or empty object if none.
 * @supports prompts/010.0-DEV-CONFIG-FILE-SUPPORT.md REQ-CONFIG-LOCATION REQ-VALIDATION
 */
export function loadConfigFile(configFileName, configFileArg, validSeverities, validFormats) {
  const configFilePath = path.resolve(process.cwd(), configFileName);
  let config = /** @type {Record<string, any>} */ ({});

  // @supports prompts/010.0-DEV-CONFIG-FILE-SUPPORT.md REQ-CONFIG-LOCATION
  if (fs.existsSync(configFilePath)) {
    let raw;
    // @supports prompts/010.0-DEV-CONFIG-FILE-SUPPORT.md REQ-VALIDATION
    try {
      raw = fs.readFileSync(configFilePath, 'utf8');
      config = JSON.parse(raw);
    }
    // @supports prompts/010.0-DEV-CONFIG-FILE-SUPPORT.md REQ-VALIDATION
    catch (err) {
      const e = /** @type {any} */ (err);
      console.error(`Invalid JSON in config file ${configFileName}: ${e.message}`);
      process.exit(2);
    }

    ensureObject(config, configFileName);
    validateKeys(config, ['minAge', 'severity', 'prod', 'dev', 'format'], '');

    validateRangeInt(config.minAge, 'minAge');
    validateAgainstList(config.severity, validSeverities, 'severity');
    validateAgainstList(config.format, validFormats, 'format');

    // @supports prompts/007.0-DEV-SEPARATE-PROD-DEV-THRESHOLDS.md REQ-CONFIG-SCHEMA
    if (config.prod !== undefined) {
      ensureObject(config.prod, 'prod');
      validateKeys(config.prod, ['minAge', 'minSeverity'], ' in prod');
      validateRangeInt(config.prod.minAge, 'prod.minAge');
      validateAgainstList(config.prod.minSeverity, validSeverities, 'prod.minSeverity');
    }

    // @supports prompts/007.0-DEV-SEPARATE-PROD-DEV-THRESHOLDS.md REQ-CONFIG-SCHEMA
    if (config.dev !== undefined) {
      ensureObject(config.dev, 'dev');
      validateKeys(config.dev, ['minAge', 'minSeverity'], ' in dev');
      validateRangeInt(config.dev.minAge, 'dev.minAge');
      validateAgainstList(config.dev.minSeverity, validSeverities, 'dev.minSeverity');
    }
  }
  // @supports prompts/010.0-DEV-CONFIG-FILE-SUPPORT.md REQ-CONFIG-LOCATION
  else if (configFileArg) {
    console.error(`Configuration file not found: ${configFileName}`);
    process.exit(2);
  }

  return config;
}
