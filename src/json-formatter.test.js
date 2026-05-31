/**
 * Tests for JSON Formatter
 * @supports prompts/008.0-DEV-JSON-OUTPUT.md REQ-JSON-SCHEMA REQ-COMPLETE-DATA REQ-SUMMARY-STATS
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-JSON REQ-OVERRIDES-SCHEMA-COMPAT REQ-OVERRIDES-AUDIT-ARTEFACT
 */

import { describe, it, expect } from 'vitest';
import { jsonFormatter } from './json-formatter.js';

describe('Story 008.0-DEV-JSON-OUTPUT: jsonFormatter', () => {
  it('[REQ-JSON-SCHEMA] [REQ-COMPLETE-DATA] [REQ-SUMMARY-STATS] should produce valid JSON with timestamp, packages, and summary', () => {
    const rows = [
      ['pkg1', '1.0.0', '1.1.0', '1.1.0', 10],
      ['pkg2', '2.0.0', '2.2.0', '2.2.0', 8],
    ];
    const summary = {
      totalOutdated: 2,
      safeUpdates: 2,
      filteredByAge: 0,
      filteredBySecurity: 0,
    };
    const thresholds = {
      prod: { minAge: 7, minSeverity: 'none' },
      dev: { minAge: 7, minSeverity: 'none' },
    };
    const timestamp = '2024-01-01T00:00:00.000Z';
    const json = jsonFormatter({ rows, summary, thresholds, timestamp });
    // Should be parseable JSON
    let obj;
    expect(() => {
      obj = JSON.parse(json);
    }).not.toThrow();

    expect(obj).toHaveProperty('timestamp', timestamp);
    expect(obj).toHaveProperty('packages');
    expect(Array.isArray(obj.packages)).toBe(true);
    expect(obj.packages.length).toBe(2);
    expect(obj.packages[0]).toEqual({
      name: 'pkg1',
      current: '1.0.0',
      wanted: '1.1.0',
      latest: '1.1.0',
      age: 10,
    });
    expect(obj).toHaveProperty('summary');
    expect(obj.summary).toEqual({
      ...summary,
      thresholds,
    });
    // Ensure formatted with indentation
    expect(json.startsWith('{\n  "timestamp"')).toBe(true);
  });
});

describe('Story 017.0-DEV-OVERRIDES-HYGIENE: jsonFormatter overridesHygiene', () => {
  /** @story prompts/017.0-DEV-OVERRIDES-HYGIENE.md */
  const baseInput = {
    rows: [],
    summary: { totalOutdated: 0, safeUpdates: 0, filteredByAge: 0, filteredBySecurity: 0 },
    timestamp: '2026-05-31T00:00:00.000Z',
  };

  /** @story prompts/017.0-DEV-OVERRIDES-HYGIENE.md */
  const braceFinding = {
    name: 'brace-expansion',
    pinned: '^4.0.1',
    latest: '5.0.6',
    ageDays: 515,
    reason: 'stale-and-vulnerable: 515 days behind, GHSA-f886-m6hf-6m8v',
    advisories: [{ id: 'GHSA-f886-m6hf-6m8v', severity: 'moderate', patchedRange: '>=5.0.5' }],
    safeUpgrade: '5.0.6',
  };

  it('[REQ-OVERRIDES-JSON] emits a top-level overridesHygiene array with the spec field shape', () => {
    const json = jsonFormatter({ ...baseInput, overridesHygiene: [braceFinding] });
    const obj = JSON.parse(json);
    expect(obj).toHaveProperty('overridesHygiene');
    expect(Array.isArray(obj.overridesHygiene)).toBe(true);
    expect(obj.overridesHygiene).toHaveLength(1);
    expect(obj.overridesHygiene[0]).toEqual({
      name: 'brace-expansion',
      pinned: '^4.0.1',
      latest: '5.0.6',
      ageDays: 515,
      reason: 'stale-and-vulnerable: 515 days behind, GHSA-f886-m6hf-6m8v',
      advisories: [{ id: 'GHSA-f886-m6hf-6m8v', severity: 'moderate', patchedRange: '>=5.0.5' }],
      safeUpgrade: '5.0.6',
    });
  });

  it('[REQ-OVERRIDES-SCHEMA-COMPAT] omits the overridesHygiene key when the array is empty', () => {
    const json = jsonFormatter({ ...baseInput, overridesHygiene: [] });
    const obj = JSON.parse(json);
    expect(obj).not.toHaveProperty('overridesHygiene');
  });

  it('[REQ-OVERRIDES-SCHEMA-COMPAT] omits the overridesHygiene key when the field is not passed', () => {
    const json = jsonFormatter({ ...baseInput });
    const obj = JSON.parse(json);
    expect(obj).not.toHaveProperty('overridesHygiene');
  });

  it('[REQ-OVERRIDES-SCHEMA-COMPAT] existing rows / summary / unfixable fields are unchanged when overridesHygiene is added', () => {
    const json = jsonFormatter({
      rows: [['pkg', '1.0.0', '1.1.0', '1.1.0', 10]],
      summary: { totalOutdated: 1, safeUpdates: 1, filteredByAge: 0, filteredBySecurity: 0 },
      timestamp: '2026-05-31T00:00:00.000Z',
      unfixable: [{ name: 'left-pad', severity: 'low', advisory: 'GHSA-x', reason: 'r', via: ['a'] }],
      overridesHygiene: [braceFinding],
    });
    const obj = JSON.parse(json);
    expect(obj.packages).toHaveLength(1);
    expect(obj.packages[0]).toMatchObject({ name: 'pkg' });
    expect(obj.summary).toMatchObject({ totalOutdated: 1, safeUpdates: 1 });
    expect(obj.unfixable).toHaveLength(1);
    expect(obj.overridesHygiene).toHaveLength(1);
  });

  it('[REQ-OVERRIDES-AUDIT-ARTEFACT] retains the full advisories array per finding (machine-parseable for audit pipelines)', () => {
    const finding = {
      ...braceFinding,
      advisories: [
        { id: 'GHSA-f886-m6hf-6m8v', severity: 'moderate', patchedRange: '>=5.0.5' },
        { id: 'GHSA-jxxr-4gwj-5jf2', severity: 'high', patchedRange: '>=5.0.6' },
      ],
    };
    const json = jsonFormatter({ ...baseInput, overridesHygiene: [finding] });
    const obj = JSON.parse(json);
    expect(obj.overridesHygiene[0].advisories).toHaveLength(2);
    expect(obj.overridesHygiene[0].advisories.map((a) => a.id)).toEqual(['GHSA-f886-m6hf-6m8v', 'GHSA-jxxr-4gwj-5jf2']);
  });
});
