// @ts-nocheck - TODO: Fix type annotations incrementally
/**
 * Filter rows by security vulnerabilities.
 * @param {Array} rows - Array of [name, current, wanted, latest, age, depType].
 * @param {function} checkVulnerabilities - Async function(name, version) returning number of vulnerabilities.
 * @param {{ prodMinSeverity: string, devMinSeverity: string }} thresholds - Severity thresholds for prod/dev.
 * @param {string} format - Output format ('table', 'json', 'xml').
 * @returns {Promise<{ safeRows: Array, vulnMap: Map<string, {count: number, maxSeverity: string, details: Array}>, filterReasonMap: Map<string, string> }>} Returns safe rows and vulnerability info.
 */
export async function filterBySecurity(
  rows,
  checkVulnerabilities,
  { prodMinSeverity, devMinSeverity },
  format
) {
  const safeRows = [];
  const vulnMap = new Map();
  const filterReasonMap = new Map();

  for (const row of rows) {
    const [name, , , latest, , depType] = row;
    const minSeverity = depType === 'prod' ? prodMinSeverity : devMinSeverity;
    let include = true;
    let vulnCount = 0;
    try {
      vulnCount = await checkVulnerabilities(name, latest);
      if (vulnCount !== 0) {
        include = false;
        filterReasonMap.set(name, 'security');
      }
    } catch (err) {
      if (format !== 'xml' && format !== 'json') {
        console.error(
          `Warning: failed to check vulnerabilities for ${name}@${latest}: ${err.message}`
        );
      }
      // treat failures as safe
    }
    vulnMap.set(name, {
      count: vulnCount,
      maxSeverity: vulnCount > 0 ? minSeverity : 'none',
      details: [],
    });
    if (include) {
      safeRows.push(row);
    }
  }
  return { safeRows, vulnMap, filterReasonMap };
}