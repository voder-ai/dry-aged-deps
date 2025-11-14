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
async function evaluateVersionVulnerabilities(name, version, checkVulnerabilities, minSeverity, severityWeights) {
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
        typeof result.count === 'number' ? result.count : Array.isArray(result.details) ? result.details.length : 0;
      detailsList = Array.isArray(result.details) ? result.details : [];
      let highestWeight = 0;
      for (const vuln of detailsList) {
        const weight = severityWeights[(vuln.severity || '').toLowerCase()] || 0;
        if (weight > highestWeight) highestWeight = weight;
      }
      maxSeverity = Object.keys(severityWeights).find((k) => severityWeights[k] === highestWeight) || 'none';
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
 * Process object-based vulnerability result.
 * @param {object} result - Vulnerability result object.
 * @param {string} minSeverity - Minimum severity threshold.
 * @param {{ [key: string]: number }} severityWeights - Severity weight mapping.
 * @returns {{ include: boolean, totalCount: number, detailsList: Array, maxSeverity: string }} Processing result.
 */
function processObjectResult(result, minSeverity, severityWeights) {
  const totalCount =
    typeof result.count === 'number' ? result.count : Array.isArray(result.details) ? result.details.length : 0;
  const detailsList = Array.isArray(result.details) ? result.details : [];

  let highestWeight = 0;
  for (const vuln of detailsList) {
    const weight = severityWeights[(vuln.severity || '').toLowerCase()] || 0;
    if (weight > highestWeight) highestWeight = weight;
  }

  const maxSeverity = Object.keys(severityWeights).find((k) => severityWeights[k] === highestWeight) || 'none';
  const countAboveThreshold = detailsList.filter(
    (v) => (severityWeights[(v.severity || '').toLowerCase()] || 0) >= (severityWeights[minSeverity] || 0)
  ).length;

  return {
    include: countAboveThreshold === 0,
    totalCount,
    detailsList,
    maxSeverity,
  };
}

/**
 * Process a single package version for vulnerability checking (original one-version logic).
 * @param {string} name - Package name.
 * @param {string} latest - Latest version.
 * @param {object} options - Processing options.
 * @param {string} options.minSeverity - Minimum severity threshold.
 * @param {function} options.checkVulnerabilities - Vulnerability check function.
 * @param {{ [key: string]: number }} options.severityWeights - Severity weight mapping.
 * @param {string} options.format - Output format.
 * @returns {Promise<{ include: boolean, vulnInfo: object }>} Processing result.
 */
async function processOneVersion(name, latest, options) {
  const { minSeverity, checkVulnerabilities, severityWeights, format } = options;
  let include = true;
  let totalCount = 0;
  let detailsList = [];
  let maxSeverity = 'none';

  try {
    const result = await checkVulnerabilities(name, latest);

    if (typeof result === 'number') {
      totalCount = result;
      maxSeverity = totalCount > 0 ? minSeverity : 'none';
      include = totalCount === 0;
      return { include, vulnInfo: { count: totalCount, maxSeverity, details: [] } };
    }

    if (result && typeof result === 'object') {
      const objResult = processObjectResult(result, minSeverity, severityWeights);
      return {
        include: objResult.include,
        vulnInfo: { count: objResult.totalCount, maxSeverity: objResult.maxSeverity, details: objResult.detailsList },
      };
    }
  } catch (err) {
    if (format !== 'xml' && format !== 'json') {
      console.error(`Warning: failed to check vulnerabilities for ${name}@${latest}: ${err.message}`);
    }
  }

  return {
    include,
    vulnInfo: { count: totalCount, maxSeverity, details: detailsList },
  };
} /**
 * Attempt smart-search fallback to find a safe version.
 * @param {string} name - Package name.
 * @param {string} current - Current version.
 * @param {string} wanted - Wanted version.
 * @param {string} depType - Dependency type.
 * @param {object} context - Context with functions and data.
 * @returns {Promise<{ handled: boolean, safeRow?: Array, vulnInfo?: object }>} Result indicating if handled.
 */
async function trySmartSearchFallback(name, current, wanted, depType, context) {
  const { fetchVersionTimes, calculateAgeInDays, checkVulnerabilities, minSeverity, severityWeights, format } = context;

  if (typeof fetchVersionTimes !== 'function' || typeof calculateAgeInDays !== 'function') {
    return { handled: false };
  }

  try {
    const versionTimes = await fetchVersionTimes(name);
    if (!versionTimes || typeof versionTimes !== 'object') {
      return { handled: false };
    }

    const safeResult = await findSafeVersionSmartSearch(name, versionTimes, {
      checkVulnerabilities,
      minSeverity,
      calculateAgeInDays,
      severityWeights,
    });

    if (safeResult.version) {
      return {
        handled: true,
        safeRow: [name, current, wanted, safeResult.version, safeResult.recAge, depType],
        vulnInfo: {
          count: safeResult.totalCount,
          maxSeverity: safeResult.maxSeverity,
          details: safeResult.detailsList,
        },
      };
    }

    return {
      handled: true,
      vulnInfo: { count: 0, maxSeverity: 'none', details: [] },
    };
  } catch (err) {
    if (format !== 'xml' && format !== 'json') {
      console.error(`Warning: failed to fetch version times for ${name}: ${err.message}`);
    }
    return { handled: false };
  }
}

/**
 * Find the safest/most recent version using smart-search fallback logic.
 * @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
 * @req REQ-SMART-SEARCH - Search for safe version by newest to oldest.
 * @param {string} name - Package name.
 * @param {{ [version: string]: string }} versionTimes - Mapping of version to publish time.
 * @param {object} options - Search options.
 * @param {function} options.checkVulnerabilities - Async vulnerability checker function.
 * @param {string} options.minSeverity - Minimum allowed severity.
 * @param {function} options.calculateAgeInDays - Function to calculate age from date.
 * @param {{ [key: string]: number }} options.severityWeights - Mapping of severity labels to weight.
 * @returns {Promise<{ version: string|null, recAge?: number, totalCount?: number, maxSeverity?: string, detailsList?: Array }>} Safe version info.
 */
async function findSafeVersionSmartSearch(name, versionTimes, options) {
  const { checkVulnerabilities, minSeverity, calculateAgeInDays, severityWeights } = options;
  const entries = Object.entries(versionTimes);
  entries.sort(([, timeA], [, timeB]) => new Date(timeB) - new Date(timeA));
  for (const [ver, pubTime] of entries) {
    const { safe, totalCount, maxSeverity, detailsList } = await evaluateVersionVulnerabilities(
      name,
      ver,
      checkVulnerabilities,
      minSeverity,
      severityWeights
    );
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
    const smartSearchResult = await trySmartSearchFallback(name, current, wanted, depType, {
      fetchVersionTimes,
      calculateAgeInDays,
      checkVulnerabilities,
      minSeverity,
      severityWeights,
      format,
    });

    if (smartSearchResult.handled) {
      if (smartSearchResult.safeRow) {
        vulnMap.set(name, smartSearchResult.vulnInfo);
        safeRows.push(smartSearchResult.safeRow);
      } else {
        filterReasonMap.set(name, 'security');
        vulnMap.set(name, smartSearchResult.vulnInfo);
      }
      continue;
    }

    // Original one-version logic
    const oneVersionResult = await processOneVersion(name, latest, {
      minSeverity,
      checkVulnerabilities,
      severityWeights,
      format,
    });

    vulnMap.set(name, oneVersionResult.vulnInfo);
    if (oneVersionResult.include) {
      safeRows.push(row);
    } else {
      filterReasonMap.set(name, 'security');
    }
  }

  return { safeRows, vulnMap, filterReasonMap };
}
