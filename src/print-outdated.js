// @ts-check

import { fetchVersionTimes as defaultFetchVersionTimes } from './fetch-version-times.js';
import { calculateAgeInDays as defaultCalculateAgeInDays } from './age-calculator.js';
import { checkVulnerabilities as defaultCheckVulnerabilities } from './check-vulnerabilities.js';
import * as loadPackageJsonModule from './load-package-json.js';
import { buildRows } from './build-rows.js';
import { applyFilters } from './apply-filters.js';
import { handleJsonOutput, handleXmlOutput, handleTableOutput } from './print-outdated-handlers.js';
import { printUnfixableSection, printOverridesHygieneSection } from './print-outdated-utils.js';
import { computeUnfixable } from './compute-unfixable.js';
import { runOverridesHygiene as defaultRunOverridesHygiene } from './overrides-hygiene.js';
import { runProjectAudit as defaultRunProjectAudit } from './run-project-audit.js';
import { updatePackages } from './update-packages.js';
import { getThresholds } from './print-utils.js';

/**
 * Count override findings whose `safeUpgrade` is a non-null target. Feeds the
 * summary's `overridesWithSafeUpgrade` field that drives the RFC-001 T6
 * exit-code extension (exit 1 when ≥ 1 override pin has a safe-upgrade target,
 * additive within ADR-0003's "safe path forward exists" semantic).
 * @param {Array<{ safeUpgrade?: string|null }>} overridesHygiene
 * @returns {number}
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-EXIT-CODE-LOGIC
 */
function countOverridesWithSafeUpgrade(overridesHygiene) {
  return overridesHygiene.filter((f) => f.safeUpgrade != null).length;
}

/**
 * Handle scenario when there are no outdated dependencies.
 * @param {{ format: string, returnSummary: boolean, thresholds: {prod:{minAge:number,minSeverity:string},dev:{minAge:number,minSeverity:string}}, excludeMap?: Record<string, string>, unfixable?: Array<{ name: string, severity: string, advisory: string, reason: string, via: Array<string> }>, overridesHygiene?: Array<object> }} params
 * @returns {Object|undefined} summary for xml mode or if returnSummary is true
 * @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-OUTPUT-DISPLAY
 * @supports prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md REQ-UNFIXABLE-DETECT
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-TABLE REQ-OVERRIDES-JSON REQ-OVERRIDES-XML REQ-OVERRIDES-EXIT-CODE-LOGIC
 */
export function handleNoOutdated({
  format,
  returnSummary,
  thresholds,
  excludeMap = {},
  unfixable = [],
  overridesHygiene = [],
}) {
  const summary = {
    totalOutdated: 0,
    safeUpdates: 0,
    filteredByAge: 0,
    filteredBySecurity: 0,
    overridesWithSafeUpgrade: countOverridesWithSafeUpgrade(overridesHygiene),
  };
  // @supports prompts/008.0-DEV-JSON-OUTPUT.md REQ-CLI-FLAG
  if (format === 'json') {
    return handleJsonOutput({
      rows: [],
      summary,
      thresholds,
      vulnMap: new Map(),
      filterReasonMap: new Map(),
      excludeMap,
      unfixable,
      overridesHygiene,
    });
  }
  // @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-CLI-FLAG
  if (format === 'xml') {
    return handleXmlOutput({
      rows: [],
      summary,
      thresholds,
      vulnMap: new Map(),
      filterReasonMap: new Map(),
      excludeMap,
      unfixable,
      overridesHygiene,
    });
  }
  console.log('All dependencies are up to date.');
  // @supports prompts/015.0-DEV-EXCLUDE-PACKAGES.md REQ-EXCLUDE-OUTPUT
  const excludedCount = Object.keys(excludeMap).length;
  if (excludedCount > 0) {
    console.log(`${excludedCount} package(s) excluded from analysis (see .dry-aged-deps.json)`);
  }
  // @supports prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md REQ-UNFIXABLE-TABLE
  printUnfixableSection(unfixable);
  // @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-TABLE
  printOverridesHygieneSection(overridesHygiene);
  // @supports prompts/013.0-DEV-CHECK-MODE.md REQ-CHECK-FLAG
  if (returnSummary) return summary;
  return;
}

/**
 * Filter out excluded packages from the data object.
 * @param {Record<string, any>} data - Outdated packages data.
 * @param {Record<string, string>} excludeMap - Packages to exclude (name -> reason).
 * @returns {Record<string, any>} Filtered data without excluded packages.
 * @supports prompts/015.0-DEV-EXCLUDE-PACKAGES.md REQ-EXCLUDE-FILTER
 */
