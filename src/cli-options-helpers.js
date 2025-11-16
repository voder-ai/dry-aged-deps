// @ts-nocheck
import { generateStringFlagParsers, generateIntegerFlagParsers } from './cli-parser-utils.js';

/** @type {string[]} */
const stringFlags = ['format', 'severity', 'prod-severity', 'dev-severity'];

/** @type {[string, number, number?][]} */
const integerFlagConfigs = [
  ['min-age', 1, 365],
  ['prod-min-age', 1],
  ['dev-min-age', 1],
];

const { parseFormatFlag, parseSeverityFlag, parseProdSeverityFlag, parseDevSeverityFlag } =
  generateStringFlagParsers(stringFlags);

// @ts-ignore
const { parseMinAgeFlag, parseProdMinAgeFlag, parseDevMinAgeFlag } = generateIntegerFlagParsers(integerFlagConfigs);

/**
 * Parse the --format flag.
 * @story prompts/008.0-DEV-JSON-OUTPUT.md
 * @story prompts/009.0-DEV-XML-OUTPUT.md
 * @req REQ-CLI-FLAG-FORMAT - CLI --format must accept 'table', 'json', or 'xml'
 */
export { parseFormatFlag };

/**
 * Parse the --severity flag.
 * @story prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md
 * @req REQ-CLI-FLAG-SEVERITY - CLI --severity must accept valid severity levels
 */
export { parseSeverityFlag };

/**
 * Parse the --prod-severity flag.
 * @story prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md
 * @req REQ-CLI-FLAG-SEVERITY - CLI --prod-severity must accept valid severity levels
 */
export { parseProdSeverityFlag };

/**
 * Parse the --dev-severity flag.
 * @story prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md
 * @req REQ-CLI-FLAG-SEVERITY - CLI --dev-severity must accept valid severity levels
 */
export { parseDevSeverityFlag };

/**
 * Parse the --min-age flag.
 * @story prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md
 * @req REQ-CLI-MIN-AGE-VALIDATION - CLI --min-age must be an integer between 1 and 365
 */
export { parseMinAgeFlag };

/**
 * Parse the --prod-min-age flag.
 * @story prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md
 * @req REQ-CLI-FLAG-PROD-MIN-AGE - CLI --prod-min-age must be an integer >= 1
 */
export { parseProdMinAgeFlag };

/**
 * Parse the --dev-min-age flag.
 * @story prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md
 * @req REQ-CLI-FLAG-DEV-MIN-AGE - CLI --dev-min-age must be an integer >= 1
 */
export { parseDevMinAgeFlag };
