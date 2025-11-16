/**
 * Prepare JSON items for JSON output.
 * @story prompts/008.0-DEV-JSON-OUTPUT.md
 * @req REQ-JSON-MAPPING - Extract mapping logic for JSON output
 * @param {Array<[string, string, string, string, number|string, string]>} rows - Each row tuple: [name, current, wanted, latest, age, dependencyType]
 * @param {{ prod: { minAge: number, minSeverity: string }, dev: { minAge: number, minSeverity: string } }} thresholds - Age and severity thresholds for filtering logic.
 * @param {Map<string, {count: number, maxSeverity: string, details: Array<any>}>} vulnMap - Mapping of package names to vulnerability info.
 * @param {Map<string, string>} filterReasonMap - Mapping of package names to filter reasons ("age" or "security").
 * @returns {Array<Object>} JSON item objects ready for serialization.
 */
export function prepareJsonItems(rows, thresholds, vulnMap, filterReasonMap) {
  return rows.map(([name, current, wanted, latest, age, depType]) => {
    const minAge = depType === 'prod' ? thresholds.prod.minAge : thresholds.dev.minAge;
    const filteredByAge = typeof age === 'number' && age < minAge;
    const vulnInfo = vulnMap.get(name) || { count: 0, maxSeverity: 'none', details: [] };
    const filteredBySecurity = vulnInfo.count > 0;
    const filtered = filteredByAge || filteredBySecurity;
    const filterReason = filterReasonMap.get(name) || (filteredByAge ? 'age' : '');

    return {
      name,
      current,
      wanted,
      latest,
      recommended: wanted,
      age: typeof age === 'number' ? age : null,
      vulnerabilities: vulnInfo,
      filtered,
      filterReason,
      dependencyType: depType,
    };
  });
}
