/* eslint-disable traceability/valid-req-reference , traceability/valid-annotation-format , traceability/valid-annotation-format */
// @ts-check
import { filterByAge } from './filter-by-age.js';
import { filterBySecurity } from './filter-by-security.js';

/**
 * Apply age and security filters to rows.
 * @story prompts/003.0-DEV-IDENTIFY-OUTDATED.md
 * @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
 * @story prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md
 * @req REQ-AGE-THRESHOLD - enforce minimum age threshold
 * @req REQ-AUDIT-CHECK - check vulnerabilities using audit API
 * @param {Array<[string, string, string, string, number|string, string]>} rows - Array of [name, current, wanted, latest, age, depType].
 * @param {{ prodMinAge: number, devMinAge: number, prodMinSeverity: string, devMinSeverity: string, checkVulnerabilities: Function, format: string }} options
 * @returns {Promise<{ safeRows: Array<[string, string, string, string, number|string, string]>, matureRows: Array<[string, string, string, string, number|string, string]>, vulnMap: Map<string, {count: number, maxSeverity: string, details: Array<any>}>, filterReasonMap: Map<string, string>, summary: { totalOutdated: number, safeUpdates: number, filteredByAge: number, filteredBySecurity: number } }>} Filtered results and summary.
 */
export async function applyFilters(rows, options) {
  const { prodMinAge, devMinAge, prodMinSeverity, devMinSeverity, checkVulnerabilities, format } = options;
  const totalOutdated = rows.length;
  const matureRows = filterByAge(rows, { prodMinAge, devMinAge });
  const { safeRows, vulnMap, filterReasonMap } = await filterBySecurity(
    matureRows,
    checkVulnerabilities,
    { prodMinSeverity, devMinSeverity },
    format
  );
  const filteredByAge = totalOutdated - matureRows.length;
  const filteredBySecurity = matureRows.length - safeRows.length;
  const summary = {
    totalOutdated,
    safeUpdates: safeRows.length,
    filteredByAge,
    filteredBySecurity,
  };
  return { safeRows, matureRows, vulnMap, filterReasonMap, summary };
}
