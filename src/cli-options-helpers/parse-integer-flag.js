// @ts-nocheck
import { getFlagRawValue } from './get-flag-raw-value.js';
/**
 * Generic helper to parse integer flags with min/max bounds.
 * @story prompts/014.0-DEV-INVALID-OPTION-ERROR.md
 * @req REQ-INVALID-VALUE-ERROR - Display error message for invalid option values with valid choices
 * @param {string[]} args - CLI arguments.
 * @param {string} flag - Flag name, e.g., 'min-age', 'prod-min-age'.
 * @param {number} defaultValue - Default numeric value.
 * @param {number} [min=1] - Minimum allowed value (inclusive).
 * @param {number} [max=Infinity] - Maximum allowed value (inclusive).
 * @returns {number} Parsed integer flag value.
 */
export function parseIntegerFlag(args, flag, defaultValue, min = 1, max = Infinity) {
  const raw = getFlagRawValue(args, flag);
  let num = defaultValue;
  if (raw !== undefined) {
    if (!/^[0-9]+$/.test(raw)) {
      console.error(`Invalid ${flag}: ${raw}. Must be an integer >= ${min}.`);
      process.exit(2);
    }
    num = parseInt(raw, 10);
    if (num < min || num > max) {
      console.error(`Invalid ${flag}: ${raw}. Must be an integer between ${min} and ${max}.`);
      process.exit(2);
    }
  }
  return num;
}