// @ts-nocheck
/**
 * Filter rows by security vulnerabilities.
 * @param {Array} rows - Array of [name, current, wanted, latest, age, depType].
 * @param {function} checkVulnerabilities - Async function(name, version) returning either a number of vulnerabilities (legacy) or an object with { count: number, details: Array<{ id: string, title: string, severity: string, cvssScore: number, url: string }> }.
 * @param {{ prodMinSeverity: string, devMinSeverity: string }} thresholds - Severity thresholds for prod/dev dependencies.
 * @param {string} format - Output format ('table', 'json', 'xml').
 * @returns {Promise<{ safeRows: Array, vulnMap: Map<string, { count: number, maxSeverity: string, details: Array }>, filterReasonMap: Map<string, string> }>} Returns safe rows, a map of vulnerability info, and filter reasons.
 */
export async function filterBySecurity(
  rows,
  checkVulnerabilities,
  { prodMinSeverity, devMinSeverity },
  format
) {
  const severityWeights = {
    none: 0,
    low: 1,
    moderate: 2,
    high: 3,
    critical: 4,
  };
  const safeRows = [];
  const vulnMap = new Map();
  const filterReasonMap = new Map();

  for (const row of rows) {
    const [name, , , latest, , depType] = row;
    const minSeverity = depType === 'prod' ? prodMinSeverity : devMinSeverity;
    const minWeight = severityWeights[minSeverity] || 0;
    let include = true;
    let totalCount = 0;
    let details = [];
    let maxSeverity = 'none';

    try {
      const result = await checkVulnerabilities(name, latest);
      if (typeof result === 'number') {
        totalCount = result;
        details = [];
        maxSeverity = totalCount > 0 ? minSeverity : 'none';
        if (totalCount > 0) {
          include = false;
          filterReasonMap.set(name, 'security');
        }
      } else if (result && typeof result === 'object') {
        totalCount =
          typeof result.count === 'number'
            ? result.count
            : Array.isArray(result.details)
              ? result.details.length
              : 0;
        details = Array.isArray(result.details) ? result.details : [];
        let highestWeight = 0;
        for (const vuln of details) {
          const sevKey = (vuln.severity || '').toLowerCase();
          const weight = severityWeights[sevKey] || 0;
          if (weight > highestWeight) {
            highestWeight = weight;
          }
        }
        maxSeverity =
          Object.keys(severityWeights).find(
            (key) => severityWeights[key] === highestWeight
          ) || 'none';
        const countAboveThreshold = details.filter((vuln) => {
          const weight =
            severityWeights[(vuln.severity || '').toLowerCase()] || 0;
          return weight >= minWeight;
        }).length;
        if (countAboveThreshold > 0) {
          include = false;
          filterReasonMap.set(name, 'security');
        }
      }
    } catch (err) {
      if (format !== 'xml' && format !== 'json') {
        console.error(
          `Warning: failed to check vulnerabilities for ${name}@${latest}: ${err.message}`
        );
      }
      // treat as safe on error
    }

    vulnMap.set(name, { count: totalCount, maxSeverity, details });
    if (include) {
      safeRows.push(row);
    }
  }

  return { safeRows, vulnMap, filterReasonMap };
}
