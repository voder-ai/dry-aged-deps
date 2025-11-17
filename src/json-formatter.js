// Story: prompts/008.0-DEV-JSON-OUTPUT.md
// json-formatter.js
// Formats outdated dependencies and summary data into JSON
// See prompts/008.0-DEV-JSON-OUTPUT.md for full JSON output spec

/**
 * Format outdated dependencies data into JSON string.
 * @story prompts/008.0-DEV-JSON-OUTPUT.md
 * @req REQ-JSON-SCHEMA - Define consistent JSON output schema
 * @req REQ-COMPLETE-DATA - Include all package information in output
 * @req REQ-SUMMARY-STATS - Include filtering statistics (packages checked, filtered by age, filtered by security)
 */

/**
 * Format data into JSON string
 * Supports legacy array rows and full JSON mode object rows
 * @param {{ rows: Array<Array<any> | Object>, summary: { totalOutdated: number, safeUpdates: number, filteredByAge: number, filteredBySecurity: number }, thresholds?: { prod: { minAge: number, minSeverity: string }, dev: { minAge: number, minSeverity: string } }, timestamp: string }} params
 * @returns {string} JSON string
 */
export function jsonFormatter({ rows, summary, thresholds, timestamp }) {
  const packages = rows.map((row) => {
    if (Array.isArray(row)) {
      const [name, current, wanted, latest, age] = row;
      return { name, current, wanted, latest, age };
    } else {
      const {
        name,
        dependencyType: type,
        current,
        wanted,
        latest,
        recommended,
        age,
        vulnerabilities,
        filtered,
        filterReason,
      } = row;
      return {
        name,
        type,
        current,
        wanted,
        latest,
        recommended,
        age,
        vulnerabilities,
        filtered,
        filterReason,
      };
    }
  });

  const output = {
    timestamp,
    packages,
    summary: {
      totalOutdated: summary.totalOutdated,
      safeUpdates: summary.safeUpdates,
      filteredByAge: summary.filteredByAge,
      filteredBySecurity: summary.filteredBySecurity,
    },
  };

  if (thresholds) {
    output.summary.thresholds = thresholds;
  }

  return JSON.stringify(output, null, 2);
}