/**
 * @story prompts/dry-aged-deps-user-story-map.md
 */

import { describe, it, expect } from 'vitest';
import { xmlFormatter } from '../src/xml-formatter.js';

describe('xmlFormatter thresholds dev minAge only', () => {
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
