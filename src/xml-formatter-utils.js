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
 * @story prompts/009.0-DEV-XML-OUTPUT.md
 * @req REQ-XML-SCHEMA
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
 * @story prompts/009.0-DEV-XML-OUTPUT.md
 * @req REQ-XML-DECLARATION
 */
export function buildXmlDeclaration() {
  return '<?xml version="1.0" encoding="UTF-8"?>\n';
}

/**
 * Build the opening root element with timestamp attribute
 * @param {string} timestamp
 * @returns {string}
 * @story prompts/009.0-DEV-XML-OUTPUT.md
 * @req REQ-XML-SCHEMA
 */
export function buildRootStart(timestamp) {
  return `<outdated-packages timestamp="${escapeXml(timestamp)}">\n`;
}

/**
 * Build the closing root element
 * @returns {string}
 * @story prompts/009.0-DEV-XML-OUTPUT.md
 * @req REQ-XML-SCHEMA
 */
export function buildRootEnd() {
  return '</outdated-packages>';
}

/**
 * Build XML for error section
 * @param {XmlError} error
 * @returns {string}
 * @story prompts/009.0-DEV-XML-OUTPUT.md
 * @req REQ-ERROR-FORMAT
 */
export function buildErrorSection(error) {
  let xml = '  <error>\n';
  xml += `    <message>${escapeXml(error.message)}</message>\n`;
  xml += `    <code>${escapeXml(error.code || '')}</code>\n`;
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
 * @story prompts/009.0-DEV-XML-OUTPUT.md
 * @req REQ-XML-SCHEMA
 */
export function buildPackagesSection(rows) {
  let xml = '  <packages>\n';
  for (const item of rows) {
    xml += '    <package>\n';
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
      if (Array.isArray(vuln.details)) {
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
    }
    xml += '    </package>\n';
  }
  xml += '  </packages>\n';
  return xml;
}

/**
 * Build XML for summary section
 * @param {SummaryOptions} [summary]
 * @returns {string}
 * @story prompts/009.0-DEV-XML-OUTPUT.md
 * @req REQ-SUMMARY-STATS
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
 * @story prompts/009.0-DEV-XML-OUTPUT.md
 * @req REQ-XML-SCHEMA
 */
export function buildThresholdsSection({ prod, dev } = {}) {
  let xml = '  <thresholds>\n';
  if (prod) {
    xml += '    <prod>\n';
    if (prod.minAge != null) {
      xml += `      <min-age>${escapeXml(String(prod.minAge))}</min-age>\n`;
    }
    if (prod.minSeverity != null) {
      xml += `      <min-severity>${escapeXml(prod.minSeverity)}</min-severity>\n`;
    }
    xml += '    </prod>\n';
  }
  if (dev) {
    xml += '    <dev>\n';
    if (dev.minAge != null) {
      xml += `      <min-age>${escapeXml(String(dev.minAge))}</min-age>\n`;
    }
    if (dev.minSeverity != null) {
      xml += `      <min-severity>${escapeXml(dev.minSeverity)}</min-severity>\n`;
    }
    xml += '    </dev>\n';
  }
  xml += '  </thresholds>\n';
  return xml;
}
