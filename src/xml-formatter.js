// xml-formatter.js
// Formats outdated dependencies and summary data into XML

/**
 * Escape special XML characters in a string
 * @param {string} unsafe
 * @returns {string}
 */
function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Format data into XML string
 * @param {{ rows: Array<Array<any>>, summary: { totalOutdated: number, safeUpdates: number, filteredByAge: number, filteredBySecurity: number, minAge: number }, timestamp: string }} params
 * @returns {string} XML string
 */
export function xmlFormatter({ rows, summary, timestamp }) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += `<outdated-packages timestamp="${escapeXml(timestamp)}">\n`;
  xml += '  <packages>\n';
  for (const row of rows) {
    const [name, current, wanted, latest, age] = row;
    xml += '    <package>\n';
    xml += `      <name>${escapeXml(String(name))}</name>\n`;
    xml += `      <current>${escapeXml(String(current))}</current>\n`;
    xml += `      <wanted>${escapeXml(String(wanted))}</wanted>\n`;
    xml += `      <latest>${escapeXml(String(latest))}</latest>\n`;
    xml += `      <age>${age}</age>\n`;
    xml += '    </package>\n';
  }
  xml += '  </packages>\n';

  xml += '  <summary>\n';
  xml += `    <total-outdated>${summary.totalOutdated}</total-outdated>\n`;
  xml += `    <safe-updates>${summary.safeUpdates}</safe-updates>\n`;
  xml += `    <filtered-by-age>${summary.filteredByAge}</filtered-by-age>\n`;
  xml += `    <filtered-by-security>${summary.filteredBySecurity}</filtered-by-security>\n`;
  xml += '    <threshold>\n';
  xml += `      <min-age>${summary.minAge}</min-age>\n`;
  xml += '    </threshold>\n';
  xml += '  </summary>\n';

  xml += '</outdated-packages>';
  return xml;
}
