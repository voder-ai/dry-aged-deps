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
import { severityToModifier } from './exposure-soak-modifier.js';

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
 * @param {{ unfixable?: boolean, overridesHygiene?: boolean, exposureAwareSoak?: boolean, runProjectAudit?: () => Promise<{ vulnerabilities: Record<string, object> }> }} options
 * @param {boolean} updateMode - update mode skips audit cost
 * @returns {Promise<{ vulnerabilities: Record<string, object> }>}
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-AUDIT-XREF
 * @supports prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md REQ-EXPOSURE-AUDIT-INGEST
 */
async function fetchSharedAudit(options, updateMode) {
  const unfixableOn = options.unfixable === true && !updateMode;
  const overridesOn = options.overridesHygiene !== false;
  // RFC-002 T4: exposure-aware-soak also needs the audit payload to compute
  // per-package effective soak. Default-OFF preserves the no-fetch shortcut.
  const exposureOn = options.exposureAwareSoak === true;
  if (!unfixableOn && !overridesOn && !exposureOn) return { vulnerabilities: {} };
  const runner = options.runProjectAudit ?? defaultRunProjectAudit;
  return runner();
}

/**
 * Build the per-package exposure modifier map from the shared audit payload
 * using the RFC-002 §Summary locked policy table. Entries whose severity maps
 * to modifier 1.0 (Moderate / Low / None / unknown) are dropped — they do not
 * shift the effective soak so a map miss in filterByAge already produces the
 * same result.
 * @param {{ vulnerabilities: Record<string, object> }} auditData
 * @returns {Map<string, number>}
 * @supports prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md REQ-EXPOSURE-SEVERITY-EXTRACT REQ-EXPOSURE-POLICY-TABLE REQ-EXPOSURE-PER-PACKAGE-APPLY
 */
function buildExposureModifierByPackage(auditData) {
  const entries = Object.entries(auditData?.vulnerabilities ?? {});
  const modifierEntries = entries
    .map(([name, v]) => /** @type {[string, number]} */ ([name, severityToModifier(/** @type {any} */ (v)?.severity)]))
    .filter(([, modifier]) => modifier !== 1);
  return new Map(modifierEntries);
}

/**
 * Extract a human-readable advisory id (GHSA slug) from an audit `via` entry,
 * falling back to the numeric npm-audit source id. Mirrors the local helper
 * in `src/find-unfixable-vulns.js` — kept inline rather than refactored out
 * to keep T5 scope strict (see architect re-confirm 2026-06-03).
 * @param {{ source?: number|string, url?: string }} viaEntry
 * @returns {string}
 * @supports prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md REQ-EXPOSURE-JSON REQ-EXPOSURE-XML
 */
function advisoryIdFromViaEntry(viaEntry) {
  const url = viaEntry && viaEntry.url;
  if (typeof url === 'string') {
    const match = url.match(/GHSA-[0-9a-z-]+/i);
    if (match) return match[0];
  }
  return String(viaEntry && viaEntry.source != null ? viaEntry.source : 'unknown');
}

/**
 * Build the per-package severity + advisory-id sidecar from the shared audit
 * payload. Only Critical and High entries are kept — they are the only bands
 * whose modifier shortens the soak and therefore the only bands that can
 * surface a `viaExposureModifier` annotation on a safe-update row.
 *
 * @param {{ vulnerabilities: Record<string, object> }} auditData
 * @returns {Map<string, { severity: 'critical'|'high', advisoryIds: Array<string> }>}
 * @supports prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md REQ-EXPOSURE-SEVERITY-EXTRACT REQ-EXPOSURE-REPORT-MODIFIED REQ-EXPOSURE-JSON REQ-EXPOSURE-XML
 */
function buildExposureMetaByPackage(auditData) {
  /** @type {Map<string, { severity: 'critical'|'high', advisoryIds: Array<string> }>} */
  const meta = new Map();
  const entries = Object.entries(auditData?.vulnerabilities ?? {});
  for (const [name, v] of entries) {
    const vuln = /** @type {{ severity?: string, via?: Array<any> }} */ (v);
    const severity = vuln?.severity;
    if (severity !== 'critical' && severity !== 'high') continue;
    const via = Array.isArray(vuln.via) ? vuln.via : [];
    const advisoryIds = via
      .filter((entry) => entry && typeof entry === 'object' && entry.source != null)
      .map((entry) => advisoryIdFromViaEntry(entry));
    meta.set(name, { severity, advisoryIds });
  }
  return meta;
}

/**
 * Resolve the RFC-002 T4 modifier map (filter-time soak shortening) and the
 * T5 meta sidecar (formatter-time annotation) in a single pass. Extracted
 * from printOutdated to keep that function within the project's
 * max-lines-per-function cap; mirrors the resolveUnfixable / resolveOverridesHygiene
 * extraction pattern. Default-OFF returns `{ undefined, empty Map }` so the
 * downstream filter pipeline and formatter rendering both behave identically
 * to the pre-RFC-002 surface per REQ-EXPOSURE-OFF-BY-DEFAULT-PRESERVED.
 *
 * @param {{ exposureAwareSoak?: boolean }} options
 * @param {{ vulnerabilities: Record<string, object> }} auditData
 * @returns {{ exposureModifierByPackage: Map<string, number>|undefined, exposureMetaByPackage: Map<string, { severity: 'critical'|'high', advisoryIds: Array<string> }> }}
 * @supports prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md REQ-EXPOSURE-PER-PACKAGE-APPLY REQ-EXPOSURE-OFF-BY-DEFAULT-PRESERVED REQ-EXPOSURE-REPORT-MODIFIED
 */
