/**
 * Tests for runOverridesHygiene — surfacing stale and vulnerable
 * package.json `overrides` pins.
 *
 * Drives RFC-001 T2 (TDD red) for the overrides-hygiene module.
 * Implementation lands in T3.
 *
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-PARSE REQ-OVERRIDES-AGE REQ-OVERRIDES-AUDIT-XREF REQ-OVERRIDES-OUTDATED-XREF REQ-OVERRIDES-REASON-TAXONOMY REQ-OVERRIDES-EXCEPTION-RESPECT
 */

import { describe, it, expect } from 'vitest';
import { runOverridesHygiene } from './overrides-hygiene.js';

describe('Story 017.0-DEV-OVERRIDES-HYGIENE: runOverridesHygiene', () => {
  // P013-originating live case: brace-expansion was pinned ^4.0.1 as a
  // historical security measure, but that range is now within advisory
  // ranges GHSA-f886-m6hf-6m8v and GHSA-jxxr-4gwj-5jf2 (safe target ^5.0.6).
  /** @story prompts/017.0-DEV-OVERRIDES-HYGIENE.md */
  const stalePackageJson = {
    name: 'consumer',
    version: '0.0.0',
    overrides: {
      'brace-expansion': '^4.0.1', // stale + within advisory range
      'left-pad': '1.2.0', // stale only (no advisory hit)
      // nested shape per the npm overrides spec
      colors: { '.': '1.4.0', 'safe-sub': '1.0.0' },
    },
  };

  /** @story prompts/017.0-DEV-OVERRIDES-HYGIENE.md */
  const auditData = {
    vulnerabilities: {
      'brace-expansion': {
        name: 'brace-expansion',
        severity: 'moderate',
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
    },
  };

  /** @story prompts/017.0-DEV-OVERRIDES-HYGIENE.md */
  const outdatedData = {
    'brace-expansion': { current: '4.0.1', latest: '5.0.6' },
    'left-pad': { current: '1.2.0', latest: '1.3.0' },
    colors: { current: '1.4.0', latest: '1.4.0' },
  };

  /** @story prompts/017.0-DEV-OVERRIDES-HYGIENE.md */
  const versionTimes = {
    'brace-expansion@4.0.1': '2024-01-01T00:00:00Z',
    'left-pad@1.2.0': '2024-02-01T00:00:00Z',
    'colors@1.4.0': '2026-05-01T00:00:00Z', // recent — not stale
    'safe-sub@1.0.0': '2026-05-01T00:00:00Z',
  };

  /** @story prompts/017.0-DEV-OVERRIDES-HYGIENE.md */
  const now = new Date('2026-05-30T00:00:00Z');

  it('[REQ-OVERRIDES-PARSE] parses simple and nested override shapes', async () => {
    const findings = await runOverridesHygiene({
      packageJson: stalePackageJson,
      auditData,
      outdatedData,
      versionTimes,
      now,
    });
    const names = findings.map((f) => f.name).sort();
    expect(names).toContain('brace-expansion');
    expect(names).toContain('left-pad');
    // `colors` is recent + no advisory hit → no finding row.
    expect(names).not.toContain('colors');
  });

  it('[REQ-OVERRIDES-AUDIT-XREF] surfaces an override pin within a current advisory range', async () => {
    const findings = await runOverridesHygiene({
      packageJson: stalePackageJson,
      auditData,
      outdatedData,
      versionTimes,
      now,
    });
    const brace = findings.find((f) => f.name === 'brace-expansion');
    expect(brace).toBeDefined();
    expect(brace.advisories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'GHSA-f886-m6hf-6m8v',
          severity: 'moderate',
        }),
      ])
    );
  });

  it('[REQ-OVERRIDES-OUTDATED-XREF] reports the latest version + a safe upgrade target on a stale pin', async () => {
    const findings = await runOverridesHygiene({
      packageJson: stalePackageJson,
      auditData,
      outdatedData,
      versionTimes,
      now,
    });
    const brace = findings.find((f) => f.name === 'brace-expansion');
    expect(brace.pinned).toBe('^4.0.1');
    expect(brace.latest).toBe('5.0.6');
    expect(brace.safeUpgrade).toBe('5.0.6');
  });

  it('[REQ-OVERRIDES-AGE] computes days-since-publish for each pinned version', async () => {
    const findings = await runOverridesHygiene({
      packageJson: stalePackageJson,
      auditData,
      outdatedData,
      versionTimes,
      now,
    });
    const left = findings.find((f) => f.name === 'left-pad');
    // left-pad@1.2.0 published 2024-02-01, now 2026-05-30 → ~849 days.
    expect(left.ageDays).toBeGreaterThan(800);
  });

  it('[REQ-OVERRIDES-REASON-TAXONOMY] tags findings with the fixed short vocabulary', async () => {
    const findings = await runOverridesHygiene({
      packageJson: stalePackageJson,
      auditData,
      outdatedData,
      versionTimes,
      now,
    });
    const brace = findings.find((f) => f.name === 'brace-expansion');
    expect(brace.reason).toMatch(/^stale-and-vulnerable: \d+ days behind, GHSA-/);
    const left = findings.find((f) => f.name === 'left-pad');
    expect(left.reason).toMatch(/^stale: \d+ days behind latest$/);
  });

  it('[REQ-OVERRIDES-EXCEPTION-RESPECT] filters out excluded advisories on the audit-cross-reference axis', async () => {
    const findings = await runOverridesHygiene({
      packageJson: stalePackageJson,
      auditData,
      outdatedData,
      versionTimes,
      now,
      exclusions: [1115543],
    });
    const brace = findings.find((f) => f.name === 'brace-expansion');
    // With the GHSA-f886-m6hf-6m8v advisory excluded, brace-expansion loses
    // its audit hit and falls back to stale-only (staleness is not gated by
    // audit-resolve.json per REQ-OVERRIDES-EXCEPTION-RESPECT).
    expect(brace.advisories).toEqual([]);
    expect(brace.reason).toMatch(/^stale: /);
  });

  it('[REQ-OVERRIDES-PARSE] surfaces malformed entries as a warning row, not a hard error', async () => {
    const findings = await runOverridesHygiene({
      packageJson: { overrides: { 'broken-pkg': null } },
      auditData: { vulnerabilities: {} },
      outdatedData: {},
      versionTimes: {},
      now,
    });
    const broken = findings.find((f) => f.name === 'broken-pkg');
    expect(broken).toBeDefined();
    expect(broken.reason).toBe('pin-to-malformed-entry');
  });

  it('[REQ-OVERRIDES-PARSE] returns an empty array when the overrides block is absent', async () => {
    const findings = await runOverridesHygiene({
      packageJson: { name: 'no-overrides' },
      auditData: { vulnerabilities: {} },
      outdatedData: {},
      versionTimes: {},
      now,
    });
    expect(findings).toEqual([]);
  });
});