function applyExclusions(data, excludeMap) {
  const excludedNames = new Set(Object.keys(excludeMap));
  if (excludedNames.size === 0) return data;
  return Object.fromEntries(Object.entries(data).filter(([name]) => !excludedNames.has(name)));
}

/**
 * Resolve the unfixable-vulnerability rows from the relevant CLI/config options.
 * Extracted from printOutdated to keep that function within the complexity limit.
 * @param {Set<string>} safePackages - names dry-aged-deps will recommend a safe update for
 * @param {{ unfixable?: boolean, unfixableLevel?: string, runProjectAudit?: () => Promise<{ vulnerabilities: Record<string, object> }> }} options
 * @param {boolean} [updateMode] - true in --update mode, where there is no output surface to skip the audit cost
 * @param {{ vulnerabilities: Record<string, object> }} [auditData] - shared audit payload to avoid re-spawning npm audit
 * @returns {Promise<Array<{ name: string, severity: string, advisory: string, reason: string, via: Array<string> }>>}
 * @supports prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md REQ-UNFIXABLE-DEFAULT-ON REQ-UNFIXABLE-SEVERITY-FLOOR
 */
function resolveUnfixable(safePackages, options, updateMode = false, auditData) {
  return computeUnfixable({
    safePackages,
    // Explicit opt-in: the user-facing "on by default" lives in parseOptions
    // (which passes unfixable:true unless --no-unfixable). Defaulting the
    // programmatic API to off keeps embedders — and the existing unit tests —
    // from unexpectedly shelling out to `npm audit`.
    enabled: options.unfixable === true && !updateMode,
    severityFloor: options.unfixableLevel, // undefined → 'low' (surface all) inside computeUnfixable
    runProjectAudit: options.runProjectAudit, // injectable; defaults inside computeUnfixable
    auditData, // pre-fetched payload when sharing with the overrides-hygiene surface
  });
}

/**
 * Resolve the overrides-hygiene findings from the relevant CLI/config options.
 * Sibling of resolveUnfixable; extracted to keep printOutdated within the
 * project's complexity / line-cap limits.
 * @param {object} ctx
 * @param {{ overrides?: Record<string, unknown> }} ctx.packageJson - loaded package.json
 * @param {Record<string, { current?: string, latest?: string }>} ctx.outdatedData
 * @param {{ vulnerabilities: Record<string, object> }} ctx.auditData - shared raw audit payload
 * @param {{ overridesHygiene?: boolean, runOverridesHygieneFn?: function, fetchVersionTimes?: function }} ctx.options
 * @returns {Promise<Array<object>>}
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-PIPELINE-WIRE REQ-OVERRIDES-DEFAULT-ON
 */
async function resolveOverridesHygiene({ packageJson, outdatedData, auditData, options }) {
  if (options.overridesHygiene === false) return [];
  const overrides = packageJson?.overrides ?? {};
  if (Object.keys(overrides).length === 0) return [];

  const runOverridesHygieneFn = options.runOverridesHygieneFn ?? defaultRunOverridesHygiene;
  const fetchVersionTimes = options.fetchVersionTimes ?? defaultFetchVersionTimes;

  const versionTimes = await collectOverrideVersionTimes(overrides, fetchVersionTimes);

  return runOverridesHygieneFn({
    packageJson,
    auditData,
    outdatedData,
    versionTimes,
  });
}

/**
 * Extract the pinned exact-version string from an override entry. Supports the
 * simple ("name": "version") and nested ("name": { ".": "version" }) shapes
 * per the npm overrides spec. Returns null when the entry is malformed.
 * @param {unknown} value
 * @returns {string|null}
 */
function extractPinnedExact(value) {
  if (typeof value === 'string') return stripRangeSpecifier(value);
  if (value && typeof value === 'object') {
    const selfPin = Reflect.get(value, '.');
    if (typeof selfPin === 'string') return stripRangeSpecifier(selfPin);
  }
  return null;
}

/**
 * @param {string} versionRange
 * @returns {string}
 */
function stripRangeSpecifier(versionRange) {
  return versionRange.replace(/^[\^~>=<]+\s*/, '').trim();
}

/**
 * Build the name@version → ISO publish-date map for the override targets.
 * Targets are typically NOT in the outdated set (per architect note B for
 * RFC-001 T4) so each override gets a targeted registry fetch. Registry
 * failures surface as missing entries; the overrides-hygiene module emits
 * ageDays: null in that case, preserving the ADR-0003 / ADR-0004
 * informational-surface exit-code contract.
 * @param {Record<string, unknown>} overrides
 * @param {function} fetchVersionTimes
 * @returns {Promise<Record<string, string>>}
 */
