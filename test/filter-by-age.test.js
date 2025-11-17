/* eslint-disable traceability/valid-story-reference -- TODO: Fix story file reference */

/**
 * Tests for filterByAge function behavior.
 * @story prompts/003.0-DEV-FILTER-MATURE-VERSIONS.md
 * @req REQ-AGE-THRESHOLD - enforce minimum age threshold for filtering
 */

import { describe, it, expect } from 'vitest';
import { filterByAge } from '../src/filter-by-age.js';

describe('filterByAge', () => {
  it('includes only rows where age >= prodMinAge for prod dependencies and devMinAge for dev dependencies', () => {
    const rows = [
      ['a', '1.0.0', '1.1.0', '1.1.0', 10, 'prod'],
      ['b', '1.0.0', '1.1.0', '1.1.0', 5, 'prod'],
      ['c', '2.0.0', '2.1.0', '2.1.0', 8, 'dev'],
      ['d', '2.0.0', '2.1.0', '2.1.0', 3, 'dev'],
      ['e', '3.0.0', '3.1.0', '3.1.0', 'N/A', 'prod'],
      ['f', '3.0.0', '3.1.0', '3.1.0', null, 'dev'],
    ];
    const thresholds = { prodMinAge: 7, devMinAge: 7 };
    const result = filterByAge(rows, thresholds);
    expect(result).toEqual([
      ['a', '1.0.0', '1.1.0', '1.1.0', 10, 'prod'],
      ['c', '2.0.0', '2.1.0', '2.1.0', 8, 'dev'],
    ]);
  });

  it('respects configurable thresholds for both prod and dev', () => {
    const rows = [
      ['a', '1.0.0', '1.2.0', '1.2.0', 6, 'prod'],
      ['b', '1.0.0', '1.2.0', '1.2.0', 4, 'dev'],
      ['c', '1.0.0', '1.2.0', '1.2.0', 5, 'dev'],
      ['d', '1.0.0', '1.2.0', '1.2.0', 7, 'prod'],
    ];
    const thresholds = { prodMinAge: 5, devMinAge: 5 };
    const result = filterByAge(rows, thresholds);
    expect(result).toEqual([
      ['a', '1.0.0', '1.2.0', '1.2.0', 6, 'prod'],
      ['c', '1.0.0', '1.2.0', '1.2.0', 5, 'dev'],
      ['d', '1.0.0', '1.2.0', '1.2.0', 7, 'prod'],
    ]);
  });
});
