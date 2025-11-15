// @ts-nocheck
import { createStringFlagParser, createIntegerFlagParser } from './cli-options-helpers/utils-common.js';

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
