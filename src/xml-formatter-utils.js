// @ts-check
// Utility functions for xml-formatter.js to build XML sections

/**
 * @typedef {Object} XmlError
 * @property {string} message
 * @property {string} [code]
 * @property {string} [details]
 */

/**
 * @typedef {Object} SummaryOptions
 * @property {number} [totalOutdated]
 * @property {number} [safeUpdates]
 * @property {number} [filteredByAge]
 * @property {number} [filteredBySecurity]
 * @property {number} [minAge]
 */

/**
 * @typedef {Object} ThresholdsOptions
 * @property {{minAge?: number; minSeverity?: string}} [prod]
 * @property {{minAge?: number; minSeverity?: string}} [dev]
 */

/**
 * Escape special XML characters in a string
 * @param {*} unsafe
 * @returns {string}
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-XML-SCHEMA
 */
export function escapeXml(unsafe) {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Build the XML declaration
 * @returns {string}
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-XML-DECLARATION
 */
export function buildXmlDeclaration() {
  return '<?xml version="1.0" encoding="UTF-8"?>\n';
}

/**
 * Build the opening root element with timestamp attribute
 * @param {string} timestamp
 * @returns {string}
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-XML-SCHEMA
 */
export function buildRootStart(timestamp) {
  return `<outdated-packages timestamp="${escapeXml(timestamp)}">\n`;
}

/**
 * Build the closing root element
 * @returns {string}
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-XML-SCHEMA
 */
export function buildRootEnd() {
  return '</outdated-packages>';
}

/**
 * Build XML for error section
 * @param {XmlError} error
 * @returns {string}
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-ERROR-FORMAT
 */
export function buildErrorSection(error) {
  let xml = '  <error>\n';
  xml += `    <message>${escapeXml(error.message)}</message>\n`;
  xml += `    <code>${escapeXml(error.code || '')}</code>\n`;
  // @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-ERROR-FORMAT
  if (error.details) {
    xml += `    <details>${escapeXml(error.details)}</details>\n`;
  }
  xml += '  </error>\n';
  return xml;
}

/**
 * Build XML for packages section
 * @param {Array<any>} rows
 * @returns {string}
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-XML-SCHEMA
 */
export function buildPackagesSection(rows) {
  let xml = '  <packages>\n';
  // @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-XML-SCHEMA
  for (const item of rows) {
    xml += '    <package>\n';
    // @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-XML-SCHEMA
    if (Array.isArray(item)) {
      const [name, current, wanted, latest, age] = item;
      xml += `      <name>${escapeXml(name)}</name>\n`;
      xml += `      <current>${escapeXml(current)}</current>\n`;
      xml += `      <wanted>${escapeXml(wanted)}</wanted>\n`;
      xml += `      <latest>${escapeXml(latest)}</latest>\n`;
      xml += `      <age>${escapeXml(String(age))}</age>\n`;
    } else {
      xml += `      <name>${escapeXml(item.name)}</name>\n`;
      xml += `      <current>${escapeXml(item.current)}</current>\n`;
      xml += `      <wanted>${escapeXml(item.wanted)}</wanted>\n`;
      xml += `      <latest>${escapeXml(item.latest)}</latest>\n`;
      xml += `      <age>${escapeXml(item.age !== null ? String(item.age) : 'N/A')}</age>\n`;
      xml += `      <recommended>${escapeXml(item.recommended)}</recommended>\n`;
      xml += '      <vulnerabilities>\n';
      const vuln = item.vulnerabilities || {};
      const countStr = vuln.count != null ? String(vuln.count) : '';
      const maxSeverity = vuln.maxSeverity || '';
      xml += `        <count>${escapeXml(countStr)}</count>\n`;
      xml += `        <max-severity>${escapeXml(maxSeverity)}</max-severity>\n`;
      xml += '        <details>\n';
      // @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-XML-SCHEMA
      if (Array.isArray(vuln.details)) {
        // @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-XML-SCHEMA
        for (const detail of vuln.details) {
          xml += '          <vulnerability>\n';
          xml += `            <name>${escapeXml(detail.name)}</name>\n`;
          xml += `            <severity>${escapeXml(detail.severity)}</severity>\n`;
          xml += `            <title>${escapeXml(detail.title)}</title>\n`;
          xml += `            <url>${escapeXml(detail.url)}</url>\n`;
          xml += '          </vulnerability>\n';
        }
      }
      xml += '        </details>\n';
      xml += '      </vulnerabilities>\n';
      xml += `      <filtered>${item.filtered === true}</filtered>\n`;
      xml += `      <filter-reason>${escapeXml(item.filterReason || '')}</filter-reason>\n`;
      xml += `      <dependency-type>${escapeXml(item.dependencyType || '')}</dependency-type>\n`;
      // @supports prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md REQ-EXPOSURE-XML REQ-EXPOSURE-OFF-BY-DEFAULT-PRESERVED
      // Omit-when-absent matches the unfixable / overridesHygiene precedent —
      // schema-compatible additive element; consumers that ignore unknown
      // elements continue to operate unchanged.
      if (item.viaExposureModifier) {
        xml += buildViaExposureModifierElement(item.viaExposureModifier);
      }
    }
    xml += '    </package>\n';
  }
  xml += '  </packages>\n';
  return xml;
}

/**
 * Build the per-package `<viaExposureModifier>` element for a row that was
 * age-permitted only by the RFC-002 exposure-aware soak modifier. Mirrors the
 * JSON shape (camelCase tag + child names) for JSON↔XML name-symmetry.
 *
 * @param {{ severity: string, baseSoakDays: number, effectiveSoakDays: number, advisories?: Array<string> }} annotation
 * @returns {string}
 * @supports prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md REQ-EXPOSURE-XML
 */
function buildViaExposureModifierElement(annotation) {
  const { severity, baseSoakDays, effectiveSoakDays, advisories = [] } = annotation;
  let xml = '      <viaExposureModifier>\n';
  xml += `        <severity>${escapeXml(severity)}</severity>\n`;
  xml += `        <baseSoakDays>${escapeXml(String(baseSoakDays))}</baseSoakDays>\n`;
  xml += `        <effectiveSoakDays>${escapeXml(String(effectiveSoakDays))}</effectiveSoakDays>\n`;
  if (advisories.length === 0) {
    xml += '        <advisories/>\n';
  } else {
    xml += '        <advisories>\n';
    for (const advisory of advisories) {
      xml += `          <advisory>${escapeXml(String(advisory))}</advisory>\n`;
    }
    xml += '        </advisories>\n';
  }
  xml += '      </viaExposureModifier>\n';
  return xml;
}

/**
 * Build XML for summary section
 * @param {SummaryOptions} [summary]
 * @returns {string}
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-SUMMARY-STATS
 */
export function buildSummarySection({
  totalOutdated = 0,
  safeUpdates = 0,
  filteredByAge = 0,
  filteredBySecurity = 0,
  minAge,
} = {}) {
  let xml = '  <summary>\n';
  xml += `    <total-outdated>${escapeXml(String(totalOutdated))}</total-outdated>\n`;
  xml += `    <safe-updates>${escapeXml(String(safeUpdates))}</safe-updates>\n`;
  xml += `    <filtered-by-age>${escapeXml(String(filteredByAge))}</filtered-by-age>\n`;
  xml += `    <filtered-by-security>${escapeXml(String(filteredBySecurity))}</filtered-by-security>\n`;
  // @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-SUMMARY-STATS
  if (minAge != null) {
    xml += `    <min-age>${escapeXml(String(minAge))}</min-age>\n`;
  }
  xml += '  </summary>\n';
  return xml;
}

/**
 * Build XML for thresholds section
 * @param {ThresholdsOptions} [thresholds]
 * @returns {string}
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-XML-SCHEMA
 */
export function buildThresholdsSection({ prod, dev } = {}) {
  let xml = '  <thresholds>\n';
  // @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-XML-SCHEMA
  if (prod) {
    xml += '    <prod>\n';
    // @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-XML-SCHEMA
    if (prod.minAge != null) {
      xml += `      <min-age>${escapeXml(String(prod.minAge))}</min-age>\n`;
    }
    // @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-XML-SCHEMA
    if (prod.minSeverity != null) {
      xml += `      <min-severity>${escapeXml(prod.minSeverity)}</min-severity>\n`;
    }
    xml += '    </prod>\n';
  }
  // @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-XML-SCHEMA
  if (dev) {
    xml += '    <dev>\n';
    // @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-XML-SCHEMA
    if (dev.minAge != null) {
      xml += `      <min-age>${escapeXml(String(dev.minAge))}</min-age>\n`;
    }
    // @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-XML-SCHEMA
    if (dev.minSeverity != null) {
      xml += `      <min-severity>${escapeXml(dev.minSeverity)}</min-severity>\n`;
    }
    xml += '    </dev>\n';
  }
  xml += '  </thresholds>\n';
  return xml;
}

/**
 * Build XML for excluded packages section
 * @param {Array<{ name: string, reason: string }>} excluded
 * @returns {string}
 * @supports prompts/015.0-DEV-EXCLUDE-PACKAGES.md REQ-EXCLUDE-OUTPUT
 */
export function buildExcludedSection(excluded) {
  let xml = '  <excluded>\n';
  for (const { name, reason } of excluded) {
    xml += '    <package>\n';
    xml += `      <name>${escapeXml(name)}</name>\n`;
    xml += `      <reason>${escapeXml(reason)}</reason>\n`;
    xml += '    </package>\n';
  }
  xml += '  </excluded>\n';
  return xml;
}

/**
 * Build XML for the known-vulnerable-but-unfixable section.
 * @param {Array<{ name: string, severity: string, advisory: string, reason: string, via: Array<string> }>} unfixable
 * @returns {string}
 * @supports prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md REQ-UNFIXABLE-XML
 */
export function buildUnfixableSection(unfixable) {
  let xml = '  <unfixable>\n';
  for (const { name, severity, advisory, reason, via } of unfixable) {
    xml += `    <vulnerability name="${escapeXml(name)}" severity="${escapeXml(severity)}" advisory="${escapeXml(advisory)}" reason="${escapeXml(reason)}">\n`;
    xml += '      <via>\n';
    for (const step of via || []) {
      xml += `        <step>${escapeXml(step)}</step>\n`;
    }
    xml += '      </via>\n';
    xml += '    </vulnerability>\n';
  }
  xml += '  </unfixable>\n';
  return xml;
}

/**
 * Render a nullable scalar as an attribute value. Null/undefined collapses
 * to the empty string so XML never carries the literal text `null`.
 * @param {unknown} value
 * @returns {string}
 */
function attrValue(value) {
  if (value === null || value === undefined) return '';
  return String(value);
}

/**
 * Build XML for the overrides-hygiene section. Element name and field
 * names are camelCase per REQ-OVERRIDES-XML (mirrors the JSON shape).
 * @param {Array<{ name: string, pinned: string|null, latest: string|null, ageDays: number|null, reason: string, advisories: Array<{ id: string, severity: string, patchedRange: string|null }>, safeUpgrade: string|null }>} overridesHygiene
 * @returns {string}
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-XML REQ-OVERRIDES-AUDIT-ARTEFACT
 */
export function buildOverridesHygieneSection(overridesHygiene) {
  let xml = '  <overridesHygiene>\n';
  for (const finding of overridesHygiene) {
    const { name, pinned, latest, ageDays, reason, safeUpgrade, advisories = [] } = finding;
    xml += `    <override name="${escapeXml(attrValue(name))}"`;
    xml += ` pinned="${escapeXml(attrValue(pinned))}"`;
    xml += ` latest="${escapeXml(attrValue(latest))}"`;
    xml += ` ageDays="${escapeXml(attrValue(ageDays))}"`;
    xml += ` reason="${escapeXml(attrValue(reason))}"`;
    xml += ` safeUpgrade="${escapeXml(attrValue(safeUpgrade))}">\n`;
    if (advisories.length === 0) {
      xml += '      <advisories/>\n';
    } else {
      xml += '      <advisories>\n';
      for (const advisory of advisories) {
        xml += `        <advisory id="${escapeXml(attrValue(advisory.id))}"`;
        xml += ` severity="${escapeXml(attrValue(advisory.severity))}"`;
        xml += ` patchedRange="${escapeXml(attrValue(advisory.patchedRange))}"/>\n`;
      }
      xml += '      </advisories>\n';
    }
    xml += '    </override>\n';
  }
  xml += '  </overridesHygiene>\n';
  return xml;
}
