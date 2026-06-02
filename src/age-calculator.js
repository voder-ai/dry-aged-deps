// @ts-check
/**
 * Calculate the age in days since the publish date.
 * @param {string} publishDate - The publish date string (ISO format).
 * @param {number} [now=Date.now()] - Reference time in epoch milliseconds (injectable for testing).
 * @returns {number} Number of days since publishDate.
 * @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-AGE-CALC
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-AGE
 */
export function calculateAgeInDays(publishDate, now = Date.now()) {
  const publishTime = new Date(publishDate).getTime();
  const diffMs = now - publishTime;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return days;
}
