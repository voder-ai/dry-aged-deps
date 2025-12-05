/* eslint-disable traceability/require-test-traceability */
/* eslint-disable traceability/valid-req-reference , traceability/valid-annotation-format */
/**
 * Tests for XML Output Format - no thresholds case
 * @story prompts/009.0-DEV-XML-OUTPUT.md
 * @req REQ-THRESHOLDS-CONDITION - Include thresholds only when provided
 */

import { describe, it, expect } from 'vitest';
import { xmlFormatter } from '../src/xml-formatter.js';

describe('prompts/009.0-DEV-XML-OUTPUT.md: xmlFormatter without thresholds', () => {
  it('should not include <thresholds> element when thresholds param is omitted', () => {
    const rows = [];
    const summary = {
      totalOutdated: 0,
      safeUpdates: 0,
      filteredByAge: 0,
      filteredBySecurity: 0,
    };
    const timestamp = '';

    const xml = xmlFormatter({ rows, summary, timestamp });

    // There should be no <thresholds> section in the output
    expect(xml).not.toContain('<thresholds>');
    expect(xml).toContain('<summary>');
    expect(xml).toContain('</summary>');
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml.trim().endsWith('</outdated-packages>')).toBe(true);
  });
});
