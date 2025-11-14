// @ts-nocheck
import { parseStringFlag } from './cli-options-helpers/parse-string-flag.js';
import { parseIntegerFlag } from './cli-options-helpers/parse-integer-flag.js';

/**
 * Factory for string flag parsers.
 * @param {string} flag - Flag name without leading hyphens.
 * @returns {(args: string[], defaultValue: string, validValues?: string[]) => string}
 */
function createStringFlagParser(flag) {
  return (args, defaultValue, validValues) => parseStringFlag(args, flag, defaultValue, validValues);
}

/**
 * Factory for integer flag parsers.
 * @param {string} flag - Flag name without leading hyphens.
 * @param {number} [min=1] - Minimum allowed value.
 * @param {number} [max=Infinity] - Maximum allowed value.
 * @returns {(args: string[], defaultValue: number) => number}
 */
function createIntegerFlagParser(flag, min = 1, max = Infinity) {
  return (args, defaultValue) => parseIntegerFlag(args, flag, defaultValue, min, max);
}

/**
 * Parse the --format flag.
 */
export const parseFormatFlag = createStringFlagParser('format');

/**
 * Parse the --severity flag.
 */
export const parseSeverityFlag = createStringFlagParser('severity');

/**
 * Parse the --prod-severity flag.
 */
export const parseProdSeverityFlag = createStringFlagParser('prod-severity');

/**
 * Parse the --dev-severity flag.
 */
export const parseDevSeverityFlag = createStringFlagParser('dev-severity');

/**
 * Parse the --min-age flag.
 * @story prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md
 * @req REQ-CLI-MIN-AGE-VALIDATION - CLI --min-age must be an integer between 1 and 365
 */
export const parseMinAgeFlag = createIntegerFlagParser('min-age', 1, 365);

/**
 * Parse the --prod-min-age flag.
 */
export const parseProdMinAgeFlag = createIntegerFlagParser('prod-min-age', 1);

/**
 * Parse the --dev-min-age flag.
 */
export const parseDevMinAgeFlag = createIntegerFlagParser('dev-min-age', 1);
