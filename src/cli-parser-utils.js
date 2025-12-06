// @ts-check
import { createStringFlagParser, createIntegerFlagParser } from './cli-options-helpers/utils-common.js';

/**
 * Derive the parser function export name from a flag name.
 * @supports prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md REQ-CLI-FLAG
 * @supports prompts/007.0-DEV-SEPARATE-PROD-DEV-THRESHOLDS.md REQ-CLI-FLAGS
 * @supports prompts/008.0-DEV-JSON-OUTPUT.md REQ-CLI-FLAG
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-CLI-FLAG
 * @param {string} flagName - Flag name without hyphens.
 * @returns {string} Parser export name, e.g., 'parseMinAgeFlag'.
 */
function deriveParserName(flagName) {
  const camel = flagName
    .split('-')
    .map((part, idx) => (idx === 0 ? part : part[0].toUpperCase() + part.slice(1)))
    .join('');
  const cap = camel.charAt(0).toUpperCase() + camel.slice(1);
  return `parse${cap}Flag`;
}

/**
 * Generate named string flag parsers.
 * @supports prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md REQ-CLI-FLAG
 * @supports prompts/007.0-DEV-SEPARATE-PROD-DEV-THRESHOLDS.md REQ-CLI-FLAGS
 * @supports prompts/008.0-DEV-JSON-OUTPUT.md REQ-CLI-FLAG
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-CLI-FLAG
 * @param {string[]} flags - List of flag names to generate parsers for.
 * @returns {Object.<string, Function>} Mapping from parser export name to parser functions.
 */
export function generateStringFlagParsers(flags) {
  const parsers = new Map();
  // @story prompts/008.0-DEV-JSON-OUTPUT.md
  // @req REQ-CLI-FLAG
  for (const flagName of flags) {
    const exportName = deriveParserName(flagName);
    const parserFn = createStringFlagParser(flagName);
    parsers.set(exportName, parserFn);
  }
  return Object.fromEntries(parsers);
}

/**
 * Generate named integer flag parsers.
 * @supports prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md REQ-CLI-FLAG
 * @supports prompts/007.0-DEV-SEPARATE-PROD-DEV-THRESHOLDS.md REQ-CLI-FLAGS
 * @param {Array.<[string, number, number?]>} configs - Array of [flagName, min, max] definitions.
 * @returns {{ [parserName: string]: (args: string[], defaultValue: number) => number }} Mapping from parser export name to parser functions.
 */
export function generateIntegerFlagParsers(configs) {
  const parsers = new Map();
  // @story prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md
  // @req REQ-CLI-FLAG
  for (const [flagName, min, max] of configs) {
    const exportName = deriveParserName(flagName);
    const parserFn =
      max !== undefined ? createIntegerFlagParser(flagName, min, max) : createIntegerFlagParser(flagName, min);
    parsers.set(exportName, parserFn);
  }
  return Object.fromEntries(parsers);
}
