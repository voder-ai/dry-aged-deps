/**
 * Tests for XML Output Format - summary section
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-SUMMARY-STATS
 */

import { describe, it, expect } from 'vitest';
import { xmlFormatter } from '../src/xml-formatter.js';

describe('Story 009.0-DEV-XML-OUTPUT: xmlFormatter summary section', () => {
  it('[REQ-SUMMARY-STATS] should include <min-age> element when summary.minAge is provided', () => {
    const summary = {
      totalOutdated: 2,
      safeUpdates: 1,
      filteredByAge: 0,
      filteredBySecurity: 1,
      minAge: 7,
    };
    // Only summary provided; other params default
    const xml = xmlFormatter({ summary });

    // Expect the <min-age> element within the <summary> block
    expect(xml).toMatch(/<summary>[\s\S]*<min-age>7<\/min-age>[\s\S]*<\/summary>/);
  });
});
