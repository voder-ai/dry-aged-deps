import fs from 'fs';
import path from 'path';

/* eslint-disable security/detect-non-literal-fs-filename */

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
 * @param {string[]} argv - CLI arguments (excluding node and script path).
 * @returns {CliOptions} Parsed CLI options.
 */
export function parseOptions(argv) {
  const args = argv;
  const checkMode = args.includes('--check');
  const updateMode = args.includes('--update');
  const skipConfirmation = args.includes('--yes') || args.includes('-y');

  // Allowed values for severity and format
  const validSeverities = ['none', 'low', 'moderate', 'high', 'critical'];
  const validFormats = ['table', 'json', 'xml'];

  // Config file support
  const configFileArg = args.find((a) => a.startsWith('--config-file='));
  const configFileName = configFileArg
    ? configFileArg.split('=')[1]
    : '.dry-aged-deps.json';
  const configFilePath = path.resolve(process.cwd(), configFileName);
  let config = {};
  if (fs.existsSync(configFilePath)) {
    // Load and parse JSON config
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
    // Validate top-level config shape
    if (typeof config !== 'object' || config === null || Array.isArray(config)) {
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
    // Validate config values
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
          `Invalid config value for severity: ${config.severity}. Valid values: ${validSeverities.join(
            ', '
          )}`
        );
        process.exit(2);
      }
    }
    if (config.format !== undefined) {
      if (!validFormats.includes(config.format)) {
        console.error(
          `Invalid config value for format: ${config.format}. Valid values: ${validFormats.join(
            ', '
          )}`
        );
        process.exit(2);
      }
    }
    if (config.prod !== undefined) {
      if (typeof config.prod !== 'object' || config.prod === null || Array.isArray(config.prod)) {
        console.error(`Invalid config value for prod: must be an object`);
        process.exit(2);
      }
      for (const key of Object.keys(config.prod)) {
        if (!['minAge', 'minSeverity'].includes(key)) {
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
            `Invalid config value for prod.minSeverity: ${config.prod.minSeverity}. Valid values: ${validSeverities.join(
              ', '
            )}`
          );
          process.exit(2);
        }
      }
    }
    if (config.dev !== undefined) {
      if (typeof config.dev !== 'object' || config.dev === null || Array.isArray(config.dev)) {
        console.error(`Invalid config value for dev: must be an object`);
        process.exit(2);
      }
      for (const key of Object.keys(config.dev)) {
        if (!['minAge', 'minSeverity'].includes(key)) {
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
            `Invalid config value for dev.minSeverity: ${config.dev.minSeverity}. Valid values: ${validSeverities.join(
              ', '
            )}`
          );
          process.exit(2);
        }
      }
    }
  } else if (configFileArg) {
    console.error(`Configuration file not found: ${configFileName}`);
    process.exit(2);
  }

  // Default values from config or hardcoded defaults
  let format = config.format !== undefined ? config.format : 'table';
  let minAge = config.minAge !== undefined ? config.minAge : 7;
  let minSeverity = config.severity !== undefined ? config.severity : 'none';
  let prodMinAge =
    config.prod && config.prod.minAge !== undefined
      ? config.prod.minAge
      : minAge;
  let devMinAge =
    config.dev && config.dev.minAge !== undefined
      ? config.dev.minAge
      : minAge;
  let prodMinSeverity =
    config.prod && config.prod.minSeverity !== undefined
      ? config.prod.minSeverity
      : minSeverity;
  let devMinSeverity =
    config.dev && config.dev.minSeverity !== undefined
      ? config.dev.minSeverity
      : minSeverity;

  // Parse --format flag
  const fmtEq = args.find((a) => a.startsWith('--format='));
  if (fmtEq) {
    format = fmtEq.split('=')[1];
  } else {
    const idx = args.indexOf('--format');
    if (idx !== -1 && args.length > idx + 1) {
      format = args[idx + 1];
    }
  }
  if (!validFormats.includes(format)) {
    console.error(
      `Invalid format: ${format}. Valid values are: ${validFormats.join(', ')}`
    );
    process.exit(2);
  }

  // Parse --min-age flag
  const minAgeEq = args.find((a) => a.startsWith('--min-age='));
  if (minAgeEq) {
    const v = minAgeEq.split('=')[1];
    if (!/^[0-9]+$/.test(v)) {
      console.error(
        `Invalid min-age: ${v}. Must be an integer between 1 and 365.`
      );
      process.exit(2);
    }
    minAge = parseInt(v, 10);
    if (minAge < 1 || minAge > 365) {
      console.error(
        `Invalid min-age: ${v}. Must be an integer between 1 and 365.`
      );
      process.exit(2);
    }
  } else {
    const idx = args.indexOf('--min-age');
    if (idx !== -1) {
      if (args.length > idx + 1) {
        const v = args[idx + 1];
        if (!/^[0-9]+$/.test(v)) {
          console.error(
            `Invalid min-age: ${v}. Must be an integer between 1 and 365.`
          );
          process.exit(2);
        }
        minAge = parseInt(v, 10);
        if (minAge < 1 || minAge > 365) {
          console.error(
            `Invalid min-age: ${v}. Must be an integer between 1 and 365.`
          );
          process.exit(2);
        }
      } else {
        console.error('Missing value for --min-age');
        process.exit(2);
      }
    }
  }

  // Propagate global minAge to prod and dev if not overridden
  const hasProdMinAgeFlag = args.some((a) => a.startsWith('--prod-min-age'));
  const hasDevMinAgeFlag = args.some((a) => a.startsWith('--dev-min-age'));
  if (!hasProdMinAgeFlag && !(config.prod && config.prod.minAge !== undefined)) {
    prodMinAge = minAge;
  }
  if (!hasDevMinAgeFlag && !(config.dev && config.dev.minAge !== undefined)) {
    devMinAge = minAge;
  }

  // Parse --severity flag
  const sevEq = args.find((a) => a.startsWith('--severity='));
  if (sevEq) {
    const v = sevEq.split('=')[1];
    if (!validSeverities.includes(v)) {
      console.error(
        `Invalid severity: ${v}. Valid values are: ${validSeverities.join(
          ', '
        )}`
      );
      process.exit(2);
    }
    minSeverity = v;
  } else {
    const idx = args.indexOf('--severity');
    if (idx !== -1) {
      if (args.length > idx + 1) {
        const v = args[idx + 1];
        if (!validSeverities.includes(v)) {
          console.error(
            `Invalid severity: ${v}. Valid values are: ${validSeverities.join(
              ', '
            )}`
          );
          process.exit(2);
        }
        minSeverity = v;
      } else {
        console.error('Missing value for --severity');
        process.exit(2);
      }
    }
  }

  // Propagate global severity to prod and dev if not overridden
  const hasProdSeverityFlag = args.some((a) => a.startsWith('--prod-severity'));
  const hasDevSeverityFlag = args.some((a) => a.startsWith('--dev-severity'));
  if (!hasProdSeverityFlag && !(config.prod && config.prod.minSeverity !== undefined)) {
    prodMinSeverity = minSeverity;
  }
  if (!hasDevSeverityFlag && !(config.dev && config.dev.minSeverity !== undefined)) {
    devMinSeverity = minSeverity;
  }

  // Parse --prod-min-age flag
  const prodMinAgeEq = args.find((a) => a.startsWith('--prod-min-age='));
  if (prodMinAgeEq) {
    const v = prodMinAgeEq.split('=')[1];
    if (!/^[0-9]+$/.test(v)) {
      console.error(
        `Invalid prod-min-age: ${v}. Must be an integer between 1 and 365.`
      );
      process.exit(2);
    }
    prodMinAge = parseInt(v, 10);
    if (prodMinAge < 1 || prodMinAge > 365) {
      console.error(
        `Invalid prod-min-age: ${v}. Must be an integer between 1 and 365.`
      );
      process.exit(2);
    }
  } else {
    const idx = args.indexOf('--prod-min-age');
    if (idx !== -1) {
      if (args.length > idx + 1) {
        const v = args[idx + 1];
        if (!/^[0-9]+$/.test(v)) {
          console.error(
            `Invalid prod-min-age: ${v}. Must be an integer between 1 and 365.`
          );
          process.exit(2);
        }
        prodMinAge = parseInt(v, 10);
        if (prodMinAge < 1 || prodMinAge > 365) {
          console.error(
            `Invalid prod-min-age: ${v}. Must be an integer between 1 and 365.`
          );
          process.exit(2);
        }
      } else {
        console.error('Missing value for --prod-min-age');
        process.exit(2);
      }
    }
  }

  // Parse --dev-min-age flag
  const devMinAgeEq = args.find((a) => a.startsWith('--dev-min-age='));
  if (devMinAgeEq) {
    const v = devMinAgeEq.split('=')[1];
    if (!/^[0-9]+$/.test(v)) {
      console.error(
        `Invalid dev-min-age: ${v}. Must be an integer between 1 and 365.`
      );
      process.exit(2);
    }
    devMinAge = parseInt(v, 10);
    if (devMinAge < 1 || devMinAge > 365) {
      console.error(
        `Invalid dev-min-age: ${v}. Must be an integer between 1 and 365.`
      );
      process.exit(2);
    }
  } else {
    const idx = args.indexOf('--dev-min-age');
    if (idx !== -1) {
      if (args.length > idx + 1) {
        const v = args[idx + 1];
        if (!/^[0-9]+$/.test(v)) {
          console.error(
            `Invalid dev-min-age: ${v}. Must be an integer between 1 and 365.`
          );
          process.exit(2);
        }
        devMinAge = parseInt(v, 10);
        if (devMinAge < 1 || devMinAge > 365) {
          console.error(
            `Invalid dev-min-age: ${v}. Must be an integer between 1 and 365.`
          );
          process.exit(2);
        }
      } else {
        console.error('Missing value for --dev-min-age');
        process.exit(2);
      }
    }
  }

  // Parse --prod-severity flag
  const prodSevEq = args.find((a) => a.startsWith('--prod-severity='));
  if (prodSevEq) {
    const v = prodSevEq.split('=')[1];
    if (!validSeverities.includes(v)) {
      console.error(
        `Invalid prod-severity: ${v}. Valid values are: ${validSeverities.join(
          ', '
        )}`
      );
      process.exit(2);
    }
    prodMinSeverity = v;
  } else {
    const idx = args.indexOf('--prod-severity');
    if (idx !== -1) {
      if (args.length > idx + 1) {
        const v = args[idx + 1];
        if (!validSeverities.includes(v)) {
          console.error(
            `Invalid prod-severity: ${v}. Valid values are: ${validSeverities.join(
              ', '
            )}`
          );
          process.exit(2);
        }
        prodMinSeverity = v;
      } else {
        console.error('Missing value for --prod-severity');
        process.exit(2);
      }
    }
  }

  // Parse --dev-severity flag
  const devSevEq = args.find((a) => a.startsWith('--dev-severity='));
  if (devSevEq) {
    const v = devSevEq.split('=')[1];
    if (!validSeverities.includes(v)) {
      console.error(
        `Invalid dev-severity: ${v}. Valid values are: ${validSeverities.join(
          ', '
        )}`
      );
      process.exit(2);
    }
    devMinSeverity = v;
  } else {
    const idx = args.indexOf('--dev-severity');
    if (idx !== -1) {
      if (args.length > idx + 1) {
        const v = args[idx + 1];
        if (!validSeverities.includes(v)) {
          console.error(
            `Invalid dev-severity: ${v}. Valid values are: ${validSeverities.join(
              ', '
            )}`
          );
          process.exit(2);
        }
        devMinSeverity = v;
      } else {
        console.error('Missing value for --dev-severity');
        process.exit(2);
      }
    }
  }

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