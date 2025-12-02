/* eslint-disable traceability/valid-annotation-format */
/**
 * Tests for XML Formatter
 * @story prompts/009.0-DEV-XML-OUTPUT.md
 * @req REQ-XML-SCHEMA - Define consistent XML output schema
 * @req REQ-COMPLETE-DATA - Include all relevant package data in XML output
 * @req REQ-SUMMARY-STATS - Include summary statistics in XML output
 * @req REQ-XML-DECLARATION - Include proper XML declaration and encoding
 */

import { xmlFormatter } from '../src/xml-formatter.js';

describe('prompts/009.0-DEV-XML-OUTPUT.md: xmlFormatter', () => {
  it('should produce valid XML with header, root, packages, and summary', () => {
    const rows = [
      ['pkg1', '1.0.0', '1.1.0', '1.1.0', 10],
      ['pkg2', '2.0.0', '2.1.0', '2.1.0', 8],
    ];
    const summary = {
      totalOutdated: 2,
      safeUpdates: 2,
      filteredByAge: 0,
      filteredBySecurity: 0,
      minAge: 7,
    };
    const timestamp = '2024-01-01T00:00:00.000Z';
    const xml = xmlFormatter({ rows, summary, timestamp });

    // Check XML declaration and root element
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain(`<outdated-packages timestamp="${timestamp}">`);

    // Check packages section
    expect(xml).toContain('<packages>');
    expect(xml.match(/<package>/g).length).toBe(2);
    expect(xml).toContain('<name>pkg1</name>');
    expect(xml).toContain('<age>10</age>');

    // Check summary section
    expect(xml).toContain('<total-outdated>2</total-outdated>');
    expect(xml).toContain('<safe-updates>2</safe-updates>');
    expect(xml).toContain('<filtered-by-age>0</filtered-by-age>');
    expect(xml).toContain('<filtered-by-security>0</filtered-by-security>');
    expect(xml).toContain('<min-age>7</min-age>');

    // Check closing root tag
    expect(xml.trim().endsWith('</outdated-packages>')).toBe(true);
  });
});
