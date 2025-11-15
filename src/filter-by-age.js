/**
 * Filter rows by age threshold.
 * @story prompts/003.0-DEV-FILTER-MATURE-VERSIONS.md
 * @req REQ-AGE-THRESHOLD - enforce minimum age threshold
 * @req REQ-SMART-SEARCH - search newest first
 * @req REQ-COMPARISON - only versions > current
 * @param {Array<[string, string, string, string, number|string, string]>} rows - Array of [name, current, wanted, latest, age, depType].
 * @param {{ prodMinAge: number, devMinAge: number }} thresholds
 * @returns {Array<[string, string, string, string, number|string, string]>} Filtered rows where age >= threshold for their dependency type.
 */
export function filterByAge(rows, { prodMinAge, devMinAge }) {
  return rows.filter(([, , , , age, depType]) => {
    const minAge = depType === 'prod' ? prodMinAge : devMinAge;
    return typeof age === 'number' && age >= minAge;
  });
}