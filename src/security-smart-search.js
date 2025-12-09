// @ts-check
/* eslint-disable traceability/valid-story-reference, traceability/valid-annotation-format, traceability/require-story-annotation, traceability/require-req-annotation */
import { evaluateVersionVulnerabilities } from './vulnerability-evaluator.js';
/**
 * Find the safest/most recent version using smart-search fallback logic.
 * @supports prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md REQ-SMART-SEARCH
 * @param {string} name - Package name.
 * @param {{ [version: string]: string }} versionTimes - Mapping of version to publish time.
 * @param {object} options - Search options.
 * @param {any} options.checkVulnerabilities - Async vulnerability checker function.
 * @param {string} options.minSeverity - Minimum allowed severity.
 * @param {function} options.calculateAgeInDays - Function to calculate age from date.
 * @param {{ [key: string]: number }} options.severityWeights - Mapping of severity labels to weight.
 * @returns {Promise<{ version: string|null, recAge?: number, totalCount?: number, maxSeverity?: string, detailsList?: Array<any> }>} Safe version info.
 */
/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
export async function findSafeVersionSmartSearch(name, versionTimes, options) {
  const { checkVulnerabilities, minSeverity, calculateAgeInDays, severityWeights } = options;
  const entries = Object.entries(versionTimes);
  entries.sort(([, timeA], [, timeB]) => new Date(timeB).getTime() - new Date(timeA).getTime());
  // @supports prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md REQ-SMART-SEARCH
  for (const [ver, pubTime] of entries) {
    const { safe, totalCount, maxSeverity, detailsList } = await evaluateVersionVulnerabilities(
      name,
      ver,
      /** @type {any} */ (checkVulnerabilities),
      minSeverity,
      severityWeights
    );
    // @supports prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md REQ-SMART-SEARCH
    if (safe) {
      const recAge = calculateAgeInDays(pubTime);
      return { version: ver, recAge, totalCount, maxSeverity, detailsList };
    }
  }
  return { version: null };
}
