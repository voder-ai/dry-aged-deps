// @ts-check
import { findSafeVersionSmartSearch } from './security-smart-search.js';
import { computeVulnerabilityStats, countAboveThreshold } from './security-helpers.js';

/**
 * Process object-based vulnerability result.
 * @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
 * @req REQ-AUDIT-CHECK
 * @req REQ-TRANSITIVE-DEPS
 * @param {object} result - Vulnerability result object.
 * @param {string} minSeverity - Minimum severity threshold.
 * @param {{ [key: string]: number }} severityWeights - Severity weight mapping.
 * @returns {{ include: boolean, totalCount: number, detailsList: any[], maxSeverity: string }} Processing result.
 */
function processObjectResult(result, minSeverity, severityWeights) {
  const { totalCount, detailsList, maxSeverity } = computeVulnerabilityStats(result, severityWeights);
  let minWeight = severityWeights.none;
  // @story prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md
  // @req REQ-SEVERITY-LEVELS
  switch (minSeverity) {
    // @story prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md
    // @req REQ-SEVERITY-LEVELS
    case 'low':
      // @story prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md
      // @req REQ-SEVERITY-LEVELS
      minWeight = severityWeights.low;
      break;
    // @story prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md
    // @req REQ-SEVERITY-LEVELS
    case 'moderate':
      // @story prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md
      // @req REQ-SEVERITY-LEVELS
      minWeight = severityWeights.moderate;
      break;
    // @story prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md
    // @req REQ-SEVERITY-LEVELS
    case 'high':
      // @story prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md
      // @req REQ-SEVERITY-LEVELS
      minWeight = severityWeights.high;
      break;
    // @story prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md
    // @req REQ-SEVERITY-LEVELS
    case 'critical':
      // @story prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md
      // @req REQ-SEVERITY-LEVELS
      minWeight = severityWeights.critical;
      break;
    // @story prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md
    // @req REQ-SEVERITY-LEVELS
    case 'none':
    default:
      // @story prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md
      // @req REQ-SEVERITY-LEVELS
      minWeight = severityWeights.none;
    // @story prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md
    // @req REQ-SEVERITY-LEVELS
  }
  const include = countAboveThreshold(detailsList, minWeight, severityWeights) === 0;
  return { include, totalCount, detailsList, maxSeverity };
}

/**
 * Process a single package version for vulnerability checking (original one-version logic).
 * @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
 * @req REQ-AUDIT-CHECK
 * @req REQ-TRANSITIVE-DEPS
 * @req REQ-SAFE-ONLY
 * @param {string} name - Package name.
 * @param {string} latest - Latest version.
 * @param {object} options - Processing options.
 * @param {string} options.minSeverity - Minimum severity threshold.
 * @param {Function} options.checkVulnerabilities - Vulnerability check function.
 * @param {{ [key: string]: number }} options.severityWeights - Severity weight mapping.
 * @param {string} options.format - Output format.
 * @returns {Promise<{ include: boolean, vulnInfo: { count: number, maxSeverity: string, details: any[] } }>} Processing result.
 */
async function processOneVersion(name, latest, options) {
  const { minSeverity, checkVulnerabilities, severityWeights, format } = options;
  let include = true;
  let totalCount = 0;
  /** @type {any[]} */
  let detailsList = [];
  let maxSeverity = 'none';

  // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
  // @req REQ-AUDIT-CHECK
  try {
    // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
    // @req REQ-AUDIT-CHECK
    const result = await checkVulnerabilities(name, latest);

    // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
    // @req REQ-AUDIT-CHECK
    if (typeof result === 'number') {
      // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
      // @req REQ-AUDIT-CHECK
      totalCount = result;
      maxSeverity = totalCount > 0 ? minSeverity : 'none';
      include = totalCount === 0;
      return { include, vulnInfo: { count: totalCount, maxSeverity, details: [] } };
      // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
      // @req REQ-AUDIT-CHECK
    }

    // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
    // @req REQ-AUDIT-CHECK
    if (result && typeof result === 'object') {
      // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
      // @req REQ-AUDIT-CHECK
      const objResult = processObjectResult(result, minSeverity, severityWeights);
      return {
        include: objResult.include,
        vulnInfo: { count: objResult.totalCount, maxSeverity: objResult.maxSeverity, details: objResult.detailsList },
      };
      // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
      // @req REQ-AUDIT-CHECK
    }
    // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
    // @req REQ-AUDIT-CHECK
  } catch (/** @type {any} */ err) {
    // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
    // @req REQ-AUDIT-CHECK
    if (format !== 'xml' && format !== 'json') {
      // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
      // @req REQ-AUDIT-CHECK
      console.error(`Warning: failed to check vulnerabilities for ${name}@${latest}: ${err.message}`);
      // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
      // @req REQ-AUDIT-CHECK
    }
  }

  return {
    include,
    vulnInfo: { count: totalCount, maxSeverity, details: detailsList },
  };
}

/**
 * Attempt smart-search fallback to find a safe version.
 * @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
 * @req REQ-SMART-SEARCH
 * @param {string} name - Package name.
 * @param {string} current - Current version.
 * @param {string} wanted - Wanted version.
 * @param {string} depType - Dependency type.
 * @param {{ [key: string]: any }} context - Context with functions and data.
 * @returns {Promise<{handled: boolean, safeRow?: [string,string,string,string,number|string,string], vulnInfo?: {count: number, maxSeverity: string, details: any[]}}>} Result indicating if handled.
 */
