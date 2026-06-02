// @ts-check
/**
 * Prepare JSON items for JSON output.
 *
 * The optional `viaExposureModifierByPackage` map (RFC-002 T5) annotates rows
 * that were age-permitted only because of the exposure-aware soak modifier.
 * When the map is absent / empty / has no entry for a row, the item is emitted
 * unchanged — preserves byte-identical default-OFF behaviour per
 * REQ-EXPOSURE-OFF-BY-DEFAULT-PRESERVED.
 *
 * @param {Array<[string, string, string, string, number|string, string]>} rows - Each row tuple: [name, current, wanted, latest, age, dependencyType]
 * @param {{ prod: { minAge: number, minSeverity: string }, dev: { minAge: number, minSeverity: string } }} thresholds - Age and severity thresholds for filtering logic.
 * @param {Map<string, {count: number, maxSeverity: string, details: Array<any>}>} vulnMap - Mapping of package names to vulnerability info.
 * @param {Map<string, string>} filterReasonMap - Mapping of package names to filter reasons ("age" or "security").
 * @param {Map<string, { severity: string, baseSoakDays: number, effectiveSoakDays: number, advisories: Array<string> }>} [viaExposureModifierByPackage] - Per-package exposure-modifier annotation; rows whose name is in the map get a `viaExposureModifier` field on the resulting item.
 * @returns {Array<Object>} JSON item objects ready for serialization.
 * @supports prompts/008.0-DEV-JSON-OUTPUT.md REQ-COMPLETE-DATA
 * @supports prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md REQ-EXPOSURE-REPORT-MODIFIED REQ-EXPOSURE-JSON REQ-EXPOSURE-OFF-BY-DEFAULT-PRESERVED
 */
export function prepareJsonItems(rows, thresholds, vulnMap, filterReasonMap, viaExposureModifierByPackage) {
  const annotations = viaExposureModifierByPackage instanceof Map ? viaExposureModifierByPackage : null;
  return rows.map(([name, current, wanted, latest, age, depType]) => {
    const minAge = depType === 'prod' ? thresholds.prod.minAge : thresholds.dev.minAge;
    const filteredByAge = typeof age === 'number' && age < minAge;
    const vulnInfo = vulnMap.get(name) || { count: 0, maxSeverity: 'none', details: [] };
    const filteredBySecurity = vulnInfo.count > 0;
    const filtered = filteredByAge || filteredBySecurity;
    const filterReason = filterReasonMap.get(name) || (filteredByAge ? 'age' : '');

    /** @type {Record<string, unknown>} */
    const item = {
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

    if (annotations && annotations.has(name)) {
      item.viaExposureModifier = annotations.get(name);
    }
    return item;
  });
}
