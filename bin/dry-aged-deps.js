#!/usr/bin/env node
/* eslint-disable security/detect-non-literal-fs-filename */

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { execFileSync } from 'child_process';
import { printOutdated } from '../src/print-outdated.js';
import { xmlFormatter } from '../src/xml-formatter.js';

/**
 * dry-aged-deps CLI
 * Lists outdated npm dependencies and shows how long they have been outdated.
 */
async function main() {
  // Resolve __dirname for ESM
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // CLI arguments
  const args = process.argv.slice(2);
  const checkMode = args.includes('--check');
  const updateMode = args.includes('--update');
  const skipConfirmation = args.includes('--yes') || args.includes('-y');

  // Valid option values for config and flag validation
  const validSeverities = ['none', 'low', 'moderate', 'high', 'critical'];
  const validFormats = ['table', 'json', 'xml'];

  // Config file support (Story: prompts/010.0-DEV-CONFIG-FILE-SUPPORT.md)
  const configFileArg = args.find((a) => a.startsWith('--config-file='));
  const configFileName = configFileArg
    ? configFileArg.split('=')[1]
    : '.dry-aged-deps.json';
  const configFilePath = path.resolve(process.cwd(), configFileName);
  let config = {};
  if (fs.existsSync(configFilePath)) {
    try {
      const rawConfig = fs.readFileSync(configFilePath, 'utf8');
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

  let format = config.format !== undefined ? config.format : 'table';
  let minAge = config.minAge !== undefined ? config.minAge : 7;
  let minSeverity = config.severity !== undefined ? config.severity : 'none';
  let prodMinAge =
    config.prod && config.prod.minAge !== undefined
      ? config.prod.minAge
      : minAge;
  let devMinAge =
    config.dev && config.dev.minAge !== undefined ? config.dev.minAge : minAge;
  let prodMinSeverity =
    config.prod && config.prod.minSeverity !== undefined
      ? config.prod.minSeverity
      : minSeverity;
  let devMinSeverity =
    config.dev && config.dev.minSeverity !== undefined
      ? config.dev.minSeverity
      : minSeverity;

  // Help flag
  if (args.includes('-h') || args.includes('--help')) {
    console.log('Usage: dry-aged-deps [options]');
    console.log('');
    console.log('Options:');
    console.log('  -h, --help             Show help');
    console.log('  -v, --version          Show version');
    console.log(
      '  --format=<format>      Output format: table (default), json, xml'
    );
    console.log(
      '  --min-age=<days>       Minimum age in days (1-365) for including versions (default: 7)'
    );
    console.log(
      '  --prod-min-age=<days>  Minimum age for production dependencies (falls back to --min-age)'
    );
    console.log(
      '  --dev-min-age=<days>   Minimum age for development dependencies (falls back to --min-age)'
    );
    console.log(
      '  --severity=<level>     Vulnerability severity threshold: none, low, moderate, high, critical (default: none)'
    );
    console.log(
      '  --prod-severity=<lvl>  Severity threshold for production dependencies (falls back to --severity)'
    );
    console.log(
      '  --dev-severity=<lvl>   Severity threshold for development dependencies (falls back to --severity)'
    );
    console.log(
      '  --check                 Check mode: exit code 1 if safe updates available, 0 if none, 2 on error'
    );
    console.log(
      '  --update               Update dependencies to latest safe versions'
    );
    console.log(
      '  -y, --yes               Skip confirmation prompts (assume yes)'
    );
    console.log(
      '  --config-file=<file>    Path to JSON config file (default: .dry-aged-deps.json). CLI flags override config file values'
    );
    process.exit(0);
  }

  // Version flag
  if (args.includes('-v') || args.includes('--version')) {
    const pkgPath = path.join(__dirname, '..', 'package.json');
    const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    console.log(pkgJson.version);
    process.exit(0);
  }

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

  // propagate global minAge to prod and dev if not overridden by CLI or config
  const hasProdMinAgeFlag = args.some((a) => a.startsWith('--prod-min-age'));
  const hasDevMinAgeFlag = args.some((a) => a.startsWith('--dev-min-age'));
  if (
    !hasProdMinAgeFlag &&
    !(config.prod && config.prod.minAge !== undefined)
  ) {
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
        `Invalid severity: ${v}. Valid values are: ${validSeverities.join(', ')}`
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
            `Invalid severity: ${v}. Valid values are: ${validSeverities.join(', ')}`
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

  // propagate global severity to prod and dev if not overridden by CLI or config
  const hasProdSeverityFlag = args.some((a) => a.startsWith('--prod-severity'));
  const hasDevSeverityFlag = args.some((a) => a.startsWith('--dev-severity'));
  if (
    !hasProdSeverityFlag &&
    !(config.prod && config.prod.minSeverity !== undefined)
  ) {
    prodMinSeverity = minSeverity;
  }
  if (
    !hasDevSeverityFlag &&
    !(config.dev && config.dev.minSeverity !== undefined)
  ) {
    devMinSeverity = minSeverity;
  }

  // Parse --prod-min-age flag (falls back to minAge)
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

  // Parse --dev-min-age flag (falls back to minAge)
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

  // Parse --prod-severity flag (falls back to minSeverity)
  const prodSevEq = args.find((a) => a.startsWith('--prod-severity='));
  if (prodSevEq) {
    const v = prodSevEq.split('=')[1];
    if (!validSeverities.includes(v)) {
      console.error(
        `Invalid prod-severity: ${v}. Valid values are: ${validSeverities.join(', ')}`
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
            `Invalid prod-severity: ${v}. Valid values are: ${validSeverities.join(', ')}`
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

  // Parse --dev-severity flag (falls back to minSeverity)
  const devSevEq = args.find((a) => a.startsWith('--dev-severity='));
  if (devSevEq) {
    const v = devSevEq.split('=')[1];
    if (!validSeverities.includes(v)) {
      console.error(
        `Invalid dev-severity: ${v}. Valid values are: ${validSeverities.join(', ')}`
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
            `Invalid dev-severity: ${v}. Valid values are: ${validSeverities.join(', ')}`
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

  // Load data
  let data;
  let fetchVersionTimesOverride;
  let checkVulnerabilitiesOverride;
  if (process.env.DRY_AGED_DEPS_MOCK === '1') {
    // Load mock module for testing
    const mockPath = pathToFileURL(
      path.resolve(__dirname, '../test/helpers/cli.outdated.mock.js')
    ).href;
    const mock = await import(mockPath);
    data = mock.outdatedData;
    fetchVersionTimesOverride = mock.fetchVersionTimes;
    checkVulnerabilitiesOverride = mock.checkVulnerabilities;
  } else if (format === 'json') {
    // Skip running npm outdated in JSON mode
    data = {};
  } else {
    // Run npm outdated in non-JSON modes
    let outputStr;
    try {
      outputStr = execFileSync('npm', ['outdated', '--json'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
    } catch (err) {
      if (err.stdout) {
        outputStr = err.stdout.toString();
      } else {
        if (format === 'xml') {
          const timestamp = new Date().toISOString();
          console.log(xmlFormatter({ timestamp, error: err }));
          process.exit(2);
        } else if (format === 'json') {
          const ts = new Date().toISOString();
          console.log(
            JSON.stringify(
              {
                timestamp: ts,
                error: {
                  message: err.message,
                  code: err.code || '',
                  details: err.details || '',
                  story: 'prompts/008.0-DEV-JSON-OUTPUT.md',
                },
              },
              null,
              2
            )
          );
          process.exit(2);
        }
        console.error('Error running npm outdated:', err.message);
        process.exit(1);
      }
    }
    // Parse JSON output
    try {
      data = outputStr ? JSON.parse(outputStr) : {};
    } catch (parseErr) {
      if (format === 'xml') {
        const timestamp = new Date().toISOString();
        console.log(xmlFormatter({ timestamp, error: parseErr }));
        process.exit(2);
      } else if (format === 'json') {
        const ts = new Date().toISOString();
        console.log(
          JSON.stringify(
            {
              timestamp: ts,
              error: {
                message: parseErr.message,
                code: parseErr.code || '',
                details: parseErr.details || '',
                story: 'prompts/008.0-DEV-JSON-OUTPUT.md',
              },
            },
            null,
            2
          )
        );
        process.exit(2);
      }
      console.error('Failed to parse npm outdated output:', parseErr.message);
      process.exit(1);
    }
  }

  // Print results
  try {
    const summary = await printOutdated(data, {
      format,
      fetchVersionTimes: fetchVersionTimesOverride,
      checkVulnerabilities: checkVulnerabilitiesOverride,
      prodMinAge,
      devMinAge,
      prodMinSeverity,
      devMinSeverity,
      updateMode,
      skipConfirmation,
      returnSummary: checkMode,
    });
    if (checkMode) {
      if (summary.safeUpdates > 0) process.exit(1);
      else process.exit(0);
    }
    process.exit(0);
  } catch (err) {
    if (format === 'xml') {
      const timestamp = new Date().toISOString();
      console.log(xmlFormatter({ timestamp, error: err }));
      process.exit(2);
    } else if (format === 'json') {
      const ts = new Date().toISOString();
      console.log(
        JSON.stringify(
          {
            timestamp: ts,
            error: {
              message: err.message,
              code: err.code || '',
              details: err.details || '',
              story: 'prompts/008.0-DEV-JSON-OUTPUT.md',
            },
          },
          null,
          2
        )
      );
      process.exit(2);
    }
    console.error(err.message);
    process.exit(2);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});