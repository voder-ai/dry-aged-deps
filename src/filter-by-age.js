/**
 * Filter rows by age threshold.
 * @param {Array} rows - Array of [name, current, wanted, latest, age, depType].
 * @param {{ prodMinAge: number, devMinAge: number }} thresholds
 * @returns {Array} Filtered rows where age >= threshold for their dependency type.
 */
export function filterByAge(rows, { prodMinAge, devMinAge }) {
  return rows.filter(([, , , , age, depType]) => {
    const minAge = depType === 'prod' ? prodMinAge : devMinAge;
    return typeof age === 'number' && age >= minAge;
  });
}