async function trySmartSearchFallback(name, current, wanted, depType, context) {
  const { fetchVersionTimes, calculateAgeInDays, checkVulnerabilities, minSeverity, severityWeights, format } = context;

  // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
  // @req REQ-SMART-SEARCH
  if (typeof fetchVersionTimes !== 'function' || typeof calculateAgeInDays !== 'function') {
    // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
    // @req REQ-SMART-SEARCH
    return { handled: false };
    // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
    // @req REQ-SMART-SEARCH
  }

  // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
  // @req REQ-SMART-SEARCH
  try {
    // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
    // @req REQ-SMART-SEARCH
    const versionTimes = await fetchVersionTimes(name);
    // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
    // @req REQ-SMART-SEARCH
    if (!versionTimes || typeof versionTimes !== 'object') {
      // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
      // @req REQ-SMART-SEARCH
      return { handled: false };
      // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
      // @req REQ-SMART-SEARCH
    }

    const safeResult = await findSafeVersionSmartSearch(name, versionTimes, {
      checkVulnerabilities,
      minSeverity,
      calculateAgeInDays,
      severityWeights,
    });

    const version = safeResult.version;
    const recAge = safeResult.recAge ?? 0;
    const count = safeResult.totalCount ?? 0;
    const maxSeverity = safeResult.maxSeverity ?? 'none';
    const details = safeResult.detailsList ?? [];

    // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
    // @req REQ-SMART-SEARCH
    if (version) {
      // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
      // @req REQ-SMART-SEARCH
      return {
        handled: true,
        safeRow: [name, current, wanted, version, recAge, depType],
        vulnInfo: { count, maxSeverity, details },
      };
      // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
      // @req REQ-SMART-SEARCH
    }

    return {
      handled: true,
      vulnInfo: { count: 0, maxSeverity: 'none', details: [] },
    };
    // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
    // @req REQ-SMART-SEARCH
  } catch (/** @type {any} */ err) {
    // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
    // @req REQ-SMART-SEARCH
    if (format !== 'xml' && format !== 'json') {
      // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
      // @req REQ-SMART-SEARCH
      console.error(`Warning: failed to fetch version times for ${name}: ${err.message}`);
      // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
      // @req REQ-SMART-SEARCH
    }
    return { handled: false };
  }
}

/**
 * Filter rows by security vulnerabilities.
 * @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
 * @story prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md
 * @req REQ-AUDIT-CHECK
 * @req REQ-TRANSITIVE-DEPS
 * @req REQ-SMART-SEARCH
 * @req REQ-SAFE-ONLY
 * @param {Array<[string,string,string,string,number|string,string]>} rows - Array of [name, current, wanted, latest, age, depType].
 * @param {Function} checkVulnerabilities - Function to check vulnerabilities for a package version.
 * @param {{ prodMinSeverity: string, devMinSeverity: string }} thresholds - Minimum severity thresholds for prod and dev.
 * @param {string} format - Output format (table, json, xml).
 * @param {{ fetchVersionTimes?: (name: string) => Promise<Record<string, string>>, calculateAgeInDays?: (date: string) => number }} [options] - Additional options for fetching version publish times and calculating age.
 * @returns {Promise<{ safeRows: Array<[string,string,string,string,number|string,string]>, vulnMap: Map<string,{count:number,maxSeverity:string,details:any[]}>, filterReasonMap: Map<string,string> }>} Filtered results and vulnerability info.
 */
export async function filterBySecurity(rows, checkVulnerabilities, thresholds, format, options = {}) {
  const { prodMinSeverity, devMinSeverity } = thresholds;
  const severityWeights = {
    none: 0,
    low: 1,
    moderate: 2,
    high: 3,
    critical: 4,
  };
  /** @type {Array<[string,string,string,string,number|string,string]>} */
  const safeRows = [];
  /** @type {Map<string,{count:number,maxSeverity:string,details:any[]}>} */
  const vulnMap = new Map();
  /** @type {Map<string,string>} */
  const filterReasonMap = new Map();

  // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
  // @req REQ-SAFE-ONLY
  for (const row of rows) {
    // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
    // @req REQ-SAFE-ONLY
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

    const { handled, safeRow, vulnInfo } = smartSearchResult;
    // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
    // @req REQ-SMART-SEARCH
    if (handled) {
      // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
      // @req REQ-SMART-SEARCH
      if (!vulnInfo) {
        // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
        // @req REQ-SMART-SEARCH
        // If no vulnerability info provided, treat as filtered
        filterReasonMap.set(name, 'security');
        continue;
        // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
        // @req REQ-SMART-SEARCH
      }
      // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
      // @req REQ-SMART-SEARCH
      if (safeRow) {
        // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
        // @req REQ-SMART-SEARCH
        vulnMap.set(name, vulnInfo);
        safeRows.push(safeRow);
        // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
        // @req REQ-SMART-SEARCH
      } else {
        // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
        // @req REQ-SMART-SEARCH
        filterReasonMap.set(name, 'security');
        vulnMap.set(name, vulnInfo);
        // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
        // @req REQ-SMART-SEARCH
      }
      continue;
      // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
      // @req REQ-SMART-SEARCH
    }

    // Original one-version logic
    const oneVersionResult = await processOneVersion(name, latest, {
      minSeverity,
      checkVulnerabilities,
      severityWeights,
      format,
    });

    vulnMap.set(name, oneVersionResult.vulnInfo);
    // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
    // @req REQ-SAFE-ONLY
    if (oneVersionResult.include) {
      // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
      // @req REQ-SAFE-ONLY
      safeRows.push(row);
      // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
      // @req REQ-SAFE-ONLY
    } else {
      // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
      // @req REQ-SAFE-ONLY
      filterReasonMap.set(name, 'security');
      // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
      // @req REQ-SAFE-ONLY
    }
  }

  return { safeRows, vulnMap, filterReasonMap };
}
