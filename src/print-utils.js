// @ts-check
/* eslint-disable traceability/valid-story-reference, traceability/valid-req-reference, traceability/valid-annotation-format */
/**
 * Utility functions for print-outdated and output handlers.
 * @module print-utils
 */

/**
 * Create thresholds object for JSON/XML formatting.
 * @supports prompts/008.0-DEV-JSON-OUTPUT.md REQ-COMPLETE-DATA
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-COMPLETE-DATA
 * @param {number} prodMinAge
 * @param {string} prodMinSeverity
 * @param {number} devMinAge
 * @param {string} devMinSeverity
 * @returns {{prod:{minAge:number,minSeverity:string},dev:{minAge:number,minSeverity:string}}}
 */
/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
export function getThresholds(prodMinAge, prodMinSeverity, devMinAge, devMinSeverity) {
  return {
    prod: { minAge: prodMinAge, minSeverity: prodMinSeverity },
    dev: { minAge: devMinAge, minSeverity: devMinSeverity },
  };
}

/**
 * Get current ISO timestamp string.
 * @supports prompts/008.0-DEV-JSON-OUTPUT.md REQ-COMPLETE-DATA
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-COMPLETE-DATA
 * @returns {string} ISO formatted timestamp
 */
export function getTimestamp() {
  return new Date().toISOString();
}
