/**
 * Tests for prepareJsonItems in output-utils module
 * @story docs/decisions/0002-json-xml-output-support.md
 * @req REQ-JSON-MAPPING - Extract mapping logic for JSON output
 */
import { describe, it, expect } from 'vitest';
import { prepareJsonItems } from '../src/output-utils.js';

describe('prepareJsonItems mapping logic', () => {
  const thresholds = { prod: { minAge: 5, minSeverity: 'none' }, dev: { minAge: 3, minSeverity: 'none' } };
  const severityWeights = { none: 0, low: 1, moderate: 2, high: 3, critical: 4 };

  it('returns filtered by age when age < minAge for prod and no vulnerabilities', () => {
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

  it('returns filtered by security when vulnerabilities exist and age >= minAge', () => {
    const rows = [['pkg2', '1.0.0', '1.2.0', '1.2.0', 10, 'dev']];
    const mockDetails = [ { severity: 'high', info: {} }, { severity: 'low', info: {} } ];
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

  it('uses filterReasonMap when provided over default age-based reason', () => {
    const rows = [['pkg3', '1.0.0', '2.0.0', '2.0.0', 1, 'dev']];
    const vulnMap = new Map();
    const filterReasonMap = new Map([['pkg3', 'custom']]);

    const items = prepareJsonItems(rows, thresholds, vulnMap, filterReasonMap);
    const item = items[0];
    expect(item.filtered).toBe(true);
    expect(item.filterReason).toBe('custom');
  });

  it('does not filter when age >= minAge and no vulnerabilities', () => {
    const rows = [['pkg4', '1.0.0', '2.0.0', '2.0.0', 6, 'prod']];
    const vulnMap = new Map();
    const filterReasonMap = new Map();

    const items = prepareJsonItems(rows, thresholds, vulnMap, filterReasonMap);
    const item = items[0];
    expect(item.filtered).toBe(false);
    expect(item.filterReason).toBe('');
  });

  it('sets age to null when age is not a number', () => {
    const rows = [['pkg5', '1.0.0', '2.0.0', '2.0.0', 'N/A', 'prod']];
    const vulnMap = new Map();
    const filterReasonMap = new Map();

    const items = prepareJsonItems(rows, thresholds, vulnMap, filterReasonMap);
    const item = items[0];
    expect(item.age).toBeNull();
    expect(item.filtered).toBe(false);
  });
});