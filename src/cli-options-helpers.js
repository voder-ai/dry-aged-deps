import { createStringFlagParser, createIntegerFlagParser } from './cli-options-helpers/utils-common.js';

/**
 * Parse the --format flag.
 * @story prompts/008.0-DEV-JSON-OUTPUT.md
 * @story prompts/009.0-DEV-XML-OUTPUT.md
 * @req REQ-CLI-FLAG-FORMAT - CLI --format must accept 'table', 'json', or 'xml'
 */
export const parseFormatFlag = createStringFlagParser('format');

/**
 * Parse the --severity flag.
 * @story prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md
 * @req REQ-CLI-FLAG-SEVERITY - CLI --severity must accept valid severity levels
 */
export const parseSeverityFlag = createStringFlagParser('severity');

/**
 * Parse the --prod-severity flag.
 * @story prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md
 * @req REQ-CLI-FLAG-SEVERITY - CLI --prod-severity must accept valid severity levels
 */
export const parseProdSeverityFlag = createStringFlagParser('prod-severity');

/**
 * Parse the --dev-severity flag.
 * @story prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md
 * @req REQ-CLI-FLAG-SEVERITY - CLI --dev-severity must accept valid severity levels
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
 * @story prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md
 * @req REQ-CLI-FLAG-PROD-MIN-AGE - CLI --prod-min-age must be an integer >= 1
 */
export const parseProdMinAgeFlag = createIntegerFlagParser('prod-min-age', 1);

/**
 * Parse the --dev-min-age flag.
 * @story prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md
 * @req REQ-CLI-FLAG-DEV-MIN-AGE - CLI --dev-min-age must be an integer >= 1
 */
export const parseDevMinAgeFlag = createIntegerFlagParser('dev-min-age', 1);
