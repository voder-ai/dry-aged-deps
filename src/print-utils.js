/* eslint-disable traceability/valid-req-reference , traceability/valid-annotation-format , traceability/valid-annotation-format */
// @ts-check
/**
 * Utility functions for print-outdated and output handlers.
 * @module print-utils
 */

/**
 * Create thresholds object for JSON/XML formatting.
 * @story docs/decisions/0002-json-xml-output-support.md
 * @req REQ-THRESHOLD-ABSTRACTION - Consolidate threshold object creation
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
 * @story docs/decisions/0002-json-xml-output-support.md
 * @req REQ-TIMESTAMP-ADDED - Include timestamp in output
 * @returns {string} ISO formatted timestamp
 */
export function getTimestamp() {
  return new Date().toISOString();
}