async function collectOverrideVersionTimes(overrides, fetchVersionTimes) {
  const result = new Map();
  for (const [name, value] of Object.entries(overrides)) {
    const exact = extractPinnedExact(value);
    if (!exact) continue;
    const iso = await lookupVersionIso(name, exact, fetchVersionTimes);
    if (iso) result.set(`${name}@${exact}`, iso);
  }
  return Object.fromEntries(result);
}

/**
 * Resolve a single override's publish ISO via the registry helper. Errors
 * degrade silently per the surrounding informational-surface contract.
 * @param {string} name
 * @param {string} exact
 * @param {function} fetchVersionTimes
 * @returns {Promise<string|null>}
 */
async function lookupVersionIso(name, exact, fetchVersionTimes) {
  try {
    const fetched = await fetchVersionTimes(name);
    if (!fetched) return null;
    const iso = Reflect.get(fetched, exact);
    return typeof iso === 'string' ? iso : null;
  } catch {
    return null;
  }
}

/**
 * Fetch the project-level audit payload exactly once when any consuming
 * surface is enabled. Returns the empty-shape payload when both surfaces
 * are off so downstream resolvers stay shape-stable.
 * @param {{ unfixable?: boolean, overridesHygiene?: boolean, runProjectAudit?: () => Promise<{ vulnerabilities: Record<string, object> }> }} options
 * @param {boolean} updateMode - update mode skips audit cost
 * @returns {Promise<{ vulnerabilities: Record<string, object> }>}
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-AUDIT-XREF
 */
async function fetchSharedAudit(options, updateMode) {
  const unfixableOn = options.unfixable === true && !updateMode;
  const overridesOn = options.overridesHygiene !== false;
  if (!unfixableOn && !overridesOn) return { vulnerabilities: {} };
  const runner = options.runProjectAudit ?? defaultRunProjectAudit;
  return runner();
}

/**
 * Print outdated dependencies information with age
 * @param {Record<string, { current: string; wanted: string; latest: string }>} data
 * @param {{ fetchVersionTimes?: function, calculateAgeInDays?: function, checkVulnerabilities?: function, format?: string, prodMinAge?: number, devMinAge?: number, prodMinSeverity?: string, devMinSeverity?: string, returnSummary?: boolean, updateMode?: boolean, skipConfirmation?: boolean, exclude?: Record<string, string>, unfixable?: boolean, unfixableLevel?: string, overridesHygiene?: boolean, runProjectAudit?: () => Promise<{ vulnerabilities: Record<string, object> }>, runOverridesHygieneFn?: function }} [options]
 * @param {object} [options] - Options object containing CLI and function overrides.
 * @returns {Promise<Object|undefined>} summary for xml mode or if returnSummary is true
 * @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-NPM-COMMAND
 * @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-OUTPUT-DISPLAY
 * @supports prompts/003.0-DEV-IDENTIFY-OUTDATED.md REQ-SMART-SEARCH
 * @supports prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md REQ-AUDIT-CHECK
 * @supports prompts/008.0-DEV-JSON-OUTPUT.md REQ-CLI-FLAG
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-CLI-FLAG
 * @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-UPDATE-FLAG
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-PIPELINE-WIRE
 */
