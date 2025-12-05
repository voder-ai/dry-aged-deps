// @ts-check
import { generateStringFlagParsers, generateIntegerFlagParsers } from './cli-parser-utils.js';

const stringParsers = generateStringFlagParsers(['format', 'severity', 'prod-severity', 'dev-severity']);
const integerParsers = generateIntegerFlagParsers([
  ['min-age', 1, 365],
  ['prod-min-age', 1],
  ['dev-min-age', 1],
]);

/**
 * Parse the --format flag.
 * @story prompts/008.0-DEV-JSON-OUTPUT.md
 * @story prompts/009.0-DEV-XML-OUTPUT.md
 * @req REQ-CLI-FLAG
 */
export const parseFormatFlag = stringParsers.parseFormatFlag;

/**
 * Parse the --severity flag.
 * @story prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md
 * @req REQ-CLI-FLAG
 */
export const parseSeverityFlag = stringParsers.parseSeverityFlag;

/**
 * Parse the --prod-severity flag.
 * @story prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md
 * @req REQ-CLI-FLAG
 */
export const parseProdSeverityFlag = stringParsers.parseProdSeverityFlag;

/**
 * Parse the --dev-severity flag.
 * @story prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md
 * @req REQ-CLI-FLAG
 */
export const parseDevSeverityFlag = stringParsers.parseDevSeverityFlag;

/**
 * Parse the --min-age flag.
 * @story prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md
 * @req REQ-CLI-FLAG
 */
export const parseMinAgeFlag = integerParsers.parseMinAgeFlag;

/**
 * Parse the --prod-min-age flag.
 * @story prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md
 * @req REQ-CLI-FLAG
 */
export const parseProdMinAgeFlag = integerParsers.parseProdMinAgeFlag;

/**
 * Parse the --dev-min-age flag.
 * @story prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md
 * @req REQ-CLI-FLAG
 */
export const parseDevMinAgeFlag = integerParsers.parseDevMinAgeFlag;
