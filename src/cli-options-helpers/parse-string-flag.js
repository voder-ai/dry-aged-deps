// @ts-check
import { getFlagRawValue } from './get-flag-raw-value.js';
/**
 * Generic helper to parse string flags with optional validation.
 * @param {string[]} args - CLI arguments.
 * @param {string} flag - Flag name, e.g., 'format', 'severity'.
 * @param {string} defaultValue - Default value if flag not provided.
 * @param {string[]} [validValues] - Optional array of valid values.
 * @returns {string} Parsed flag value.
 * @supports prompts/014.0-DEV-INVALID-OPTION-ERROR.md REQ-INVALID-VALUE-ERROR
 */
export function parseStringFlag(args, flag, defaultValue, validValues) {
  const raw = getFlagRawValue(args, flag);
  const value = raw !== undefined ? raw : defaultValue;
  // @supports prompts/014.0-DEV-INVALID-OPTION-ERROR.md REQ-INVALID-VALUE-ERROR
  if (validValues && !validValues.includes(value)) {
    console.error(`Invalid ${flag}: ${value}. Valid values are: ${validValues.join(', ')}`);
    process.exit(2);
  }
  return value;
}