export async function printOutdated(data, options = {}) {
  const fetchVersionTimes = options.fetchVersionTimes || defaultFetchVersionTimes;
  const calculateAgeInDays = options.calculateAgeInDays || defaultCalculateAgeInDays;
  const checkVulnerabilities = options.checkVulnerabilities || defaultCheckVulnerabilities;
  const format = options.format || 'table';
  const returnSummary = options.returnSummary === true;
  const updateMode = options.updateMode === true;
  const skipConfirmation = options.skipConfirmation === true;
  const excludeMap = options.exclude || {};

  // Configurable thresholds - support both old and new parameter names
  const prodMinAge = typeof options.prodMinAge === 'number' ? options.prodMinAge : 7;
  const devMinAge = typeof options.devMinAge === 'number' ? options.devMinAge : 7;
  const prodMinSeverity = options.prodMinSeverity || 'none';
  const devMinSeverity = options.devMinSeverity || 'none';
  const thresholds = /** @type {any} */ (getThresholds(prodMinAge, prodMinSeverity, devMinAge, devMinSeverity));

  // Load package.json: dependency classification + overrides for RFC-001 surface.
  const packageJson = loadPackageJsonModule.loadPackageJson();
  const { dependencies: prodDeps } = packageJson;
  /** @story prompts/007.0-DEV-SEPARATE-PROD-DEV-THRESHOLDS.md */
  const getDependencyType = (/** @type {string} */ packageName) => (packageName in prodDeps ? 'prod' : 'dev');

  // @supports prompts/015.0-DEV-EXCLUDE-PACKAGES.md REQ-EXCLUDE-FILTER
  const filteredData = applyExclusions(data, excludeMap);

  // Shared audit fetch — both the unfixable and overrides-hygiene surfaces
  // consume the same payload so we never re-spawn `npm audit` per RFC-001
  // REQ-OVERRIDES-AUDIT-XREF.
  const auditData = await fetchSharedAudit(options, updateMode);

  const entries = Object.entries(filteredData);

  // No outdated dependencies
  // @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-OUTPUT-DISPLAY
  if (entries.length === 0) {
    // Transitive vulns can exist even with zero outdated direct deps, so the
    // unfixable surface still runs here (safe-update set is empty). The
    // overrides-hygiene surface likewise runs — overrides are independent of
    // npm-outdated's list.
    const unfixable = await resolveUnfixable(new Set(), options, false, auditData);
    const overridesHygiene = await resolveOverridesHygiene({
      packageJson,
      outdatedData: filteredData,
      auditData,
      options,
    });
    return handleNoOutdated({ format, returnSummary, thresholds, excludeMap, unfixable, overridesHygiene });
  }

  // Build rows
  const rows = await buildRows(filteredData, {
    fetchVersionTimes,
    calculateAgeInDays,
    getDependencyType,
    format,
  });

  // Apply filters
  const { safeRows, matureRows, vulnMap, filterReasonMap, summary } = await applyFilters(rows, {
    prodMinAge,
    devMinAge,
    prodMinSeverity,
    devMinSeverity,
    checkVulnerabilities,
    format,
  });

  // @supports prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md REQ-UNFIXABLE-DETECT
  // The absence of a package from safeRows is the unfixable signal (ADR-0018).
  // resolveUnfixable returns [] (and skips the audit) in update mode.
  const unfixable = await resolveUnfixable(new Set(safeRows.map((row) => row[0])), options, updateMode, auditData);

  // @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-PIPELINE-WIRE REQ-OVERRIDES-TABLE REQ-OVERRIDES-JSON REQ-OVERRIDES-XML
  // T5: capture the findings and thread them into each formatter handler so
  // the additive section renders in table / JSON / XML output.
  const overridesHygiene = await resolveOverridesHygiene({
    packageJson,
    outdatedData: filteredData,
    auditData,
    options,
  });

  // @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-EXIT-CODE-LOGIC
  // T6: surface override-pin safe-upgrade count in the summary so the CLI can
  // OR it into the existing safeUpdates exit-1 trigger per RFC-001 Scope item 7.
  /** @type {any} */ (summary).overridesWithSafeUpgrade = countOverridesWithSafeUpgrade(overridesHygiene);

  return dispatchFormatter({
    format,
    updateMode,
    skipConfirmation,
    rows,
    safeRows,
    matureRows,
    summary,
    thresholds,
    vulnMap,
    filterReasonMap,
    excludeMap,
    unfixable,
    overridesHygiene,
    prodMinAge,
    devMinAge,
    returnSummary,
  });
}

/**
 * Route the post-applyFilters context to the right output handler. Extracted
 * from printOutdated to keep that function within the project's max-lines cap.
 * @param {object} ctx
 * @returns {Promise<object|undefined>}
 * @supports prompts/008.0-DEV-JSON-OUTPUT.md REQ-CLI-FLAG
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-CLI-FLAG
 * @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-UPDATE-FLAG
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-TABLE REQ-OVERRIDES-JSON REQ-OVERRIDES-XML
 */
async function dispatchFormatter(ctx) {
  const {
    format,
    updateMode,
    skipConfirmation,
    rows,
    safeRows,
    matureRows,
    summary,
    thresholds,
    vulnMap,
    filterReasonMap,
    excludeMap,
    unfixable,
    overridesHygiene,
    prodMinAge,
    devMinAge,
    returnSummary,
  } = ctx;
  const sharedOpts = { summary, thresholds, vulnMap, filterReasonMap, excludeMap, unfixable, overridesHygiene };
  if (format === 'json') return handleJsonOutput({ rows: safeRows, ...sharedOpts });
  if (updateMode) return updatePackages(safeRows, skipConfirmation, summary);
  if (format === 'xml') return handleXmlOutput({ rows, ...sharedOpts });
  return handleTableOutput({
    safeRows,
    matureRows,
    summary,
    prodMinAge,
    devMinAge,
    returnSummary,
    excludeMap,
    unfixable,
    overridesHygiene,
  });
}
