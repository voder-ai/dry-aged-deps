/**
 * RFC-001 T7 — live-case regression for the P013-originating brace-expansion
 * mislabel scenario.
 *
 * Exercises the contract boundary between RFC-001 (gap #1 — new
 * overrides-hygiene surface) and ADR-0018 (gap #2 — unfixable-vuln surface,
 * which RFC-001 §Out-of-Scope explicitly leaves untouched). Cross-cutting
 * test: crosses src/overrides-hygiene.js and src/find-unfixable-vulns.js with
 * a shared fixture; co-located under test/ per ADR-0020 narrow exception for
 * cross-module integration shape.
 *
 * The brace-expansion fixture mirrors the P013 live case: an override pin
 * `^4.0.1` that falls inside GHSA-f886-m6hf-6m8v's `>=4.0.0 <5.0.5` range,
 * with a safe upgrade target at 5.0.6.
 *
 * The `vulnerable transitive dependency` string asserted by the boundary
 * is the gap #2 mislabel that RFC-001 deliberately preserves — it will be
 * sharpened by a separate workstream that amends ADR-0018. Do not "fix" the
 * disjointness assertion by widening RFC-001's reason taxonomy.
 *
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-AUDIT-XREF REQ-OVERRIDES-REASON-TAXONOMY
 */

import { describe, it, expect } from 'vitest';
import { runOverridesHygiene } from '../src/overrides-hygiene.js';
import { findUnfixableVulns } from '../src/find-unfixable-vulns.js';

describe('Story 017.0-DEV-OVERRIDES-HYGIENE: P013 brace-expansion mislabel boundary (RFC-001 T7)', () => {
  /** @story prompts/017.0-DEV-OVERRIDES-HYGIENE.md */
  const packageJson = {
    name: 'p013-live-case',
    version: '0.0.0',
    overrides: {
      'brace-expansion': '^4.0.1',
    },
  };

  /** @story prompts/017.0-DEV-OVERRIDES-HYGIENE.md */
  const vulnerabilities = [
    {
      name: 'brace-expansion',
      severity: 'moderate',
      isDirect: false,
      fixAvailable: true,
      via: [
        {
          source: 1115543,
          url: 'https://github.com/advisories/GHSA-f886-m6hf-6m8v',
          severity: 'moderate',
          range: '>=4.0.0 <5.0.5',
        },
      ],
    },
  ];

  /** @story prompts/017.0-DEV-OVERRIDES-HYGIENE.md */
  const auditData = {
    vulnerabilities: {
      'brace-expansion': vulnerabilities[0],
    },
  };

  /** @story prompts/017.0-DEV-OVERRIDES-HYGIENE.md */
  const outdatedData = {
    'brace-expansion': { current: '4.0.1', latest: '5.0.6' },
  };

  /** @story prompts/017.0-DEV-OVERRIDES-HYGIENE.md */
  const versionTimes = {
    'brace-expansion@4.0.1': '2024-01-01T00:00:00Z',
  };

  /** @story prompts/017.0-DEV-OVERRIDES-HYGIENE.md */
  const now = new Date('2026-05-30T00:00:00Z');

  it('[REQ-OVERRIDES-AUDIT-XREF] RFC-001 surface reports the override pin with audit-xref reason vocabulary', async () => {
    const findings = await runOverridesHygiene({
      packageJson,
      auditData,
      outdatedData,
      versionTimes,
      now,
    });

    const braceFinding = findings.find((f) => f.name === 'brace-expansion');
    expect(braceFinding).toBeDefined();
    expect(braceFinding.advisories).toEqual([
      expect.objectContaining({ id: 'GHSA-f886-m6hf-6m8v', severity: 'moderate' }),
    ]);
    expect(braceFinding.safeUpgrade).toBe('5.0.6');
    // REQ-OVERRIDES-REASON-TAXONOMY vocabulary: stale-and-vulnerable or vulnerable.
    expect(braceFinding.reason).toMatch(/^(stale-and-vulnerable|vulnerable):/);
  });

  it('[REQ-OVERRIDES-REASON-TAXONOMY] gap #2 mislabel is preserved on the unfixable surface (RFC-001 Out-of-Scope)', () => {
    const rows = findUnfixableVulns({
      vulnerabilities,
      safePackages: new Set(),
    });

    const braceRow = rows.find((r) => r.name === 'brace-expansion');
    expect(braceRow).toBeDefined();
    // ADR-0018's current reason logic stamps any isDirect=false dep with
    // 'vulnerable transitive dependency' regardless of fixAvailable. RFC-001
    // explicitly does NOT sharpen this — the fix lands in a separate
    // workstream that amends ADR-0018. The assertion below pins that
    // boundary; do not loosen it by widening RFC-001's scope.
    expect(braceRow.reason).toBe('vulnerable transitive dependency');
  });

  it('[REQ-OVERRIDES-REASON-TAXONOMY] RFC-001 reason vocabulary is disjoint from the gap #2 string', async () => {
    const findings = await runOverridesHygiene({
      packageJson,
      auditData,
      outdatedData,
      versionTimes,
      now,
    });

    const braceFinding = findings.find((f) => f.name === 'brace-expansion');
    expect(braceFinding.reason).not.toContain('vulnerable transitive dependency');
  });
});
