/**
 * Tests for JSON Formatter
 * @supports prompts/008.0-DEV-JSON-OUTPUT.md REQ-JSON-SCHEMA REQ-COMPLETE-DATA REQ-SUMMARY-STATS
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-JSON REQ-OVERRIDES-SCHEMA-COMPAT REQ-OVERRIDES-AUDIT-ARTEFACT
 * @supports prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md REQ-EXPOSURE-JSON REQ-EXPOSURE-OFF-BY-DEFAULT-PRESERVED
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

describe('Story 018.0-DEV-EXPOSURE-AWARE-SOAK: jsonFormatter viaExposureModifier passthrough (RFC-002 T5)', () => {
  /** @story prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md */
  const baseInput = {
    summary: { totalOutdated: 1, safeUpdates: 1, filteredByAge: 0, filteredBySecurity: 0 },
    timestamp: '2026-06-03T00:00:00.000Z',
  };

  /** @story prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md */
  const criticalItem = {
    name: 'critical-pkg',
    dependencyType: 'prod',
    current: '1.0.0',
    wanted: '1.0.5',
    latest: '1.0.5',
    recommended: '1.0.5',
    age: 2,
    vulnerabilities: { count: 0, maxSeverity: 'none', details: [] },
    filtered: false,
    filterReason: '',
    viaExposureModifier: {
      severity: 'critical',
      baseSoakDays: 7,
      effectiveSoakDays: 0,
      advisories: ['GHSA-aaaa-bbbb-cccc'],
    },
  };

  it('[REQ-EXPOSURE-JSON] propagates viaExposureModifier from object-shape items to the packages output', () => {
    const json = jsonFormatter({ ...baseInput, rows: [criticalItem] });
    const obj = JSON.parse(json);
    expect(obj.packages).toHaveLength(1);
    expect(obj.packages[0]).toHaveProperty('viaExposureModifier');
    expect(obj.packages[0].viaExposureModifier).toEqual({
      severity: 'critical',
      baseSoakDays: 7,
      effectiveSoakDays: 0,
      advisories: ['GHSA-aaaa-bbbb-cccc'],
    });
  });

  it('[REQ-EXPOSURE-OFF-BY-DEFAULT-PRESERVED] omits viaExposureModifier when the item carries no annotation', () => {
    const noAnnotation = { ...criticalItem };
    delete noAnnotation.viaExposureModifier;
    const json = jsonFormatter({ ...baseInput, rows: [noAnnotation] });
    const obj = JSON.parse(json);
    expect(obj.packages[0]).not.toHaveProperty('viaExposureModifier');
  });

  it('[REQ-EXPOSURE-JSON] existing per-row fields (name / current / latest / vulnerabilities) are unchanged when viaExposureModifier is present', () => {
    const json = jsonFormatter({ ...baseInput, rows: [criticalItem] });
    const obj = JSON.parse(json);
    expect(obj.packages[0]).toMatchObject({
      name: 'critical-pkg',
      type: 'prod',
      current: '1.0.0',
      wanted: '1.0.5',
      latest: '1.0.5',
      recommended: '1.0.5',
      age: 2,
    });
  });
});
