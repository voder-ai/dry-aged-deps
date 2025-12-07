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
 * @supports prompts/008.0-DEV-JSON-OUTPUT.md REQ-CLI-FLAG
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-CLI-FLAG
 */
export const parseFormatFlag = stringParsers.parseFormatFlag;

/**
 * Parse the --severity flag.
 * @supports prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md REQ-CLI-FLAG
 */
export const parseSeverityFlag = stringParsers.parseSeverityFlag;

/**
 * Parse the --prod-severity flag.
 * @supports prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md REQ-CLI-FLAG
 */
export const parseProdSeverityFlag = stringParsers.parseProdSeverityFlag;

/**
 * Parse the --dev-severity flag.
 * @supports prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md REQ-CLI-FLAG
 */
export const parseDevSeverityFlag = stringParsers.parseDevSeverityFlag;

/**
 * Parse the --min-age flag.
 * @supports prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md REQ-CLI-FLAG
 */
export const parseMinAgeFlag = integerParsers.parseMinAgeFlag;

/**
 * Parse the --prod-min-age flag.
 * @supports prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md REQ-CLI-FLAG
 */
export const parseProdMinAgeFlag = integerParsers.parseProdMinAgeFlag;

/**
 * Parse the --dev-min-age flag.
 * @supports prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md REQ-CLI-FLAG
 */
export const parseDevMinAgeFlag = integerParsers.parseDevMinAgeFlag;
