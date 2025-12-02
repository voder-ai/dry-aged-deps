/* eslint-disable traceability/valid-req-reference , traceability/valid-annotation-format , traceability/valid-annotation-format */
// @ts-check
// Utility factories for CLI option parsers

import { parseStringFlag } from './parse-string-flag.js';
import { parseIntegerFlag } from './parse-integer-flag.js';

/**
 * Factory for string flag parsers.
 * @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
 * @req REQ-CLI-PARSE-STR
 * @param {string} flag - Flag name without leading hyphens.
 * @returns {(args: string[], defaultValue: string, validValues?: string[]) => string}
 */
export function createStringFlagParser(flag) {
  return (args, defaultValue, validValues) => parseStringFlag(args, flag, defaultValue, validValues);
}

/**
 * Factory for integer flag parsers.
 * @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
 * @req REQ-CLI-PARSE-INT
 * @param {string} flag - Flag name without leading hyphens.
 * @param {number} [min=1] - Minimum allowed value.
 * @param {number} [max=Infinity] - Maximum allowed value.
 * @returns {(args: string[], defaultValue: number) => number}
 */
export function createIntegerFlagParser(flag, min = 1, max = Infinity) {
  return (args, defaultValue) => parseIntegerFlag(args, flag, defaultValue, min, max);
}
