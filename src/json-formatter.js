// json-formatter.js
// Formats outdated dependencies and summary data into JSON

/**
 * Format data into JSON string
 * @param {{ rows: Array<Array<any>>, summary: { totalOutdated: number, safeUpdates: number, filteredByAge: number, filteredBySecurity: number, minAge: number }, timestamp: string }} params
 * @returns {string} JSON string
 */
export function jsonFormatter({ rows, summary, timestamp }) {
  const packages = rows.map(([name, current, wanted, latest, age]) => ({
    name,
    current,
    wanted,
    latest,
    age,
  }));
  const output = {
    timestamp,
    packages,
    summary: {
      totalOutdated: summary.totalOutdated,
      safeUpdates: summary.safeUpdates,
      filteredByAge: summary.filteredByAge,
      filteredBySecurity: summary.filteredBySecurity,
      minAge: summary.minAge,
    },
  };
  return JSON.stringify(output, null, 2);
}
