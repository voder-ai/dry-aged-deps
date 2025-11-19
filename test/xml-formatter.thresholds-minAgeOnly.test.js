/**
 * Tests for XML Output Format - partial thresholds values
 * @story prompts/009.0-DEV-XML-OUTPUT.md
 * @req REQ-XML-THRESHOLDS-PARTIAL - Support partial thresholds in XML output
 */

import { describe, it, expect } from 'vitest';
import { xmlFormatter } from '../src/xml-formatter.js';

describe('xmlFormatter thresholds partial values', () => {
  const summary = {
    totalOutdated: 0,
    safeUpdates: 0,
    filteredByAge: 0,
    filteredBySecurity: 0,
  };
  const timestamp = '2025-01-01T00:00:00.000Z';

  it('renders only min-age when prod.minSeverity is undefined', () => {
    const thresholds = { prod: { minAge: 5 } };
    const xml = xmlFormatter({ rows: [], summary, thresholds, timestamp });

    expect(xml).toContain('<thresholds>');
    expect(xml).toContain('<prod>');
    expect(xml).toContain('<min-age>5</min-age>');
    expect(xml).not.toContain('<min-severity>');
    expect(xml).not.toContain('<dev>');
  });

  it('renders only min-severity when dev.minAge is undefined', () => {
    const thresholds = { dev: { minSeverity: 'critical' } };
    const xml = xmlFormatter({ rows: [], summary, thresholds, timestamp });

    expect(xml).toContain('<thresholds>');
    expect(xml).toContain('<dev>');
    expect(xml).toContain('<min-severity>critical</min-severity>');
    expect(xml).not.toContain('<min-age>');
    expect(xml).not.toContain('<prod>');
  });
});
