/**
 * Tests for prepareJsonItems mapping logic
 * @supports prompts/008.0-DEV-JSON-OUTPUT.md REQ-COMPLETE-DATA
 * @supports prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md REQ-EXPOSURE-REPORT-MODIFIED REQ-EXPOSURE-JSON REQ-EXPOSURE-OFF-BY-DEFAULT-PRESERVED
 */

import { describe, it, expect } from 'vitest';
import { prepareJsonItems } from './output-utils.js';

describe('Story 008.0-DEV-JSON-OUTPUT: prepareJsonItems mapping logic', () => {
  const thresholds = { prod: { minAge: 5, minSeverity: 'none' }, dev: { minAge: 3, minSeverity: 'none' } };
  const severityWeights = { none: 0, low: 1, moderate: 2, high: 3, critical: 4 };

  it('[REQ-COMPLETE-DATA] returns filtered by age when age < minAge for prod and no vulnerabilities', () => {
    const rows = [['pkg1', '1.0.0', '1.1.0', '1.1.0', 2, 'prod']];
    const vulnMap = new Map();
    const filterReasonMap = new Map();

    const items = prepareJsonItems(rows, thresholds, vulnMap, filterReasonMap);
    expect(items).toHaveLength(1);
    const item = items[0];
    expect(item.name).toBe('pkg1');
    expect(item.age).toBe(2);
    expect(item.filtered).toBe(true);
    expect(item.filterReason).toBe('age');
    expect(item.vulnerabilities.count).toBe(0);
  });

  it('[REQ-COMPLETE-DATA] returns filtered by security when vulnerabilities exist and age >= minAge', () => {
    const rows = [['pkg2', '1.0.0', '1.2.0', '1.2.0', 10, 'dev']];
    const mockDetails = [
      { severity: 'high', info: {} },
      { severity: 'low', info: {} },
    ];
    const vulnInfo = { count: 2, maxSeverity: 'high', details: mockDetails };
    const vulnMap = new Map([['pkg2', vulnInfo]]);
    const filterReasonMap = new Map();

    const items = prepareJsonItems(rows, thresholds, vulnMap, filterReasonMap);
    const item = items[0];
    expect(item.age).toBe(10);
    expect(item.vulnerabilities).toBe(vulnInfo);
    expect(item.filtered).toBe(true);
    expect(item.filterReason).toBe('');
  });

  it('[REQ-COMPLETE-DATA] uses filterReasonMap when provided over default age-based reason', () => {
    const rows = [['pkg3', '1.0.0', '2.0.0', '2.0.0', 1, 'dev']];
    const vulnMap = new Map();
    const filterReasonMap = new Map([['pkg3', 'custom']]);

    const items = prepareJsonItems(rows, thresholds, vulnMap, filterReasonMap);
    const item = items[0];
    expect(item.filtered).toBe(true);
    expect(item.filterReason).toBe('custom');
  });

  it('[REQ-COMPLETE-DATA] does not filter when age >= minAge and no vulnerabilities', () => {
    const rows = [['pkg4', '1.0.0', '2.0.0', '2.0.0', 6, 'prod']];
    const vulnMap = new Map();
    const filterReasonMap = new Map();

    const items = prepareJsonItems(rows, thresholds, vulnMap, filterReasonMap);
    const item = items[0];
    expect(item.filtered).toBe(false);
    expect(item.filterReason).toBe('');
  });

  it('[REQ-COMPLETE-DATA] sets age to null when age is not a number', () => {
    const rows = [['pkg5', '1.0.0', '2.0.0', '2.0.0', 'N/A', 'prod']];
    const vulnMap = new Map();
    const filterReasonMap = new Map();

    const items = prepareJsonItems(rows, thresholds, vulnMap, filterReasonMap);
    const item = items[0];
    expect(item.age).toBeNull();
    expect(item.filtered).toBe(false);
  });
});

describe('Story 018.0-DEV-EXPOSURE-AWARE-SOAK: prepareJsonItems viaExposureModifier propagation (RFC-002 T5)', () => {
  const thresholds = { prod: { minAge: 7, minSeverity: 'none' }, dev: { minAge: 7, minSeverity: 'none' } };

  /** @story prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md */
  it('[REQ-EXPOSURE-JSON] attaches viaExposureModifier field to items whose name is in the annotation map', () => {
    const rows = [
      ['critical-pkg', '1.0.0', '1.0.5', '1.0.5', 2, 'prod'],
      ['benign-pkg', '2.0.0', '2.1.0', '2.1.0', 10, 'prod'],
    ];
    const vulnMap = new Map();
    const filterReasonMap = new Map();
    const viaExposureModifierByPackage = new Map([
      [
        'critical-pkg',
        { severity: 'critical', baseSoakDays: 7, effectiveSoakDays: 0, advisories: ['GHSA-aaaa-bbbb-cccc'] },
      ],
    ]);

    const items = prepareJsonItems(rows, thresholds, vulnMap, filterReasonMap, viaExposureModifierByPackage);

    expect(items[0].viaExposureModifier).toEqual({
      severity: 'critical',
      baseSoakDays: 7,
      effectiveSoakDays: 0,
      advisories: ['GHSA-aaaa-bbbb-cccc'],
    });
    expect(items[1]).not.toHaveProperty('viaExposureModifier');
  });

  /** @story prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md */
  it('[REQ-EXPOSURE-OFF-BY-DEFAULT-PRESERVED] omits viaExposureModifier on every item when annotation map is absent', () => {
    const rows = [['critical-pkg', '1.0.0', '1.0.5', '1.0.5', 2, 'prod']];
    const items = prepareJsonItems(rows, thresholds, new Map(), new Map());
    expect(items[0]).not.toHaveProperty('viaExposureModifier');
  });

  /** @story prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md */
  it('[REQ-EXPOSURE-OFF-BY-DEFAULT-PRESERVED] omits viaExposureModifier on every item when annotation map is empty', () => {
    const rows = [['critical-pkg', '1.0.0', '1.0.5', '1.0.5', 2, 'prod']];
    const items = prepareJsonItems(rows, thresholds, new Map(), new Map(), new Map());
    expect(items[0]).not.toHaveProperty('viaExposureModifier');
  });
});
