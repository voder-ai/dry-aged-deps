// @ts-nocheck
/**
 * Evaluate vulnerability result for a specific package version.
 * @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
 * @req REQ-SAFE-ONLY - Determine if a given package version is safe based on severity thresholds.
 * @param {string} name - Package name.
 * @param {string} version - Package version to evaluate.
 * @param {function} checkVulnerabilities - Async function(name, version) returning number or details object.
 * @param {string} minSeverity - Minimum allowed severity for this dependency.
 * @param {{ [key: string]: number }} severityWeights - Mapping of severity labels to weight.
 * @returns {Promise<{ safe: boolean, totalCount: number, maxSeverity: string, detailsList: Array }>} Evaluation result.
 */
async function evaluateVersionVulnerabilities(
  name,
  version,
  checkVulnerabilities,
  minSeverity,
  severityWeights
) {
  const minWeight = severityWeights[minSeverity] || 0;
  let safe = true;
  let totalCount = 0;
  let detailsList = [];
  let maxSeverity = 'none';
  try {
    const result = await checkVulnerabilities(name, version);
    if (typeof result === 'number') {
      totalCount = result;
      detailsList = [];
      maxSeverity = totalCount > 0 ? minSeverity : 'none';
      safe = totalCount === 0;
    } else if (result && typeof result === 'object') {
      totalCount =
        typeof result.count === 'number'
          ? result.count
          : Array.isArray(result.details)
          ? result.details.length
          : 0;
      detailsList = Array.isArray(result.details) ? result.details : [];
      let highestWeight = 0;
      for (const vuln of detailsList) {
        const weight = severityWeights[(vuln.severity || '').toLowerCase()] || 0;
        if (weight > highestWeight) highestWeight = weight;
      }
      maxSeverity =
        Object.keys(severityWeights).find((k) => severityWeights[k] === highestWeight) || 'none';
      const aboveThresholdCount = detailsList.filter(
        (v) => (severityWeights[(v.severity || '').toLowerCase()] || 0) >= minWeight
      ).length;
      safe = aboveThresholdCount === 0;
    }
  } catch {
    safe = false;
  }

  return { safe, totalCount, maxSeverity, detailsList };
}

/**
 * Find a safe package version using smart-search fallback.
 * @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
 * @req REQ-SMART-SEARCH - Search newest mature versions backwards to find a safe version.
 * @param {string} name - Package name.
 * @param {{ [version: string]: string|number|Date }} versionTimes - Mapping of versions to publish times.
 * @param {function} checkVulnerabilities - Async vulnerability checker function.
 * @param {string} minSeverity - Minimum allowed severity.
 * @param {function} calculateAgeInDays - Function to calculate age from date.
 * @param {{ [key: string]: number }} severityWeights - Mapping of severity labels to weight.
 * @returns {Promise<{ version: string|null, recAge?: number, totalCount?: number, maxSeverity?: string, detailsList?: Array }>} Safe version info.
 */
async function findSafeVersionSmartSearch(
  name,
  versionTimes,
  checkVulnerabilities,
  minSeverity,
  calculateAgeInDays,
  severityWeights
) {
  const entries = Object.entries(versionTimes);
  entries.sort(([, timeA], [, timeB]) => new Date(timeB) - new Date(timeA));
  for (const [ver, pubTime] of entries) {
    const { safe, totalCount, maxSeverity, detailsList } =
      await evaluateVersionVulnerabilities(name, ver, checkVulnerabilities, minSeverity, severityWeights);
    if (safe) {
      const recAge = calculateAgeInDays(pubTime);
      return { version: ver, recAge, totalCount, maxSeverity, detailsList };
    }
  }
  return { version: null };
}

/**
 * Filter rows by security vulnerabilities with smart-search fallback support.
 * @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
 * @req REQ-SMART-SEARCH - Use smart-search fallback to find safe versions.
 * @req REQ-SAFE-ONLY - Only recommend safe, non-vulnerable versions or indicate when none exist.
 * @param {Array} rows - Array of [name, current, wanted, latest, age, depType].
 * @param {function} checkVulnerabilities - Async function(name, version) returning number or details object.
 * @param {{ prodMinSeverity: string, devMinSeverity: string }} thresholds - Severity thresholds for prod/dev dependencies.
 * @param {string} format - Output format ('table', 'json', 'xml').
 * @param {{ fetchVersionTimes?: function, calculateAgeInDays?: function }} [options] - Optional functions for smart-search fallback.
 * @returns {Promise<{ safeRows: Array, vulnMap: Map<string, { count: number, maxSeverity: string, details: Array }>, filterReasonMap: Map<string, string> }>} Filtered results.
 */
export async function filterBySecurity(
  rows,
  checkVulnerabilities,
  { prodMinSeverity, devMinSeverity },
  format,
  options = {}
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
    const [name, current, wanted, latest, _age, depType] = row;
    const minSeverity = depType === 'prod' ? prodMinSeverity : devMinSeverity;
    const { fetchVersionTimes, calculateAgeInDays } = options;

    // Smart-search fallback
    if (typeof fetchVersionTimes === 'function' && typeof calculateAgeInDays === 'function') {
      try {
        const versionTimes = await fetchVersionTimes(name);
        if (versionTimes && typeof versionTimes === 'object') {
          const safeResult = await findSafeVersionSmartSearch(
            name,
            versionTimes,
            checkVulnerabilities,
            minSeverity,
            calculateAgeInDays,
            severityWeights
          );
          if (safeResult.version) {
            vulnMap.set(name, { count: safeResult.totalCount, maxSeverity: safeResult.maxSeverity, details: safeResult.detailsList });
            safeRows.push([name, current, wanted, safeResult.version, safeResult.recAge, depType]);
          } else {
            filterReasonMap.set(name, 'security');
            vulnMap.set(name, { count: 0, maxSeverity: 'none', details: [] });
          }
          continue;
        }
      } catch (err) {
        if (format !== 'xml' && format !== 'json') {
          console.error(`Warning: failed to fetch version times for ${name}: ${err.message}`);
        }
      }
    }

    // Original one-version logic
    const { safe, totalCount, maxSeverity, detailsList } =
      await evaluateVersionVulnerabilities(name, latest, checkVulnerabilities, depType === 'prod' ? prodMinSeverity : devMinSeverity, severityWeights);
    vulnMap.set(name, { count: totalCount, maxSeverity, details: detailsList });
    if (safe) {
      safeRows.push(row);
    } else {
      filterReasonMap.set(name, 'security');
    }
  }

  return { safeRows, vulnMap, filterReasonMap };
}
