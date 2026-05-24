/**
 * Tests for unfixable-vulnerability rendering in the JSON and XML formatters.
 * @supports prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md REQ-UNFIXABLE-JSON REQ-UNFIXABLE-XML REQ-UNFIXABLE-SCHEMA-COMPAT
 */

import { describe, it, expect } from 'vitest';
import { jsonFormatter } from '../src/json-formatter.js';
import { xmlFormatter } from '../src/xml-formatter.js';

describe('Story 016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES: formatter rendering', () => {
  const summary = { totalOutdated: 0, safeUpdates: 0, filteredByAge: 0, filteredBySecurity: 0 };
  const unfixable = [
    {
      name: 'brace-expansion',
      severity: 'moderate',
      advisory: 'GHSA-f886-m6hf-6m8v',
      reason: 'vulnerable transitive dependency',
      via: ['GHSA-f886-m6hf-6m8v'],
    },
  ];

  it('[REQ-UNFIXABLE-JSON] adds a top-level unfixable array when present', () => {
    const out = JSON.parse(jsonFormatter({ rows: [], summary, timestamp: 't', unfixable }));
    expect(out.unfixable).toHaveLength(1);
    expect(out.unfixable[0]).toMatchObject({
      name: 'brace-expansion',
      severity: 'moderate',
      advisory: 'GHSA-f886-m6hf-6m8v',
      reason: 'vulnerable transitive dependency',
    });
  });

  it('[REQ-UNFIXABLE-SCHEMA-COMPAT] omits the unfixable key entirely when empty', () => {
    const out = JSON.parse(jsonFormatter({ rows: [], summary, timestamp: 't' }));
    expect('unfixable' in out).toBe(false);
  });

  it('[REQ-UNFIXABLE-XML] adds an <unfixable> element with <vulnerability> children when present', () => {
    const xml = xmlFormatter({ rows: [], summary, timestamp: 't', unfixable });
    expect(xml).toContain('<unfixable>');
    expect(xml).toContain('name="brace-expansion"');
    expect(xml).toContain('severity="moderate"');
    expect(xml).toContain('advisory="GHSA-f886-m6hf-6m8v"');
    expect(xml).toContain('<step>GHSA-f886-m6hf-6m8v</step>');
  });

  it('[REQ-UNFIXABLE-SCHEMA-COMPAT] omits the <unfixable> element entirely when empty', () => {
    const xml = xmlFormatter({ rows: [], summary, timestamp: 't' });
    expect(xml).not.toContain('<unfixable>');
  });
});
