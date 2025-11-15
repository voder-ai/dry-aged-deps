/** @story prompts/dry-aged-deps-user-story-map.md */

import { describe, it, expect } from 'vitest';
import { xmlFormatter } from '../src/xml-formatter.js';

describe('xmlFormatter summary section', () => {
  it('should include <min-age> element when summary.minAge is provided', () => {
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
