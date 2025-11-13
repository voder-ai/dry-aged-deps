/**
 * Parse the --format flag.
 *
 * @param {string[]} args - CLI arguments.
 * @param {string} defaultFormat - Default format value.
 * @param {string[]} validFormats - Allowed format values.
 * @returns {string} The selected format.
 */
export function parseFormatFlag(args, defaultFormat, validFormats) {
  let format = defaultFormat;
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
  return format;
}

/**
 * Parse the --min-age flag.
 *
 * @param {string[]} args - CLI arguments.
 * @param {number} defaultMinAge - Default minAge value.
 * @returns {number} The parsed minAge.
 */
export function parseMinAgeFlag(args, defaultMinAge) {
  let minAge = defaultMinAge;
  const eq = args.find((a) => a.startsWith('--min-age='));
  if (eq) {
    const v = eq.split('=')[1];
    if (!/^[0-9]+$/.test(v)) {
      console.error(`Invalid min-age: ${v}. Must be an integer >= 1.`);
      process.exit(2);
    }
    minAge = parseInt(v, 10);
    if (minAge < 1) {
      console.error(`Invalid min-age: ${v}. Must be an integer >= 1.`);
      process.exit(2);
    }
  } else {
    const idx = args.indexOf('--min-age');
    if (idx !== -1) {
      if (args.length > idx + 1) {
        const v = args[idx + 1];
        if (!/^[0-9]+$/.test(v)) {
          console.error(`Invalid min-age: ${v}. Must be an integer >= 1.`);
          process.exit(2);
        }
        minAge = parseInt(v, 10);
        if (minAge < 1) {
          console.error(`Invalid min-age: ${v}. Must be an integer >= 1.`);
          process.exit(2);
        }
      } else {
        console.error('Missing value for --min-age');
        process.exit(2);
      }
    }
  }
  return minAge;
}

/**
 * Parse the --severity flag.
 *
 * @param {string[]} args - CLI arguments.
 * @param {string} defaultSeverity - Default severity value.
 * @param {string[]} validSeverities - Allowed severity values.
 * @returns {string} The parsed severity.
 */
export function parseSeverityFlag(args, defaultSeverity, validSeverities) {
  let severity = defaultSeverity;
  const eq = args.find((a) => a.startsWith('--severity='));
  if (eq) {
    const v = eq.split('=')[1];
    if (!validSeverities.includes(v)) {
      console.error(
        `Invalid severity: ${v}. Valid values are: ${validSeverities.join(', ')}`
      );
      process.exit(2);
    }
    severity = v;
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
        severity = v;
      } else {
        console.error('Missing value for --severity');
        process.exit(2);
      }
    }
  }
  return severity;
}

/**
 * Parse the --prod-min-age flag.
 *
 * @param {string[]} args - CLI arguments.
 * @param {number} defaultProdMinAge - Default prodMinAge value.
 * @returns {number} The parsed prodMinAge.
 */
export function parseProdMinAgeFlag(args, defaultProdMinAge) {
  let prodMinAge = defaultProdMinAge;
  const eq = args.find((a) => a.startsWith('--prod-min-age='));
  if (eq) {
    const v = eq.split('=')[1];
    if (!/^[0-9]+$/.test(v)) {
      console.error(`Invalid prod-min-age: ${v}. Must be an integer >= 1.`);
      process.exit(2);
    }
    prodMinAge = parseInt(v, 10);
    if (prodMinAge < 1) {
      console.error(`Invalid prod-min-age: ${v}. Must be an integer >= 1.`);
      process.exit(2);
    }
  } else {
    const idx = args.indexOf('--prod-min-age');
    if (idx !== -1) {
      if (args.length > idx + 1) {
        const v = args[idx + 1];
        if (!/^[0-9]+$/.test(v)) {
          console.error(`Invalid prod-min-age: ${v}. Must be an integer >= 1.`);
          process.exit(2);
        }
        prodMinAge = parseInt(v, 10);
        if (prodMinAge < 1) {
          console.error(`Invalid prod-min-age: ${v}. Must be an integer >= 1.`);
          process.exit(2);
        }
      } else {
        console.error('Missing value for --prod-min-age');
        process.exit(2);
      }
    }
  }
  return prodMinAge;
}

/**
 * Parse the --dev-min-age flag.
 *
 * @param {string[]} args - CLI arguments.
 * @param {number} defaultDevMinAge - Default devMinAge value.
 * @returns {number} The parsed devMinAge.
 */
export function parseDevMinAgeFlag(args, defaultDevMinAge) {
  let devMinAge = defaultDevMinAge;
  const eq = args.find((a) => a.startsWith('--dev-min-age='));
  if (eq) {
    const v = eq.split('=')[1];
    if (!/^[0-9]+$/.test(v)) {
      console.error(`Invalid dev-min-age: ${v}. Must be an integer >= 1.`);
      process.exit(2);
    }
    devMinAge = parseInt(v, 10);
    if (devMinAge < 1) {
      console.error(`Invalid dev-min-age: ${v}. Must be an integer >= 1.`);
      process.exit(2);
    }
  } else {
    const idx = args.indexOf('--dev-min-age');
    if (idx !== -1) {
      if (args.length > idx + 1) {
        const v = args[idx + 1];
        if (!/^[0-9]+$/.test(v)) {
          console.error(`Invalid dev-min-age: ${v}. Must be an integer >= 1.`);
          process.exit(2);
        }
        devMinAge = parseInt(v, 10);
        if (devMinAge < 1) {
          console.error(`Invalid dev-min-age: ${v}. Must be an integer >= 1.`);
          process.exit(2);
        }
      } else {
        console.error('Missing value for --dev-min-age');
        process.exit(2);
      }
    }
  }
  return devMinAge;
}

/**
 * Parse the --prod-severity flag.
 *
 * @param {string[]} args - CLI arguments.
 * @param {string} defaultProdMinSeverity - Default prodMinSeverity value.
 * @param {string[]} validSeverities - Allowed severity values.
 * @returns {string} The parsed prodMinSeverity.
 */
export function parseProdSeverityFlag(
  args,
  defaultProdMinSeverity,
  validSeverities
) {
  let prodMinSeverity = defaultProdMinSeverity;
  const eq = args.find((a) => a.startsWith('--prod-severity='));
  if (eq) {
    const v = eq.split('=')[1];
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
  return prodMinSeverity;
}

/**
 * Parse the --dev-severity flag.
 *
 * @param {string[]} args - CLI arguments.
 * @param {string} defaultDevMinSeverity - Default devMinSeverity value.
 * @param {string[]} validSeverities - Allowed severity values.
 * @returns {string} The parsed devMinSeverity.
 */
export function parseDevSeverityFlag(
  args,
  defaultDevMinSeverity,
  validSeverities
) {
  let devMinSeverity = defaultDevMinSeverity;
  const eq = args.find((a) => a.startsWith('--dev-severity='));
  if (eq) {
    const v = eq.split('=')[1];
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
  return devMinSeverity;
}
