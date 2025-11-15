// Utility functions for xml-formatter.js to build XML sections

/**
 * @typedef {Object} XmlError
 * @property {string} message
 * @property {string} [code]
 * @property {string} [details]
 */

/**
 * Escape special XML characters in a string
 * @param {string} unsafe
 * @returns {string}
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
 */
export function buildXmlDeclaration() {
  return '<?xml version="1.0" encoding="UTF-8"?>\n';
}

/**
 * Build the opening root element with timestamp attribute
 * @param {string} timestamp
 * @returns {string}
 */
export function buildRootStart(timestamp) {
  return `<outdated-packages timestamp="${escapeXml(timestamp)}">\n`;
}

/**
 * Build the closing root element
 * @returns {string}
 */
export function buildRootEnd() {
  return '</outdated-packages>';
}

/**
 * Build XML for error section
 * @param {XmlError} error
 * @returns {string}
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
      xml += `      <age>${escapeXml(age)}</age>\n`;
    } else {
      xml += `      <name>${escapeXml(item.name)}</name>\n`;
      xml += `      <current>${escapeXml(item.current)}</current>\n`;
      xml += `      <wanted>${escapeXml(item.wanted)}</wanted>\n`;
      xml += `      <latest>${escapeXml(item.latest)}</latest>\n`;
      xml += `      <age>${escapeXml(item.age)}</age>\n`;
      xml += `      <recommended>${escapeXml(item.recommended)}</recommended>\n`;
      xml += '      <vulnerabilities>\n';
      const vuln = item.vulnerabilities || {};
      const count = vuln.count != null ? vuln.count : '';
      const maxSeverity = vuln.maxSeverity || '';
      xml += `        <count>${escapeXml(count)}</count>\n`;
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
 * @param {{ totalOutdated?: number; safeUpdates?: number; filteredByAge?: number; filteredBySecurity?: number; minAge?: number }} summary
 * @returns {string}
 */
export function buildSummarySection(summary) {
  let xml = '  <summary>\n';
  xml += `    <total-outdated>${escapeXml(summary.totalOutdated ?? 0)}</total-outdated>\n`;
  xml += `    <safe-updates>${escapeXml(summary.safeUpdates ?? 0)}</safe-updates>\n`;
  xml += `    <filtered-by-age>${escapeXml(summary.filteredByAge ?? 0)}</filtered-by-age>\n`;
  xml += `    <filtered-by-security>${escapeXml(summary.filteredBySecurity ?? 0)}</filtered-by-security>\n`;
  if (summary.minAge != null) {
    xml += `    <min-age>${escapeXml(summary.minAge)}</min-age>\n`;
  }
  xml += '  </summary>\n';
  return xml;
}

/**
 * Build XML for thresholds section
 * @param {{ prod?: { minAge?: number; minSeverity?: string }; dev?: { minAge?: number; minSeverity?: string } }} thresholds
 * @returns {string}
 */
export function buildThresholdsSection(thresholds) {
  let xml = '  <thresholds>\n';
  if (thresholds.prod) {
    xml += '    <prod>\n';
    if (thresholds.prod.minAge != null) {
      xml += `      <min-age>${escapeXml(thresholds.prod.minAge)}</min-age>\n`;
    }
    if (thresholds.prod.minSeverity != null) {
      xml += `      <min-severity>${escapeXml(thresholds.prod.minSeverity)}</min-severity>\n`;
    }
    xml += '    </prod>\n';
  }
  if (thresholds.dev) {
    xml += '    <dev>\n';
    if (thresholds.dev.minAge != null) {
      xml += `      <min-age>${escapeXml(thresholds.dev.minAge)}</min-age>\n`;
    }
    if (thresholds.dev.minSeverity != null) {
      xml += `      <min-severity>${escapeXml(thresholds.dev.minSeverity)}</min-severity>\n`;
    }
    xml += '    </dev>\n';
  }
  xml += '  </thresholds>\n';
  return xml;
}