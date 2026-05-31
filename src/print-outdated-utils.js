// @ts-check
import { jsonFormatter } from './json-formatter.js';
import { xmlFormatter } from './xml-formatter.js';
import { prepareJsonItems } from './output-utils.js';
import { getTimestamp } from './print-utils.js';
import { severityRank } from './find-unfixable-vulns.js';

/**
 * @typedef {Object} FilterSummary
 * @property {number} totalOutdated - Total number of outdated dependencies detected.
 * @property {number} safeUpdates - Number of safe updates available.
 * @property {number} filteredByAge - Number of dependencies filtered out by age threshold.
 * @property {number} filteredBySecurity - Number of dependencies filtered out by security threshold.
 */

/**
 * @typedef {Object} Thresholds
 * @property {{ minAge: number; minSeverity: string }} prod - Production dependency thresholds.
 * @property {{ minAge: number; minSeverity: string }} dev - Development dependency thresholds.
 */

/**
 * Output JSON formatted results.
 * @supports prompts/008.0-DEV-JSON-OUTPUT.md REQ-CLI-FLAG
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-JSON
 * @param {{ rows: Array<[string, string, string, string, number|string, string]>, summary: FilterSummary, thresholds: Thresholds, vulnMap: Map<string, object>, filterReasonMap: Map<string, string>, excludeMap?: Record<string, string>, unfixable?: Array<{ name: string, severity: string, advisory: string, reason: string, via: Array<string> }>, overridesHygiene?: Array<object> }} options
 * @returns {FilterSummary} Summary object returned from filtering.
 */
export function handleJsonOutput({
  rows,
  summary,
  thresholds,
  vulnMap,
  filterReasonMap,
  excludeMap = {},
  unfixable = [],
  overridesHygiene = [],
}) {
  const timestamp = getTimestamp();
  const items = prepareJsonItems(rows, thresholds, vulnMap, filterReasonMap);
  const excluded = Object.entries(excludeMap).map(([name, reason]) => ({ name, reason }));
  console.log(jsonFormatter({ rows: items, summary, thresholds, timestamp, excluded, unfixable, overridesHygiene }));
  return summary;
}

/**
 * Output XML formatted results.
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-CLI-FLAG
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-XML
 * @param {{ rows: Array<[string, string, string, string, number|string, string]>, summary: FilterSummary, thresholds: Thresholds, vulnMap: Map<string, object>, filterReasonMap: Map<string, string>, excludeMap?: Record<string, string>, unfixable?: Array<{ name: string, severity: string, advisory: string, reason: string, via: Array<string> }>, overridesHygiene?: Array<object> }} options
 * @returns {FilterSummary} Summary object returned from filtering.
 */
export function handleXmlOutput({
  rows,
  summary,
  thresholds,
  vulnMap,
  filterReasonMap,
  excludeMap = {},
  unfixable = [],
  overridesHygiene = [],
}) {
  const timestamp = getTimestamp();
  const items = prepareJsonItems(rows, thresholds, vulnMap, filterReasonMap);
  const excluded = Object.entries(excludeMap).map(([name, reason]) => ({ name, reason }));
  console.log(xmlFormatter({ rows: items, summary, thresholds, timestamp, excluded, unfixable, overridesHygiene }));
  return summary;
}

/**
 * Group per-advisory unfixable rows into one row per package: advisories are
 * joined, severity is the highest across the package's advisories, reason is
 * shared. Removes the visual duplication of repeating name/severity/reason
 * across a package's multiple advisories.
 * @param {Array<{ name: string, severity: string, advisory: string, reason: string }>} unfixable
 * @returns {Array<[string, string, string, string]>} [name, severity, advisories, reason] rows
 */
function groupUnfixableByPackage(unfixable) {
  /** @type {Map<string, { severity: string, advisories: string[], reason: string }>} */
  const byPackage = new Map();
  for (const { name, severity, advisory, reason } of unfixable) {
    const existing = byPackage.get(name);
    if (existing) {
      existing.advisories.push(advisory);
      if (severityRank(severity) > severityRank(existing.severity)) existing.severity = severity;
    } else {
      byPackage.set(name, { severity, advisories: [advisory], reason });
    }
  }
  return [...byPackage.entries()].map(([name, p]) => [name, p.severity, p.advisories.join(', '), p.reason]);
}

/**
 * Render rows as a space-padded, column-aligned table (npm-outdated style,
 * JTBD-005) rather than tab-joined, so columns line up regardless of width.
 * @param {string[]} header
 * @param {Array<string[]>} rows
 * @returns {void}
 */
function printAlignedTable(header, rows) {
  // `.at(i)` (method call) rather than `[i]` (computed member) so the
  // security/detect-object-injection rule does not false-positive on the
  // numeric array indexing.
  const widths = header.map((h, i) => Math.max(h.length, ...rows.map((r) => String(r.at(i)).length)));
  const fmt = (/** @type {string[]} */ cols) =>
    cols
      .map((c, i) => c.padEnd(widths.at(i) ?? 0))
      .join('  ')
      .trimEnd();
  console.log(fmt(header));
  for (const row of rows) console.log(fmt(row));
}

