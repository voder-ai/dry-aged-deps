// @ts-check
/**
 * Utility functions for print-outdated and output handlers.
 * @module print-utils
 */

/**
 * Create thresholds object for JSON/XML formatting.
 * @story prompts/008.0-DEV-JSON-OUTPUT.md
 * @story prompts/009.0-DEV-XML-OUTPUT.md
 * @req REQ-COMPLETE-DATA
 * @param {number} prodMinAge
 * @param {string} prodMinSeverity
 * @param {number} devMinAge
 * @param {string} devMinSeverity
 * @returns {{prod:{minAge:number,minSeverity:string},dev:{minAge:number,minSeverity:string}}}
 */
export function getThresholds(prodMinAge, prodMinSeverity, devMinAge, devMinSeverity) {
  return {
    prod: { minAge: prodMinAge, minSeverity: prodMinSeverity },
    dev: { minAge: devMinAge, minSeverity: devMinSeverity },
  };
}

/**
 * Get current ISO timestamp string.
 * @story prompts/008.0-DEV-JSON-OUTPUT.md
 * @story prompts/009.0-DEV-XML-OUTPUT.md
 * @req REQ-COMPLETE-DATA
 * @returns {string} ISO formatted timestamp
 */
export function getTimestamp() {
  return new Date().toISOString();
}
