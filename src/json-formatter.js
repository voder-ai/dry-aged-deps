// @ts-check
// Story: prompts/008.0-DEV-JSON-OUTPUT.md
// json-formatter.js
// Formats outdated dependencies and summary data into JSON
// See prompts/008.0-DEV-JSON-OUTPUT.md for full JSON output spec

/**
 * Format outdated dependencies data into JSON string.
 * @supports prompts/008.0-DEV-JSON-OUTPUT.md REQ-JSON-SCHEMA REQ-COMPLETE-DATA REQ-SUMMARY-STATS
 */

/**
 * Format data into JSON string
 * Supports legacy array rows and full JSON mode object rows
 * @param {{ rows: Array<Array<any> | Object>, summary: { totalOutdated: number, safeUpdates: number, filteredByAge: number, filteredBySecurity: number }, thresholds?: { prod: { minAge: number, minSeverity: string }, dev: { minAge: number, minSeverity: string } }, timestamp: string, excluded?: Array<{ name: string, reason: string }>, unfixable?: Array<{ name: string, severity: string, advisory: string, reason: string, via: Array<string> }>, overridesHygiene?: Array<{ name: string, pinned: string|null, latest: string|null, ageDays: number|null, reason: string, advisories: Array<{ id: string, severity: string, patchedRange: string|null }>, safeUpgrade: string|null }> }} params
 * @returns {string} JSON string
 * @supports prompts/008.0-DEV-JSON-OUTPUT.md REQ-JSON-SCHEMA REQ-COMPLETE-DATA REQ-SUMMARY-STATS
 * @supports prompts/015.0-DEV-EXCLUDE-PACKAGES.md REQ-EXCLUDE-OUTPUT
 * @supports prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md REQ-UNFIXABLE-JSON REQ-UNFIXABLE-SCHEMA-COMPAT
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-JSON REQ-OVERRIDES-SCHEMA-COMPAT REQ-OVERRIDES-AUDIT-ARTEFACT
 */
export function jsonFormatter({
  rows,
  summary,
  thresholds,
  timestamp,
  excluded = [],
  unfixable = [],
  overridesHygiene = [],
}) {
  const packages = rows.map((row) => {
    // @supports prompts/008.0-DEV-JSON-OUTPUT.md REQ-JSON-SCHEMA
    if (Array.isArray(row)) {
      const [name, current, wanted, latest, age] = row;
      return { name, current, wanted, latest, age };
    } else {
      const {
        name,
        dependencyType: type,
        current,
        wanted,
        latest,
        recommended,
        age,
        vulnerabilities,
        filtered,
        filterReason,
      } = row;
      return {
        name,
        type,
        current,
        wanted,
        latest,
        recommended,
        age,
        vulnerabilities,
        filtered,
        filterReason,
      };
    }
  });

  const output = {
    timestamp,
    packages,
    summary: {
      totalOutdated: summary.totalOutdated,
      safeUpdates: summary.safeUpdates,
      filteredByAge: summary.filteredByAge,
      filteredBySecurity: summary.filteredBySecurity,
    },
  };

  // @supports prompts/015.0-DEV-EXCLUDE-PACKAGES.md REQ-EXCLUDE-OUTPUT
  if (excluded.length > 0) {
    output.excluded = excluded;
  }

  // @supports prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md REQ-UNFIXABLE-JSON
  // Additive + omitted-when-empty, mirroring `excluded`: keeps the schema
  // backward-compatible (REQ-UNFIXABLE-SCHEMA-COMPAT) and lets the auto-update
  // workflow test `.unfixable // empty` cleanly.
  if (unfixable.length > 0) {
    output.unfixable = unfixable;
  }

  // @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-JSON REQ-OVERRIDES-SCHEMA-COMPAT
  // Same omit-when-empty pattern as `unfixable` — keeps existing consumers
  // shape-stable and lets jq surfaces test `.overridesHygiene // empty` cleanly.
  if (overridesHygiene.length > 0) {
    output.overridesHygiene = overridesHygiene;
  }

  // @supports prompts/008.0-DEV-JSON-OUTPUT.md REQ-SUMMARY-STATS
  if (thresholds) {
    output.summary.thresholds = thresholds;
  }

  return JSON.stringify(output, null, 2);
}
