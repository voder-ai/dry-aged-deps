/**
 * Tests for filterByAge function behavior. Covers the original ADR-0003
 * age-gate semantics plus the RFC-002 T4 per-package exposure-aware-soak
 * override (when an exposure modifier is supplied, the row's effective
 * minAge is `Math.floor(baseMinAge * modifier)` instead of the global value).
 *
 * @supports prompts/003.0-DEV-IDENTIFY-OUTDATED.md REQ-AGE-THRESHOLD REQ-SMART-SEARCH REQ-COMPARISON
 * @supports prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md REQ-EXPOSURE-EFFECTIVE-SOAK REQ-EXPOSURE-PER-PACKAGE-APPLY
 */
import { describe, it, expect } from 'vitest';
import { filterByAge } from './filter-by-age.js';

describe('Story 003.0-DEV-IDENTIFY-OUTDATED: filterByAge', () => {
  it('[REQ-AGE-THRESHOLD] includes only rows where age >= prodMinAge for prod dependencies and devMinAge for dev dependencies', () => {
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

  it('[REQ-AGE-THRESHOLD] respects configurable thresholds for both prod and dev', () => {
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

describe('Story 018.0-DEV-EXPOSURE-AWARE-SOAK: filterByAge with exposureModifierByPackage (RFC-002 T4)', () => {
  it('[REQ-EXPOSURE-PER-PACKAGE-APPLY] applies per-package modifier (Critical → 0-day floor) without affecting sibling packages', () => {
    const rows = [
      ['critical-pkg', '1.0.0', '1.1.0', '1.1.0', 2, 'prod'], // 2 days old, below 7-day soak
      ['untouched-pkg', '1.0.0', '1.1.0', '1.1.0', 2, 'prod'], // also 2 days old, no modifier
      ['high-pkg', '1.0.0', '1.1.0', '1.1.0', 4, 'prod'], // 4 days old, between halved-7 and full-7
      ['untouched-mature', '1.0.0', '1.1.0', '1.1.0', 10, 'prod'], // already past full soak
    ];
    const exposureModifierByPackage = new Map([
      ['critical-pkg', 0], // Critical band → 0-day floor
      ['high-pkg', 0.5], // High band → halved (floor(7 * 0.5) = 3)
    ]);
    const result = filterByAge(rows, { prodMinAge: 7, devMinAge: 7, exposureModifierByPackage });
    expect(result.map((r) => r[0])).toEqual(['critical-pkg', 'high-pkg', 'untouched-mature']);
  });

  it('[REQ-EXPOSURE-EFFECTIVE-SOAK] uses Math.floor on baseMinAge * modifier so the locked High band → 0.5 * default holds', () => {
    const rows = [
      ['exposed', '1.0.0', '1.1.0', '1.1.0', 6, 'prod'], // 6 days
      ['exposed-edge', '1.0.0', '1.1.0', '1.1.0', 7, 'prod'], // 7 days (= floor(15 * 0.5))
    ];
    const exposureModifierByPackage = new Map([
      ['exposed', 0.5],
      ['exposed-edge', 0.5],
    ]);
    // baseMinAge = 15, modifier 0.5 → floor(7.5) = 7 days effective
    const result = filterByAge(rows, { prodMinAge: 15, devMinAge: 15, exposureModifierByPackage });
    expect(result.map((r) => r[0])).toEqual(['exposed-edge']); // 6 < 7 filtered; 7 >= 7 passes
  });

  it('[REQ-EXPOSURE-OFF-BY-DEFAULT-PRESERVED] omitted exposureModifierByPackage preserves byte-identical default behaviour', () => {
    const rows = [
      ['a', '1.0.0', '1.1.0', '1.1.0', 6, 'prod'],
      ['b', '1.0.0', '1.1.0', '1.1.0', 7, 'prod'],
    ];
    const result = filterByAge(rows, { prodMinAge: 7, devMinAge: 7 });
    expect(result.map((r) => r[0])).toEqual(['b']);
  });
});
