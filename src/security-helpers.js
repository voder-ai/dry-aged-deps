/**
 * Compute vulnerability metrics from result object.
 * @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
 * @req REQ-SAFE-ONLY - Compute total count, details list, and maximum severity.
 * @param {{ count?: number, details?: Array }} result - Vulnerability result object.
 * @param {{ [key: string]: number }} severityWeights - Mapping of severity labels to weight.
 * @returns {{ totalCount: number, detailsList: Array, maxSeverity: string }} Computed metrics.
 */
export function computeVulnerabilityStats(result, severityWeights) {
  const totalCount =
    typeof result.count === 'number' ? result.count : Array.isArray(result.details) ? result.details.length : 0;
  const detailsList = Array.isArray(result.details) ? result.details : [];

  let highestWeight = 0;
  for (const vuln of detailsList) {
    const key = (vuln.severity || '').toLowerCase();
    // eslint-disable-next-line security/detect-object-injection
    const weight = Object.prototype.hasOwnProperty.call(severityWeights, key)
      ? severityWeights[key]
      : 0;
    if (weight > highestWeight) highestWeight = weight;
  }

  const maxSeverity =
    Object.keys(severityWeights).find((k) => {
      // eslint-disable-next-line security/detect-object-injection
      return severityWeights[k] === highestWeight;
    }) || 'none';
  return { totalCount, detailsList, maxSeverity };
}

/**
 * Count vulnerabilities above a given severity threshold.
 * @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
 * @req REQ-SAFE-ONLY - Count vulnerabilities whose severity weight meets or exceeds the threshold.
 * @param {Array} detailsList - Array of vulnerability details objects with severity properties.
 * @param {number} minWeight - Minimum weight threshold.
 * @param {{ [key: string]: number }} severityWeights - Mapping of severity labels to weight.
 * @returns {number} Number of vulnerabilities above the threshold.
 */
export function countAboveThreshold(detailsList, minWeight, severityWeights) {
  return detailsList.filter((v) => {
    const key = (v.severity || '').toLowerCase();
    // eslint-disable-next-line security/detect-object-injection
    const weight = Object.prototype.hasOwnProperty.call(severityWeights, key)
      ? severityWeights[key]
      : 0;
    return weight >= minWeight;
  }).length;
}