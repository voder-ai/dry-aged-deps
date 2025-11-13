// @ts-nocheck - TODO: Fix type annotations incrementally
import fs from 'fs';
import path from 'path';

/**
 * Load and validate configuration from a config file.
 *
 * @param {string} configFileName - Name of the config file to load (relative to cwd).
 * @param {string|undefined} configFileArg - The raw CLI argument for config file (if provided).
 * @param {string[]} validSeverities - List of valid severity values.
 * @param {string[]} validFormats - List of valid format values.
 * @returns {object} The parsed config object (empty if no config file found).
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
    let rawConfig;
    try {
      rawConfig = fs.readFileSync(configFilePath, 'utf8');
      config = JSON.parse(rawConfig);
    } catch (err) {
      console.error(
        `Invalid JSON in config file ${configFileName}: ${err.message}`
      );
      process.exit(2);
    }

    if (
      typeof config !== 'object' ||
      config === null ||
      Array.isArray(config)
    ) {
      console.error(
        `Invalid config format in ${configFileName}: must be a JSON object`
      );
      process.exit(2);
    }

    const allowedTopKeys = ['minAge', 'severity', 'prod', 'dev', 'format'];
    for (const key of Object.keys(config)) {
      if (!allowedTopKeys.includes(key)) {
        console.error(`Unknown config key: ${key} in ${configFileName}`);
        process.exit(2);
      }
    }

    if (config.minAge !== undefined) {
      if (
        !Number.isInteger(config.minAge) ||
        config.minAge < 1 ||
        config.minAge > 365
      ) {
        console.error(
          `Invalid config value for minAge: ${config.minAge}. Must be integer 1-365`
        );
        process.exit(2);
      }
    }

    if (config.severity !== undefined) {
      if (!validSeverities.includes(config.severity)) {
        console.error(
          `Invalid config value for severity: ${config.severity}. Valid values: ${validSeverities.join(', ')}`
        );
        process.exit(2);
      }
    }

    if (config.format !== undefined) {
      if (!validFormats.includes(config.format)) {
        console.error(
          `Invalid config value for format: ${config.format}. Valid values: ${validFormats.join(', ')}`
        );
        process.exit(2);
      }
    }

    if (config.prod !== undefined) {
      if (
        typeof config.prod !== 'object' ||
        config.prod === null ||
        Array.isArray(config.prod)
      ) {
        console.error(`Invalid config value for prod: must be an object`);
        process.exit(2);
      }

      const allowedProdKeys = ['minAge', 'minSeverity'];
      for (const key of Object.keys(config.prod)) {
        if (!allowedProdKeys.includes(key)) {
          console.error(`Unknown config key in prod: ${key}`);
          process.exit(2);
        }
      }

      if (config.prod.minAge !== undefined) {
        if (
          !Number.isInteger(config.prod.minAge) ||
          config.prod.minAge < 1 ||
          config.prod.minAge > 365
        ) {
          console.error(
            `Invalid config value for prod.minAge: ${config.prod.minAge}. Must be integer 1-365`
          );
          process.exit(2);
        }
      }

      if (config.prod.minSeverity !== undefined) {
        if (!validSeverities.includes(config.prod.minSeverity)) {
          console.error(
            `Invalid config value for prod.minSeverity: ${config.prod.minSeverity}. Valid values: ${validSeverities.join(', ')}`
          );
          process.exit(2);
        }
      }
    }

    if (config.dev !== undefined) {
      if (
        typeof config.dev !== 'object' ||
        config.dev === null ||
        Array.isArray(config.dev)
      ) {
        console.error(`Invalid config value for dev: must be an object`);
        process.exit(2);
      }

      const allowedDevKeys = ['minAge', 'minSeverity'];
      for (const key of Object.keys(config.dev)) {
        if (!allowedDevKeys.includes(key)) {
          console.error(`Unknown config key in dev: ${key}`);
          process.exit(2);
        }
      }

      if (config.dev.minAge !== undefined) {
        if (
          !Number.isInteger(config.dev.minAge) ||
          config.dev.minAge < 1 ||
          config.dev.minAge > 365
        ) {
          console.error(
            `Invalid config value for dev.minAge: ${config.dev.minAge}. Must be integer 1-365`
          );
          process.exit(2);
        }
      }

      if (config.dev.minSeverity !== undefined) {
        if (!validSeverities.includes(config.dev.minSeverity)) {
          console.error(
            `Invalid config value for dev.minSeverity: ${config.dev.minSeverity}. Valid values: ${validSeverities.join(', ')}`
          );
          process.exit(2);
        }
      }
    }
  } else if (configFileArg) {
    console.error(`Configuration file not found: ${configFileName}`);
    process.exit(2);
  }

  return config;
}
