// @ts-check
/* eslint-disable traceability/valid-story-reference, traceability/valid-annotation-format */
import {
  buildXmlDeclaration,
  buildRootStart,
  buildErrorSection,
  buildPackagesSection,
  buildSummarySection,
  buildThresholdsSection,
  buildRootEnd,
} from './xml-formatter-utils.js';

/**
 * Format data into XML string
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-XML-SCHEMA REQ-COMPLETE-DATA REQ-SUMMARY-STATS REQ-XML-DECLARATION
 * @param {Object} params
 * @param {Array<any>} [params.rows]
 * @param {Object} [params.summary]
 * @param {Object} [params.thresholds]
 * @param {string} [params.timestamp]
 * @param {Error} [params.error]
 * @returns {string} XML string
 */
/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
export function xmlFormatter({ rows = [], summary = {}, thresholds = {}, timestamp = '', error = null } = {}) {
  let xml = buildXmlDeclaration();
  xml += buildRootStart(timestamp);

  // @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-ERROR-FORMAT
  if (error) {
    xml += buildErrorSection(error);
    xml += buildRootEnd();
    return xml;
  }

  xml += buildPackagesSection(rows);
  xml += buildSummarySection(summary);

  // @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-XML-SCHEMA
  // @ts-ignore - thresholds shape validated by caller
  if (thresholds && (thresholds.prod || thresholds.dev)) {
    xml += buildThresholdsSection(thresholds);
  }

  xml += buildRootEnd();
  return xml;
}