/**
 * Print the "Known vulnerabilities without safe fix" section, if any.
 * Appears after the outdated table (JTBD-005: existing columns unchanged;
 * the surface is a separate appended section, never a new column). Grouped
 * by package and column-aligned for readability.
 * @param {Array<{ name: string, severity: string, advisory: string, reason: string }>} unfixable
 * @returns {void}
 * @supports prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md REQ-UNFIXABLE-TABLE
 */
export function printUnfixableSection(unfixable) {
  if (!unfixable || unfixable.length === 0) return;
  console.log('');
  console.log('Known vulnerabilities without safe fix:');
  printAlignedTable(['Name', 'Severity', 'Advisory', 'Reason'], groupUnfixableByPackage(unfixable));
}

/**
 * Render a nullable value as a CLI cell. Null/undefined collapses to `-`
 * (terse CLI convention per VOICE-AND-TONE.md) so rows never carry literal
 * "null" text.
 * @param {unknown} value
 * @returns {string}
 */
function cell(value) {
  if (value === null || value === undefined) return '-';
  return String(value);
}

/**
 * Print the "Override hygiene" section, if any. Mirrors the unfixable
 * precedent (appended section, space-aligned columns, skip-when-empty).
 * Column shape and order per REQ-OVERRIDES-TABLE.
 * @param {Array<{ name: string, pinned: string|null, latest: string|null, ageDays: number|null, reason: string, advisories: Array<object>, safeUpgrade: string|null }>} overridesHygiene
 * @returns {void}
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-TABLE REQ-OVERRIDES-REASON-TAXONOMY
 */
export function printOverridesHygieneSection(overridesHygiene) {
  if (!overridesHygiene || overridesHygiene.length === 0) return;
  console.log('');
  console.log('Override hygiene:');
  const header = ['Override', 'Pinned', 'Latest', 'Age', 'Reason', 'Safe Upgrade'];
  const rows = overridesHygiene.map((f) => [
    cell(f.name),
    cell(f.pinned),
    cell(f.latest),
    cell(f.ageDays),
    cell(f.reason),
    cell(f.safeUpgrade),
  ]);
  printAlignedTable(header, rows);
}

/**
 * Output table formatted results.
 * @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-OUTPUT-DISPLAY
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-TABLE
 * @param {{ safeRows: Array<Array>, matureRows: Array<Array>, summary: FilterSummary, prodMinAge: number, devMinAge: number, returnSummary: boolean, excludeMap?: Record<string, string>, unfixable?: Array<{ name: string, severity: string, advisory: string, reason: string }>, overridesHygiene?: Array<object> }} options
 * @returns {FilterSummary|undefined} Summary when returnSummary is true or undefined otherwise.
 */
export function handleTableOutput({
  safeRows,
  matureRows,
  summary,
  prodMinAge,
  devMinAge,
  returnSummary,
  excludeMap = {},
  unfixable = [],
  overridesHygiene = [],
}) {
  // @supports prompts/015.0-DEV-EXCLUDE-PACKAGES.md REQ-EXCLUDE-OUTPUT
  const excludedCount = Object.keys(excludeMap).length;

  console.log('Outdated packages:');
  console.log(['Name', 'Current', 'Wanted', 'Latest', 'Age (days)', 'Type'].join('	'));

  // @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-OUTPUT-DISPLAY
  if (matureRows.length === 0) {
    console.log(
      `No outdated packages with mature versions found (prod >= ${prodMinAge} days, dev >= ${devMinAge} days).`
    );
    if (excludedCount > 0) {
      console.log(`${excludedCount} package(s) excluded from analysis (see .dry-aged-deps.json)`);
    }
    printUnfixableSection(unfixable);
    printOverridesHygieneSection(overridesHygiene);
    // @supports prompts/013.0-DEV-CHECK-MODE.md REQ-CHECK-FLAG
    if (returnSummary) return summary; // returns {FilterSummary} when returnSummary is true
    return undefined; // returns undefined when returnSummary is false
  }

  // @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-OUTPUT-DISPLAY
  if (safeRows.length === 0) {
    console.log(
      `No outdated packages with safe, mature versions (>= ${prodMinAge}/${devMinAge} days old, no vulnerabilities) found.`
    );
    if (excludedCount > 0) {
      console.log(`${excludedCount} package(s) excluded from analysis (see .dry-aged-deps.json)`);
    }
    printUnfixableSection(unfixable);
    printOverridesHygieneSection(overridesHygiene);
    // @supports prompts/013.0-DEV-CHECK-MODE.md REQ-CHECK-FLAG
    if (returnSummary) return summary; // returns {FilterSummary} when returnSummary is true
    return undefined; // returns undefined when returnSummary is false
  }

  // @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-OUTPUT-DISPLAY
  for (const row of safeRows) {
    console.log(row.join('\t'));
  }
  if (excludedCount > 0) {
    console.log(`${excludedCount} package(s) excluded from analysis (see .dry-aged-deps.json)`);
  }
  printUnfixableSection(unfixable);
  printOverridesHygieneSection(overridesHygiene);
  // @supports prompts/013.0-DEV-CHECK-MODE.md REQ-CHECK-FLAG
  if (returnSummary) return summary; // returns {FilterSummary} when returnSummary is true
  return undefined; // returns undefined when returnSummary is false
}
