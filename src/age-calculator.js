/**
 * Calculate the age in days since the publish date.
 * @param {string} publishDate - The publish date string (ISO format).
 * @returns {number} Number of days since publishDate.
 * @story prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md
 * @req REQ-AGE-CALC - Calculate `currentDate - publishDate` in days
 */
export function calculateAgeInDays(publishDate) {
  const publishTime = new Date(publishDate).getTime();
  const now = Date.now();
  const diffMs = now - publishTime;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return days;
}
