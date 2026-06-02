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
 * @supports prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md REQ-EXPOSURE-XML REQ-EXPOSURE-OFF-BY-DEFAULT-PRESERVED
 */

import { describe, it, expect } from 'vitest';
import { buildOverridesHygieneSection, buildPackagesSection } from './xml-formatter-utils.js';

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

describe('Story 018.0-DEV-EXPOSURE-AWARE-SOAK: buildPackagesSection viaExposureModifier (RFC-002 T5)', () => {
  /** @story prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md */
  const criticalItem = {
    name: 'critical-pkg',
    current: '1.0.0',
    wanted: '1.0.5',
    latest: '1.0.5',
    recommended: '1.0.5',
    age: 2,
    vulnerabilities: { count: 0, maxSeverity: 'none', details: [] },
    filtered: false,
    filterReason: '',
    dependencyType: 'prod',
    viaExposureModifier: {
      severity: 'critical',
      baseSoakDays: 7,
      effectiveSoakDays: 0,
      advisories: ['GHSA-aaaa-bbbb-cccc'],
    },
  };

  it('[REQ-EXPOSURE-XML] emits a camelCase <viaExposureModifier> child under <package> with nested camelCase elements', () => {
    const xml = buildPackagesSection([criticalItem]);
    expect(xml).toContain('<viaExposureModifier>');
    expect(xml).toContain('</viaExposureModifier>');
    expect(xml).toContain('<severity>critical</severity>');
    expect(xml).toContain('<baseSoakDays>7</baseSoakDays>');
    expect(xml).toContain('<effectiveSoakDays>0</effectiveSoakDays>');
  });

  it('[REQ-EXPOSURE-XML] nests advisories as <advisory> children of <advisories>', () => {
    const xml = buildPackagesSection([criticalItem]);
    expect(xml).toContain('<advisories>');
    expect(xml).toContain('</advisories>');
    expect(xml).toContain('<advisory>GHSA-aaaa-bbbb-cccc</advisory>');
  });

  it('[REQ-EXPOSURE-XML] emits <advisories/> as a self-closed element when the advisories array is empty', () => {
    const item = { ...criticalItem, viaExposureModifier: { ...criticalItem.viaExposureModifier, advisories: [] } };
    const xml = buildPackagesSection([item]);
    expect(xml).toMatch(/<advisories(\s*\/>|>\s*<\/advisories>)/);
  });

  it('[REQ-EXPOSURE-XML] xml-escapes severity / advisory values', () => {
    const item = {
      ...criticalItem,
      viaExposureModifier: {
        severity: 'high',
        baseSoakDays: 7,
        effectiveSoakDays: 3,
        advisories: ['GHSA-<bad>&id'],
      },
    };
    const xml = buildPackagesSection([item]);
    expect(xml).toContain('<advisory>GHSA-&lt;bad&gt;&amp;id</advisory>');
  });

  it('[REQ-EXPOSURE-OFF-BY-DEFAULT-PRESERVED] omits <viaExposureModifier> entirely when the item carries no annotation', () => {
    const noAnnotation = { ...criticalItem };
    delete noAnnotation.viaExposureModifier;
    const xml = buildPackagesSection([noAnnotation]);
    expect(xml).not.toContain('<viaExposureModifier>');
  });
});
