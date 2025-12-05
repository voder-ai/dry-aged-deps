// @ts-check
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
 * @story prompts/009.0-DEV-XML-OUTPUT.md
 * @req REQ-XML-SCHEMA
 * @req REQ-COMPLETE-DATA
 * @req REQ-SUMMARY-STATS
 * @req REQ-XML-DECLARATION
 * @param {Object} params
 * @param {Array<any>} [params.rows]
 * @param {Object} [params.summary]
 * @param {Object} [params.thresholds]
 * @param {string} [params.timestamp]
 * @param {Error} [params.error]
 * @returns {string} XML string
 */
export function xmlFormatter({ rows = [], summary = {}, thresholds = {}, timestamp = '', error = null } = {}) {
  let xml = buildXmlDeclaration();
  xml += buildRootStart(timestamp);

  if (error) {
    xml += buildErrorSection(error);
    xml += buildRootEnd();
    return xml;
  }

  xml += buildPackagesSection(rows);
  xml += buildSummarySection(summary);

  if (thresholds && (thresholds.prod || thresholds.dev)) {
    xml += buildThresholdsSection(thresholds);
  }

  xml += buildRootEnd();
  return xml;
}
