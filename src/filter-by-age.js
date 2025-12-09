// @ts-check
/* eslint-disable traceability/valid-story-reference, traceability/valid-req-reference, traceability/valid-annotation-format */
/**
 * Filter rows by age threshold.
 * @supports prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md REQ-CLI-FLAG
 * @param {Array<[string, string, string, string, number|string, string]>} rows - Array of [name, current, wanted, latest, age, depType].
 * @param {{ prodMinAge: number, devMinAge: number }} thresholds
 * @returns {Array<[string, string, string, string, number|string, string]>} Filtered rows where age >= threshold for their dependency type.
 */
/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
export function filterByAge(rows, { prodMinAge, devMinAge }) {
  return rows.filter(([, , , , age, depType]) => {
    const minAge = depType === 'prod' ? prodMinAge : devMinAge;
    return typeof age === 'number' && age >= minAge;
  });
}
