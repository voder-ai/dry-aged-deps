// @ts-nocheck
/**
 * Filter rows by security vulnerabilities with smart-search fallback support.
 * @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
 * @req REQ-SMART-SEARCH - Check newest mature version first and work backwards to find a safe version
 * @req REQ-SAFE-ONLY - Only recommend safe, non-vulnerable versions or indicate when none exist
 * @param {Array} rows - Array of [name, current, wanted, latest, age, depType].
 * @param {function} checkVulnerabilities - Async function(name, version) returning either a number of vulnerabilities (legacy) or an object with { count: number, details: Array<{ id: string, title: string, severity: string, cvssScore: number, url: string }> }.
 * @param {{ prodMinSeverity: string, devMinSeverity: string }} thresholds - Severity thresholds for prod/dev dependencies.
 * @param {string} format - Output format ('table', 'json', 'xml').
 * @param {{ fetchVersionTimes?: function, calculateAgeInDays?: function }} [options] - Optional functions for smart-search fallback.
 * @returns {Promise<{ safeRows: Array, vulnMap: Map<string, { count: number, maxSeverity: string, details: Array }>, filterReasonMap: Map<string, string> }>} Returns safe rows, a map of vulnerability info, and filter reasons.
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
    const [name, current, wanted, latest, age, depType] = row;
    const minSeverity = depType === 'prod' ? prodMinSeverity : devMinSeverity;
    const minWeight = severityWeights[minSeverity] || 0;
    const { fetchVersionTimes, calculateAgeInDays } = options;
    let fallbackUsed = false;

    // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
    // @req REQ-SMART-SEARCH - Check newest mature version first and work backwards to find safe version
    if (typeof fetchVersionTimes === 'function' && typeof calculateAgeInDays === 'function') {
      try {
        const versionTimes = await fetchVersionTimes(name);
        if (versionTimes && typeof versionTimes === 'object') {
          const versionEntries = Object.entries(versionTimes);
          // Sort by publish time descending
          versionEntries.sort(([, timeA], [, timeB]) => new Date(timeB) - new Date(timeA));
          let foundSafe = false;
          for (const [ver, pubTime] of versionEntries) {
            let totalCount = 0;
            let detailsList = [];
            let maxSeverityLevel = 'none';
            let safe = true;
            let result;
            try {
              result = await checkVulnerabilities(name, ver);
            } catch {
              safe = false;
              continue;
            }
            if (typeof result === 'number') {
              totalCount = result;
              detailsList = [];
              maxSeverityLevel = totalCount > 0 ? minSeverity : 'none';
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
              maxSeverityLevel =
                Object.keys(severityWeights).find((k) => severityWeights[k] === highestWeight) || 'none';
              const aboveThreshold = detailsList.filter(
                (v) => (severityWeights[(v.severity || '').toLowerCase()] || 0) >= minWeight
              ).length;
              safe = aboveThreshold === 0;
            }
            if (safe) {
              const recAge = calculateAgeInDays(pubTime);
              // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
              // @req REQ-SAFE-ONLY - Recommend only non-vulnerable versions
              vulnMap.set(name, { count: totalCount, maxSeverity: maxSeverityLevel, details: detailsList });
              safeRows.push([name, current, wanted, ver, recAge, depType]);
              foundSafe = true;
              break;
            }
          }
          if (!foundSafe) {
            // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
            // @req REQ-SAFE-ONLY - No safe mature version found
            filterReasonMap.set(name, 'security');
            vulnMap.set(name, { count: 0, maxSeverity: 'none', details: [] });
          }
          fallbackUsed = true;
        }
      } catch (err) {
        if (format !== 'xml' && format !== 'json') {
          console.error(`Warning: failed to fetch version times for ${name}: ${err.message}`);
        }
      }
    }

    if (fallbackUsed) {
      continue;
    }

    // Original one-version logic
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
          typeof result.count === 'number' ? result.count : Array.isArray(result.details) ? result.details.length : 0;
        details = Array.isArray(result.details) ? result.details : [];
        let highestWeight = 0;
        for (const vuln of details) {
          const sevKey = (vuln.severity || '').toLowerCase();
          const weight = severityWeights[sevKey] || 0;
          if (weight > highestWeight) highestWeight = weight;
        }
        maxSeverity = Object.keys(severityWeights).find((key) => severityWeights[key] === highestWeight) || 'none';
        const countAboveThreshold = details.filter((vuln) => {
          const weight = severityWeights[(vuln.severity || '').toLowerCase()] || 0;
          return weight >= minWeight;
        }).length;
        if (countAboveThreshold > 0) {
          include = false;
          filterReasonMap.set(name, 'security');
        }
      }
    } catch (err) {
      if (format !== 'xml' && format !== 'json') {
        console.error(`Warning: failed to check vulnerabilities for ${name}@${latest}: ${err.message}`);
      }
    }

    vulnMap.set(name, { count: totalCount, maxSeverity, details });
    if (include) {
      safeRows.push(row);
    }
  }

  return { safeRows, vulnMap, filterReasonMap };
}