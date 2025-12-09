// @ts-check
/* eslint-disable traceability/valid-story-reference, traceability/valid-annotation-format */
/**
 * Compute vulnerability metrics from result object.
 * @supports prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md REQ-SAFE-ONLY
 * @param {{ count?: number, details?: Array<any> }} result - Vulnerability result object.
 * @param {{ [key: string]: number }} severityWeights - Mapping of severity labels to weight.
 * @returns {{ totalCount: number, detailsList: Array<any>, maxSeverity: string }} Computed metrics.
 */
/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
export function computeVulnerabilityStats(result, severityWeights) {
  const totalCount =
    typeof result.count === 'number' ? result.count : Array.isArray(result.details) ? result.details.length : 0;
  const detailsList = Array.isArray(result.details) ? result.details : [];

  // Create a Map for safe weight lookup
  const weightMap = new Map(Object.entries(severityWeights));

  let highestWeight = 0;
  // @supports prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md REQ-SAFE-ONLY
  for (const vuln of detailsList) {
    const key = (vuln.severity || '').toLowerCase();
    const weight = weightMap.get(key) ?? 0;
    // @supports prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md REQ-SAFE-ONLY
    if (weight > highestWeight) highestWeight = weight;
  }

  // Determine the severity corresponding to the highest weight
  let maxSeverity = 'none';
  // @supports prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md REQ-SAFE-ONLY
  for (const [severity, w] of weightMap.entries()) {
    // @supports prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md REQ-SAFE-ONLY
    if (w === highestWeight) {
      maxSeverity = severity;
      break;
    }
  }

  return { totalCount, detailsList, maxSeverity };
}

/**
 * Count vulnerabilities above a given severity threshold.
 * @supports prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md REQ-SAFE-ONLY
 * @param {Array<any>} detailsList - Array of vulnerability details objects with severity properties.
 * @param {number} minWeight - Minimum weight threshold.
 * @param {{ [key: string]: number }} severityWeights - Mapping of severity labels to weight.
 * @returns {number} Number of vulnerabilities above the threshold.
 */
/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
export function countAboveThreshold(detailsList, minWeight, severityWeights) {
  // Create a Map for safe weight lookup
  const weightMap = new Map(Object.entries(severityWeights));

  let count = 0;
  // @supports prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md REQ-SAFE-ONLY
  for (const v of detailsList) {
    const key = (v.severity || '').toLowerCase();
    const weight = weightMap.get(key) ?? 0;
    // @supports prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md REQ-SAFE-ONLY
    if (weight >= minWeight) count++;
  }

  return count;
}
