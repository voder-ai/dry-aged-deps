// @ts-check
import {
  buildXmlDeclaration,
  buildRootStart,
  buildErrorSection,
  buildPackagesSection,
  buildSummarySection,
  buildThresholdsSection,
  buildExcludedSection,
  buildUnfixableSection,
  buildRootEnd,
} from './xml-formatter-utils.js';

/**
 * Format data into XML string
 * @param {Object} params
 * @param {Array<any>} [params.rows]
 * @param {Object} [params.summary]
 * @param {Object} [params.thresholds]
 * @param {string} [params.timestamp]
 * @param {Error} [params.error]
 * @param {Array<{ name: string, reason: string }>} [params.excluded]
 * @param {Array<{ name: string, severity: string, advisory: string, reason: string, via: Array<string> }>} [params.unfixable]
 * @returns {string} XML string
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-XML-SCHEMA REQ-COMPLETE-DATA REQ-SUMMARY-STATS REQ-XML-DECLARATION
 * @supports prompts/015.0-DEV-EXCLUDE-PACKAGES.md REQ-EXCLUDE-OUTPUT
 * @supports prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md REQ-UNFIXABLE-XML REQ-UNFIXABLE-SCHEMA-COMPAT
 */
export function xmlFormatter({
  rows = [],
  summary = {},
  thresholds = {},
  timestamp = '',
  error = null,
  excluded = [],
  unfixable = [],
} = {}) {
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

  // @supports prompts/015.0-DEV-EXCLUDE-PACKAGES.md REQ-EXCLUDE-OUTPUT
  if (excluded.length > 0) {
    xml += buildExcludedSection(excluded);
  }

  // @supports prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md REQ-UNFIXABLE-XML
  if (unfixable.length > 0) {
    xml += buildUnfixableSection(unfixable);
  }

  xml += buildRootEnd();
  return xml;
}
