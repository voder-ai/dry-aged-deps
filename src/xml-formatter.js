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
  buildOverridesHygieneSection,
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
 * @param {Array<{ name: string, pinned: string|null, latest: string|null, ageDays: number|null, reason: string, advisories: Array<{ id: string, severity: string, patchedRange: string|null }>, safeUpgrade: string|null }>} [params.overridesHygiene]
 * @returns {string} XML string
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-XML-SCHEMA REQ-COMPLETE-DATA REQ-SUMMARY-STATS REQ-XML-DECLARATION
 * @supports prompts/015.0-DEV-EXCLUDE-PACKAGES.md REQ-EXCLUDE-OUTPUT
 * @supports prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md REQ-UNFIXABLE-XML REQ-UNFIXABLE-SCHEMA-COMPAT
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-XML REQ-OVERRIDES-SCHEMA-COMPAT
 */
export function xmlFormatter({
  rows = [],
  summary = {},
  thresholds = {},
  timestamp = '',
  error = null,
  excluded = [],
  unfixable = [],
  overridesHygiene = [],
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

  xml += appendOptionalSections({ thresholds, excluded, unfixable, overridesHygiene });
  xml += buildRootEnd();
  return xml;
}

/**
 * Append the four optional XML sections (thresholds, excluded, unfixable,
 * overridesHygiene) via a single iteration so the top-level formatter stays
 * within the project's complexity cap as new additive surfaces are added.
 * @param {{ thresholds?: Object, excluded?: Array<any>, unfixable?: Array<any>, overridesHygiene?: Array<any> }} params
 * @returns {string}
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-XML-SCHEMA
 * @supports prompts/015.0-DEV-EXCLUDE-PACKAGES.md REQ-EXCLUDE-OUTPUT
 * @supports prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md REQ-UNFIXABLE-XML
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-XML
 */
function appendOptionalSections({ thresholds, excluded = [], unfixable = [], overridesHygiene = [] }) {
  // @ts-ignore - thresholds shape validated by caller
  const hasThresholds = Boolean(thresholds && (thresholds.prod || thresholds.dev));
  return [
    hasThresholds ? buildThresholdsSection(thresholds) : '',
    excluded.length > 0 ? buildExcludedSection(excluded) : '',
    unfixable.length > 0 ? buildUnfixableSection(unfixable) : '',
    overridesHygiene.length > 0 ? buildOverridesHygieneSection(overridesHygiene) : '',
  ].join('');
}
