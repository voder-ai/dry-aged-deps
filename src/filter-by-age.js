// @ts-check
/**
 * Filter rows by age threshold. Accepts an optional per-package exposure
 * modifier map (RFC-002 T4) that scales the row's effective minAge by a
 * locked-policy modifier in `[0.0, 1.0]`. When the map is absent or has no
 * entry for a row, the global prodMinAge/devMinAge applies unchanged —
 * preserves byte-identical behaviour for the default-OFF code path per
 * REQ-EXPOSURE-OFF-BY-DEFAULT-PRESERVED.
 *
 * @param {Array<[string, string, string, string, number|string, string]>} rows - Array of [name, current, wanted, latest, age, depType].
 * @param {{ prodMinAge: number, devMinAge: number, exposureModifierByPackage?: Map<string, number> }} thresholds
 * @returns {Array<[string, string, string, string, number|string, string]>} Filtered rows where age >= effective minAge for their dependency type.
 * @supports prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md REQ-CLI-FLAG
 * @supports prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md REQ-EXPOSURE-EFFECTIVE-SOAK REQ-EXPOSURE-PER-PACKAGE-APPLY REQ-EXPOSURE-OFF-BY-DEFAULT-PRESERVED
 */
export function filterByAge(rows, { prodMinAge, devMinAge, exposureModifierByPackage }) {
  const modifiers = exposureModifierByPackage instanceof Map ? exposureModifierByPackage : null;
  return rows.filter(([name, , , , age, depType]) => {
    const baseMinAge = depType === 'prod' ? prodMinAge : devMinAge;
    const modifier = modifiers && modifiers.has(name) ? modifiers.get(name) : 1;
    const minAge = modifier === 1 ? baseMinAge : Math.floor(baseMinAge * /** @type {number} */ (modifier));
    return typeof age === 'number' && age >= minAge;
  });
}
