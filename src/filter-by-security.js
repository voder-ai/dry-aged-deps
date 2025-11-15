// @ts-nocheck
import { findSafeVersionSmartSearch } from './security-smart-search.js';
import { computeVulnerabilityStats, countAboveThreshold } from './security-helpers.js';

/**
 * Process object-based vulnerability result.
 * @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
 * @req REQ-AUDIT-CHECK - check vulnerabilities using audit API
 * @req REQ-TRANSITIVE-DEPS - check transitive dependencies for vulnerabilities
 * @param {object} result - Vulnerability result object.
 * @param {string} minSeverity - Minimum severity threshold.
 * @param {{ [key: string]: number }} severityWeights - Severity weight mapping.
 * @returns {{ include: boolean, totalCount: number, detailsList: Array, maxSeverity: string }} Processing result.
 */
function processObjectResult(result, minSeverity, severityWeights) {
  const { totalCount, detailsList, maxSeverity } = computeVulnerabilityStats(result, severityWeights);
  let minWeight = severityWeights.none;
  switch (minSeverity) {
    case 'low':
      minWeight = severityWeights.low;
      break;
    case 'moderate':
      minWeight = severityWeights.moderate;
      break;
    case 'high':
      minWeight = severityWeights.high;
      break;
    case 'critical':
      minWeight = severityWeights.critical;
      break;
    case 'none':
    default:
      minWeight = severityWeights.none;
  }
  const include = countAboveThreshold(detailsList, minWeight, severityWeights) === 0;
  return { include, totalCount, detailsList, maxSeverity };
}

/**
 * Process a single package version for vulnerability checking (original one-version logic).
 * @param {string} name - Package name.
 * @param {string} latest - Latest version.
 * @param {object} options - Processing options.
 * @param {string} options.minSeverity - Minimum severity threshold.
 * @param {Function} options.checkVulnerabilities - Vulnerability check function.
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
}

/**
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
 * Filter rows by security vulnerabilities.
 * @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
 * @req REQ-AUDIT-CHECK - check vulnerabilities using audit API
 * @req REQ-TRANSITIVE-DEPS - check transitive dependencies for vulnerabilities
 * @req REQ-SMART-SEARCH - search newest mature versions first
 * @req REQ-SAFE-ONLY - only include safe versions
 * @param {Array<[string,string,string,string,number|string,string]>} rows - Array of [name, current, wanted, latest, age, depType].
 * @param {Function} checkVulnerabilities - Function to check vulnerabilities for a package version.
 * @param {{ prodMinSeverity: string, devMinSeverity: string }} thresholds - Minimum severity thresholds for prod and dev.
 * @param {string} format - Output format (table, json, xml).
 * @param {Object} [options] - Additional options like fetchVersionTimes, calculateAgeInDays.
 * @returns {Promise<{ safeRows: Array<[string,string,string,string,number|string,string]>, vulnMap: Map<string,{count:number,maxSeverity:string,details:any[]}>, filterReasonMap: Map<string,string> }>} Filtered results and vulnerability info.
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