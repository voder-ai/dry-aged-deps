/**
 * Canonical test file for src/xml-formatter-utils.js (P020 stem-match registration).
 * XML builder-level tests for the overrides-hygiene surface (RFC-001 T5).
 *
 * Drives the buildOverridesHygieneSection helper that the xml-formatter
 * composes. Element-shape contract per REQ-OVERRIDES-XML:
 *   <overridesHygiene>
 *     <override name="..." pinned="..." latest="..." ageDays="..." reason="..." safeUpgrade="...">
 *       <advisories>
 *         <advisory id="..." severity="..." patchedRange="..." />
 *       </advisories>
 *     </override>
 *   </overridesHygiene>
 *
 * Mirrors the camelCase tag mandated by the spec (architect-flagged
 * correction at RFC-001 T5 gate review — `<overridesHygiene>`, not
 * `<overrides-hygiene>`, per REQ-OVERRIDES-XML prompts line 40).
 *
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-XML REQ-OVERRIDES-AUDIT-ARTEFACT
 */

import { describe, it, expect } from 'vitest';
import { buildOverridesHygieneSection } from './xml-formatter-utils.js';

describe('Story 017.0-DEV-OVERRIDES-HYGIENE: buildOverridesHygieneSection', () => {
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

  it('[REQ-OVERRIDES-XML] emits a camelCase <overridesHygiene> root with <override> children', () => {
    const xml = buildOverridesHygieneSection([braceFinding]);
    expect(xml).toContain('<overridesHygiene>');
    expect(xml).toContain('</overridesHygiene>');
    expect(xml).toContain('<override');
    expect(xml).toContain('</override>');
    expect(xml).not.toContain('<overrides-hygiene>');
  });

  it('[REQ-OVERRIDES-XML] each <override> carries name / pinned / latest / ageDays / reason / safeUpgrade attributes', () => {
    const xml = buildOverridesHygieneSection([braceFinding]);
    expect(xml).toMatch(/<override\b[^>]*name="brace-expansion"/);
    expect(xml).toContain('pinned="^4.0.1"');
    expect(xml).toContain('latest="5.0.6"');
    expect(xml).toContain('ageDays="515"');
    expect(xml).toContain('reason="stale-and-vulnerable: 515 days behind, GHSA-f886-m6hf-6m8v"');
    expect(xml).toContain('safeUpgrade="5.0.6"');
  });

  it('[REQ-OVERRIDES-XML] advisories nest as <advisory> elements with id / severity / patchedRange', () => {
    const xml = buildOverridesHygieneSection([braceFinding]);
    expect(xml).toContain('<advisories>');
    expect(xml).toContain('</advisories>');
    expect(xml).toMatch(/<advisory\b[^/]*id="GHSA-f886-m6hf-6m8v"/);
    expect(xml).toContain('severity="moderate"');
    expect(xml).toContain('patchedRange="&gt;=5.0.5"');
  });

  it('[REQ-OVERRIDES-XML] null fields (latest / ageDays / safeUpgrade / patchedRange) render as empty strings, not literal "null"', () => {
    const xml = buildOverridesHygieneSection([
      {
        name: 'broken-pkg',
        pinned: null,
        latest: null,
        ageDays: null,
        reason: 'pin-to-malformed-entry',
        advisories: [],
        safeUpgrade: null,
      },
    ]);
    expect(xml).not.toContain('"null"');
    expect(xml).toContain('latest=""');
    expect(xml).toContain('ageDays=""');
    expect(xml).toContain('safeUpgrade=""');
  });

  it('[REQ-OVERRIDES-XML] empty advisories renders as a self-closed or empty <advisories> element (still present for schema stability)', () => {
    const xml = buildOverridesHygieneSection([
      {
        name: 'left-pad',
        pinned: '1.2.0',
        latest: '1.3.0',
        ageDays: 849,
        reason: 'stale: 849 days behind latest',
        advisories: [],
        safeUpgrade: '1.3.0',
      },
    ]);
    // present as <advisories></advisories> or <advisories/>
    expect(xml).toMatch(/<advisories(\s*\/>|>\s*<\/advisories>)/);
  });

  it('[REQ-OVERRIDES-XML] xml-escapes attribute values', () => {
    const xml = buildOverridesHygieneSection([
      {
        name: 'evil&pkg',
        pinned: '<bad>',
        latest: '"quoted"',
        ageDays: 1,
        reason: "stale: 1 days behind 'latest'",
        advisories: [],
        safeUpgrade: null,
      },
    ]);
    expect(xml).toContain('name="evil&amp;pkg"');
    expect(xml).toContain('pinned="&lt;bad&gt;"');
    expect(xml).toContain('latest="&quot;quoted&quot;"');
    expect(xml).toContain('reason="stale: 1 days behind &apos;latest&apos;"');
  });
});
