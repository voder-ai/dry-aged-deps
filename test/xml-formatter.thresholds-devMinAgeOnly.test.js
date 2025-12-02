/* eslint-disable traceability/valid-req-reference , traceability/valid-annotation-format */
/**
 * Tests for XML formatter thresholds dev-only minAge in XML output
 * @story prompts/007.0-DEV-SEPARATE-PROD-DEV-THRESHOLDS.md
 * @req REQ-DEV-MIN-AGE - Dev minAge threshold only in XML formatter
 */

import { describe, it, expect } from 'vitest';
import { xmlFormatter } from '../src/xml-formatter.js';

describe('prompts/007.0-DEV-SEPARATE-PROD-DEV-THRESHOLDS.md: xmlFormatter thresholds dev minAge only', () => {
  it('renders dev <min-age> only when only dev.minAge is provided', () => {
    const summary = {
      totalOutdated: 0,
      safeUpdates: 0,
      filteredByAge: 0,
      filteredBySecurity: 0,
    };
    const thresholds = { dev: { minAge: 4 } };
    const timestamp = '2025-02-02T02:02:02Z';
    const xml = xmlFormatter({ rows: [], summary, thresholds, timestamp });

    // thresholds section should be present
    expect(xml).toContain('<thresholds>');
    // dev threshold block
    expect(xml).toContain('<dev>');
    expect(xml).toContain('<min-age>4</min-age>');
    // no prod block
    expect(xml).not.toContain('<prod>');
    // no min-severity in dev
    expect(xml).not.toContain('<min-severity>');
  });
});
