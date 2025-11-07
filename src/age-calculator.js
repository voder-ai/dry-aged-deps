
/**
 * Calculate the age in days since the publish date.
 * @param {string} publishDate - The publish date string (ISO format).
 * @returns {number} Number of days since publishDate.
 */
export function calculateAgeInDays(publishDate) {
  const publishTime = new Date(publishDate).getTime();
  const now = Date.now();
  const diffMs = now - publishTime;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return days;
}