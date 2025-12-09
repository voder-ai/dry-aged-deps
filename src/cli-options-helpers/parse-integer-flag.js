// @ts-check
/* eslint-disable traceability/valid-story-reference, traceability/valid-annotation-format, traceability/require-story-annotation, traceability/require-req-annotation */
import { getFlagRawValue } from './get-flag-raw-value.js';
/**
 * Generic helper to parse integer flags with min/max bounds.
 * @supports prompts/014.0-DEV-INVALID-OPTION-ERROR.md REQ-INVALID-VALUE-ERROR
 * @param {string[]} args - CLI arguments.
 * @param {string} flag - Flag name, e.g., 'min-age', 'prod-min-age'.
 * @param {number} defaultValue - Default numeric value.
 * @param {number} [min=1] - Minimum allowed value (inclusive).
 * @param {number} [max=Infinity] - Maximum allowed value (inclusive).
 * @returns {number} Parsed integer flag value.
 */
/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
export function parseIntegerFlag(args, flag, defaultValue, min = 1, max = Infinity) {
  const raw = getFlagRawValue(args, flag);
  let num = defaultValue;
  // @supports prompts/014.0-DEV-INVALID-OPTION-ERROR.md REQ-INVALID-VALUE-ERROR
  if (raw !== undefined) {
    // @supports prompts/014.0-DEV-INVALID-OPTION-ERROR.md REQ-INVALID-VALUE-ERROR
    if (!/^[0-9]+$/.test(raw)) {
      console.error(`Invalid ${flag}: ${raw}. Must be an integer >= ${min}.`);
      process.exit(2);
    }
    num = parseInt(raw, 10);
    // @supports prompts/014.0-DEV-INVALID-OPTION-ERROR.md REQ-INVALID-VALUE-ERROR
    if (num < min || num > max) {
      console.error(`Invalid ${flag}: ${raw}. Must be an integer between ${min} and ${max}.`);
      process.exit(2);
    }
  }
  return num;
}