function resolveExposureMaps(options, auditData) {
  if (options.exposureAwareSoak !== true) {
    return { exposureModifierByPackage: undefined, exposureMetaByPackage: new Map() };
  }
  return {
    exposureModifierByPackage: buildExposureModifierByPackage(auditData),
    exposureMetaByPackage: buildExposureMetaByPackage(auditData),
  };
}

/**
 * Compute the per-package `viaExposureModifier` annotation for each safe-update
 * row that was age-permitted ONLY because of the exposure-aware modifier — i.e.
 * rows whose `age` would have failed the unconditional soak (`age < baseMinAge`)
 * but whose name appears in the exposure-meta map (Critical or High band).
 *
 * Shape: `{ severity, baseSoakDays, effectiveSoakDays, advisories }` per
 * REQ-EXPOSURE-JSON / REQ-EXPOSURE-XML. Returns an empty map when nothing is
 * annotated — preserves byte-identical default-OFF output via the formatter's
 * omit-when-absent contract.
 *
 * @param {object} params
 * @param {Array<[string, string, string, string, number|string, string]>} params.safeRows
 * @param {Map<string, { severity: 'critical'|'high', advisoryIds: Array<string> }>} params.exposureMetaByPackage
 * @param {number} params.prodMinAge
 * @param {number} params.devMinAge
 * @returns {Map<string, { severity: 'critical'|'high', baseSoakDays: number, effectiveSoakDays: number, advisories: Array<string> }>}
 * @supports prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md REQ-EXPOSURE-REPORT-MODIFIED REQ-EXPOSURE-JSON REQ-EXPOSURE-XML
 */
function buildViaExposureModifierAnnotations({ safeRows, exposureMetaByPackage, prodMinAge, devMinAge }) {
  /** @type {Map<string, { severity: 'critical'|'high', baseSoakDays: number, effectiveSoakDays: number, advisories: Array<string> }>} */
  const annotations = new Map();
  if (!(exposureMetaByPackage instanceof Map) || exposureMetaByPackage.size === 0) return annotations;
  for (const [name, , , , age, depType] of safeRows) {
    const meta = exposureMetaByPackage.get(name);
    if (!meta) continue;
    if (typeof age !== 'number') continue;
    const baseSoakDays = depType === 'prod' ? prodMinAge : devMinAge;
    if (age >= baseSoakDays) continue;
    const effectiveSoakDays = Math.floor(baseSoakDays * severityToModifier(meta.severity));
    annotations.set(name, {
      severity: meta.severity,
      baseSoakDays,
      effectiveSoakDays,
      advisories: meta.advisoryIds,
    });
  }
  return annotations;
}

/**
 * Print outdated dependencies information with age
 * @param {Record<string, { current: string; wanted: string; latest: string }>} data
 * @param {{ fetchVersionTimes?: function, calculateAgeInDays?: function, checkVulnerabilities?: function, format?: string, prodMinAge?: number, devMinAge?: number, prodMinSeverity?: string, devMinSeverity?: string, returnSummary?: boolean, updateMode?: boolean, skipConfirmation?: boolean, exclude?: Record<string, string>, unfixable?: boolean, unfixableLevel?: string, overridesHygiene?: boolean, exposureAwareSoak?: boolean, runProjectAudit?: () => Promise<{ vulnerabilities: Record<string, object> }>, runOverridesHygieneFn?: function }} [options]
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

  // RFC-002 T4 + T5: opt-in exposure-aware-soak modifier + per-row annotation.
  // Default-OFF leaves exposureModifierByPackage undefined (filterByAge runs
  // unconditional path) and produces an empty annotation Map (formatters render
  // byte-identical legacy output) per REQ-EXPOSURE-OFF-BY-DEFAULT-PRESERVED.
  const { exposureModifierByPackage, exposureMetaByPackage } = resolveExposureMaps(options, auditData);

  // Apply filters
  const { safeRows, matureRows, vulnMap, filterReasonMap, summary } = await applyFilters(rows, {
    prodMinAge,
    devMinAge,
    prodMinSeverity,
    devMinSeverity,
    checkVulnerabilities,
    format,
    exposureModifierByPackage,
  });

  const viaExposureModifierByPackage = buildViaExposureModifierAnnotations({
    safeRows,
    exposureMetaByPackage,
    prodMinAge,
    devMinAge,
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
    viaExposureModifierByPackage,
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
    viaExposureModifierByPackage,
    prodMinAge,
    devMinAge,
    returnSummary,
  } = ctx;
  const sharedOpts = {
    summary,
    thresholds,
    vulnMap,
    filterReasonMap,
    excludeMap,
    unfixable,
    overridesHygiene,
    viaExposureModifierByPackage,
  };
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
    viaExposureModifierByPackage,
  });
}
