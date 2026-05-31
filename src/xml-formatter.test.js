/**
 * Tests for XML Formatter
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-XML-SCHEMA REQ-COMPLETE-DATA REQ-SUMMARY-STATS REQ-XML-DECLARATION
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-XML REQ-OVERRIDES-SCHEMA-COMPAT REQ-OVERRIDES-AUDIT-ARTEFACT
 */

import { describe, it, expect } from 'vitest';
import { xmlFormatter } from './xml-formatter.js';

describe('Story 009.0-DEV-XML-OUTPUT: xmlFormatter', () => {
  it('[REQ-XML-SCHEMA] [REQ-COMPLETE-DATA] [REQ-SUMMARY-STATS] [REQ-XML-DECLARATION] should produce valid XML with header, root, packages, and summary', () => {
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

describe('Story 017.0-DEV-OVERRIDES-HYGIENE: xmlFormatter overridesHygiene', () => {
  /** @story prompts/017.0-DEV-OVERRIDES-HYGIENE.md */
  const braceFinding = {
    name: 'brace-expansion',
    pinned: '^4.0.1',
    latest: '5.0.6',
    ageDays: 515,
    reason: 'stale-and-vulnerable: 515 days behind, GHSA-f886-m6hf-6m8v',
    advisories: [{ id: 'GHSA-f886-m6hf-6m8v', severity: 'moderate', patchedRange: '>=5.0.5' }],
    safeUpgrade: '5.0.6',
  };

  it('[REQ-OVERRIDES-XML] emits the <overridesHygiene> root with a per-finding <override> child', () => {
    const xml = xmlFormatter({
      rows: [],
      summary: { totalOutdated: 0, safeUpdates: 0, filteredByAge: 0, filteredBySecurity: 0 },
      timestamp: '2026-05-31T00:00:00.000Z',
      overridesHygiene: [braceFinding],
    });
    expect(xml).toContain('<overridesHygiene>');
    expect(xml).toContain('</overridesHygiene>');
    expect(xml).toContain('name="brace-expansion"');
    expect(xml).toContain('id="GHSA-f886-m6hf-6m8v"');
  });

  it('[REQ-OVERRIDES-SCHEMA-COMPAT] omits the <overridesHygiene> element when no findings', () => {
    const xml = xmlFormatter({
      rows: [],
      summary: { totalOutdated: 0, safeUpdates: 0, filteredByAge: 0, filteredBySecurity: 0 },
      timestamp: '2026-05-31T00:00:00.000Z',
      overridesHygiene: [],
    });
    expect(xml).not.toContain('<overridesHygiene>');
  });

  it('[REQ-OVERRIDES-SCHEMA-COMPAT] omits the <overridesHygiene> element when the field is not passed', () => {
    const xml = xmlFormatter({
      rows: [],
      summary: { totalOutdated: 0, safeUpdates: 0, filteredByAge: 0, filteredBySecurity: 0 },
      timestamp: '2026-05-31T00:00:00.000Z',
    });
    expect(xml).not.toContain('<overridesHygiene>');
  });

  it('[REQ-OVERRIDES-SCHEMA-COMPAT] existing <packages> / <summary> / <unfixable> sections are unchanged when overridesHygiene is added', () => {
    const xml = xmlFormatter({
      rows: [['pkg', '1.0.0', '1.1.0', '1.1.0', 10]],
      summary: { totalOutdated: 1, safeUpdates: 1, filteredByAge: 0, filteredBySecurity: 0 },
      timestamp: '2026-05-31T00:00:00.000Z',
      unfixable: [{ name: 'left-pad', severity: 'low', advisory: 'GHSA-x', reason: 'r', via: ['a'] }],
      overridesHygiene: [braceFinding],
    });
    expect(xml).toContain('<packages>');
    expect(xml).toContain('<name>pkg</name>');
    expect(xml).toContain('<unfixable>');
    expect(xml).toContain('<overridesHygiene>');
    // Order: packages → summary → … → unfixable → overridesHygiene
    expect(xml.indexOf('<unfixable>')).toBeLessThan(xml.indexOf('<overridesHygiene>'));
  });
});
