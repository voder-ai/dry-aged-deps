/* eslint-disable security/detect-object-injection -- computed property names safe */
import { createStringFlagParser, createIntegerFlagParser } from './cli-options-helpers/utils-common.js';

/**
 * Derive the parser function export name from a flag name.
 * @story prompts/007.0-DEV-SEPARATE-PROD-DEV-THRESHOLDS.md
 * @story prompts/008.0-DEV-JSON-OUTPUT.md
 * @story prompts/009.0-DEV-XML-OUTPUT.md
 * @story prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md
 * @req REQ-CLI-PARSER-NAME-GENERATION - Central generic logic for flag parser name derivation
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
 * @story prompts/008.0-DEV-JSON-OUTPUT.md
 * @story prompts/009.0-DEV-XML-OUTPUT.md
 * @story prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md
 * @story prompts/007.0-DEV-SEPARATE-PROD-DEV-THRESHOLDS.md
 * @req REQ-CLI-FLAG-PARSER - Generic string flag parsing logic for CLI.
 * @param {string[]} flags - List of flag names to generate parsers for.
 * @returns {Object.<string, Function>} Mapping from parser export name to parser functions.
 */
export function generateStringFlagParsers(flags) {
  /** @type {Object.<string, Function>} */
  const parsers = {};
  for (const flagName of flags) {
    const exportName = deriveParserName(flagName);
    parsers[exportName] = createStringFlagParser(flagName);
  }
  return parsers;
}

/**
 * Generate named integer flag parsers.
 * @story prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md
 * @story prompts/007.0-DEV-SEPARATE-PROD-DEV-THRESHOLDS.md
 * @req REQ-CLI-INTEGER-FLAG-PARSER - Generic integer flag parsing logic for CLI.
 * @param {Array.<[string, number, number?]>} configs - Array of [flagName, min, max] definitions.
 * @returns {{ [parserName: string]: (args: string[], defaultValue: number) => number }} Mapping from parser export name to parser functions.
 */
export function generateIntegerFlagParsers(configs) {
  /** @type {{ [parserName: string]: (args: string[], defaultValue: number) => number }} */
  const parsers = {};
  for (const config of configs) {
    const [flagName, min, max] = config;
    const exportName = deriveParserName(flagName);
    if (max !== undefined) {
      parsers[exportName] = createIntegerFlagParser(flagName, min, max);
    } else {
      parsers[exportName] = createIntegerFlagParser(flagName, min);
    }
  }
  return parsers;
}
