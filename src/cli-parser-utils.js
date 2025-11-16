// @ts-nocheck
import { createStringFlagParser, createIntegerFlagParser } from './cli-options-helpers/utils-common.js';

/**
 * Generate named string flag parsers.
 * @param {string[]} flags - List of flag names to generate parsers for.
 * @returns {Object.<string, Function>} Mapping from parser export name to parser functions.
 */
export function generateStringFlagParsers(flags) {
  const parsers = {};
  for (const flagName of flags) {
    const camel = flagName
      .split('-')
      .map((part, idx) => (idx === 0 ? part : part[0].toUpperCase() + part.slice(1)))
      .join('');
    const cap = camel.charAt(0).toUpperCase() + camel.slice(1);
    const exportName = `parse${cap}Flag`;
    parsers[exportName] = createStringFlagParser(flagName);
  }
  return parsers;
}

/**
 * Generate named integer flag parsers.
 * @param {Array.<[string, number, number?]>} configs - Array of [flagName, min, max] definitions.
 * @returns {Object.<string, Function>} Mapping from parser export name to parser functions.
 */
export function generateIntegerFlagParsers(configs) {
  const parsers = {};
  for (const config of configs) {
    const [flagName, min, max] = config;
    const camel = flagName
      .split('-')
      .map((part, idx) => (idx === 0 ? part : part[0].toUpperCase() + part.slice(1)))
      .join('');
    const cap = camel.charAt(0).toUpperCase() + camel.slice(1);
    const exportName = `parse${cap}Flag`;
    if (max !== undefined) {
      parsers[exportName] = createIntegerFlagParser(flagName, min, max);
    } else {
      parsers[exportName] = createIntegerFlagParser(flagName, min);
    }
  }
  return parsers;
}
