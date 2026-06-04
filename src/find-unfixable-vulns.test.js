/**
 * Tests for findUnfixableVulns — surfacing known-vulnerable packages that
 * dry-aged-deps cannot recommend a safe update for.
 * @supports prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md REQ-UNFIXABLE-DETECT REQ-UNFIXABLE-EXCEPTION-RESPECT REQ-UNFIXABLE-SEVERITY-FLOOR REQ-UNFIXABLE-FIXABLE-SOON-BOUNDARY
 */

import { describe, it, expect } from 'vitest';
import { findUnfixableVulns } from './find-unfixable-vulns.js';

describe('Story 016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES: findUnfixableVulns', () => {
  // Shape mirrors real `npm audit --json` output (verified against the live
  // brace-expansion transitive advisory chain).
  /** @story prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md */
  const braceExpansion = {
    name: 'brace-expansion',
    severity: 'moderate',
    isDirect: false,
    fixAvailable: true,
    via: [
      {
        source: 1115543,
        title: 'brace-expansion: Zero-step sequence causes process hang and memory exhaustion',
        url: 'https://github.com/advisories/GHSA-f886-m6hf-6m8v',
        severity: 'moderate',
      },
      {
        source: 1119088,
        title: 'brace-expansion: Large numeric range defeats documented `max` DoS protection',
        url: 'https://github.com/advisories/GHSA-jxxr-4gwj-5jf2',
        severity: 'moderate',
      },
    ],
  };

  /** @story prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md */
  const lowSevDirect = {
    name: 'left-pad',
    severity: 'low',
    isDirect: true,
    fixAvailable: false,
    via: [
      {
        source: 9999001,
        title: 'left-pad: trivial issue',
        url: 'https://github.com/advisories/GHSA-aaaa-bbbb-cccc',
        severity: 'low',
      },
    ],
  };

  it('[REQ-UNFIXABLE-DETECT] surfaces a transitive vuln not in the safe-update set, one row per advisory', () => {
    const rows = findUnfixableVulns({ vulnerabilities: [braceExpansion], safePackages: new Set() });
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      name: 'brace-expansion',
      severity: 'moderate',
      advisory: 'GHSA-f886-m6hf-6m8v',
    });
    expect(rows[0].reason).toMatch(/transitive/i);
    expect(Array.isArray(rows[0].via)).toBe(true);
    expect(rows[1].advisory).toBe('GHSA-jxxr-4gwj-5jf2');
  });

  it('[REQ-UNFIXABLE-FIXABLE-SOON-BOUNDARY] omits a package that IS in the safe-update set', () => {
    // If dry-aged-deps will recommend a safe update for the package, it is
    // not unfixable — the safe-update path resolves it.
    const rows = findUnfixableVulns({
      vulnerabilities: [braceExpansion],
      safePackages: new Set(['brace-expansion']),
    });
    expect(rows).toHaveLength(0);
  });

  it('[REQ-UNFIXABLE-EXCEPTION-RESPECT] omits advisories excepted in audit-resolve.json', () => {
    const rows = findUnfixableVulns({
      vulnerabilities: [braceExpansion],
      safePackages: new Set(),
      exclusions: [1115543],
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].advisory).toBe('GHSA-jxxr-4gwj-5jf2');
  });

  it('[REQ-UNFIXABLE-SEVERITY-FLOOR] applies the severity floor (default surfaces all)', () => {
    // Default floor = low: both the moderate transitive and the low direct surface.
    const all = findUnfixableVulns({
      vulnerabilities: [braceExpansion, lowSevDirect],
      safePackages: new Set(),
    });
    expect(all).toHaveLength(3); // 2 brace-expansion advisories + 1 left-pad

    // floor = moderate: the low-severity left-pad row drops out.
    const moderatePlus = findUnfixableVulns({
      vulnerabilities: [braceExpansion, lowSevDirect],
      safePackages: new Set(),
      severityFloor: 'moderate',
    });
    expect(moderatePlus).toHaveLength(2);
    expect(moderatePlus.every((r) => r.name === 'brace-expansion')).toBe(true);

    // floor = high: nothing left.
    const highPlus = findUnfixableVulns({
      vulnerabilities: [braceExpansion, lowSevDirect],
      safePackages: new Set(),
      severityFloor: 'high',
    });
    expect(highPlus).toHaveLength(0);
  });

  it('[REQ-UNFIXABLE-DETECT] returns an empty array when there are no vulnerabilities', () => {
    expect(findUnfixableVulns({ vulnerabilities: [], safePackages: new Set() })).toEqual([]);
  });

  // Class (a) — fix-via-parent-bump (ADR-0018 amendment 2026-06-05).
  // The vulnerable copy lives inside an upgradable parent's bundled `node_modules`
  // (here: `node_modules/npm/node_modules/brace-expansion`). `overrides` cannot
  // reach a bundling parent's own dependencies — the actionable fix is bumping
  // the parent (`npm`), not editing `overrides`. The amendment mandates the
  // reason string be `fix via parent bump: <parent>` so the surface guides the
  // user to the right tree-change, not the wrong one.
  /** @story prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md */
  const braceExpansionBundledInNpm = {
    name: 'brace-expansion',
    severity: 'moderate',
    isDirect: false,
    fixAvailable: true,
    nodes: ['node_modules/npm/node_modules/brace-expansion'],
    via: [
      {
        source: 1119088,
        title: 'brace-expansion: Large numeric range defeats documented `max` DoS protection',
        url: 'https://github.com/advisories/GHSA-jxxr-4gwj-5jf2',
        severity: 'moderate',
      },
    ],
  };

  it('[REQ-UNFIXABLE-DETECT] class (a): classifies a vuln bundled inside an upgradable parent as `fix via parent bump: <parent>` (ADR-0018 amendment 2026-06-05, Confirmation #14)', () => {
    const rows = findUnfixableVulns({
      vulnerabilities: [braceExpansionBundledInNpm],
      safePackages: new Set(),
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      name: 'brace-expansion',
      severity: 'moderate',
      advisory: 'GHSA-jxxr-4gwj-5jf2',
      reason: 'fix via parent bump: npm',
    });
  });
});
