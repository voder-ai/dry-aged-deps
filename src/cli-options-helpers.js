// @ts-nocheck
import { generateStringFlagParsers, generateIntegerFlagParsers } from './cli-parser-utils.js';

// Generate string-based flag parsers
const { parseFormatFlag, parseSeverityFlag, parseProdSeverityFlag, parseDevSeverityFlag } = generateStringFlagParsers([
  'format',
  'severity',
  'prod-severity',
  'dev-severity',
]);

/**
 * Parse the --format flag.
 */
export { parseFormatFlag };

/**
 * Parse the --severity flag.
 */
export { parseSeverityFlag };

/**
 * Parse the --prod-severity flag.
 */
export { parseProdSeverityFlag };

/**
 * Parse the --dev-severity flag.
 */
export { parseDevSeverityFlag };

// Generate integer-based flag parsers
const { parseMinAgeFlag, parseProdMinAgeFlag, parseDevMinAgeFlag } = generateIntegerFlagParsers([
  ['min-age', 1, 365],
  ['prod-min-age', 1],
  ['dev-min-age', 1],
]);

/**
 * Parse the --min-age flag.
 * @story prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md
 * @req REQ-CLI-MIN-AGE-VALIDATION - CLI --min-age must be an integer between 1 and 365
 */
export { parseMinAgeFlag };

/**
 * Parse the --prod-min-age flag.
 */
export { parseProdMinAgeFlag };

/**
 * Parse the --dev-min-age flag.
 */
export { parseDevMinAgeFlag };
