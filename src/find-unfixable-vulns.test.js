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
    // fixAvailable: true + no bundling topology → class (0) lockfile refresh
    // (2026-07-08 amendment); npm's own fixAvailable signal is authoritative.
    expect(rows[0].reason).toMatch(/lockfile refresh/i);
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

  // Class (b) — fix-via-overrides-edit. Per the 2026-07-08 amendment (revised
  // #16), class (b) now owns the `fixAvailable`-is-an-OBJECT case (a
  // range-changing / breaking fix an `overrides` pin expresses) at the root
  // project's own `node_modules/<name>`, not bundled inside an un-overridable
  // parent, no existing `overrides` pin. (The boolean-`true` case moved to
  // class (0) `fix via lockfile refresh` — see the class-(0) test below.)
  /** @story prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md */
  const transitiveAtRoot = {
    name: 'some-pkg',
    severity: 'moderate',
    isDirect: false,
    fixAvailable: { name: 'some-pkg', version: '2.0.0', isSemVerMajor: true },
    nodes: ['node_modules/some-pkg'],
    via: [
      {
        source: 1234567,
        title: 'some-pkg: hypothetical advisory used to lock class (b) classification',
        url: 'https://github.com/advisories/GHSA-bbbb-cccc-dddd',
        severity: 'moderate',
      },
    ],
  };

  it('[REQ-UNFIXABLE-DETECT] class (b): classifies a root-level transitive vuln whose fixAvailable is a range-changing object as `fix via overrides edit` (ADR-0018 amendment 2026-07-08, Confirmation #16)', () => {
    const rows = findUnfixableVulns({
      vulnerabilities: [transitiveAtRoot],
      safePackages: new Set(),
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      name: 'some-pkg',
      severity: 'moderate',
      advisory: 'GHSA-bbbb-cccc-dddd',
      reason: 'fix via overrides edit',
    });
  });

  // Class (0) — fix-via-lockfile-refresh (ADR-0018 amendment 2026-07-08).
  // A root-level transitive vuln with `fixAvailable: true` (a compatible,
  // in-range fix) that is NOT bundled inside a parent. `npm audit fix` resolves
  // it with no package.json edit — the lowest-effort remedy. This is the exact
  // mislabel the 2026-07-08 session hit (sigstore/undici/vite had fixAvailable:
  // true and `npm audit fix` cleared them from a stale lockfile).
  /** @story prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md */
  const transitiveLockfileRefresh = {
    name: 'stale-lock-pkg',
    severity: 'high',
    isDirect: false,
    fixAvailable: true,
    nodes: ['node_modules/stale-lock-pkg'],
    via: [
      {
        source: 2468013,
        title: 'stale-lock-pkg: hypothetical advisory fixable by an in-range lockfile refresh',
        url: 'https://github.com/advisories/GHSA-0000-1111-2222',
        severity: 'high',
      },
    ],
  };

  it('[REQ-UNFIXABLE-DETECT] class (0): classifies a non-bundled transitive vuln with fixAvailable: true as `fix via lockfile refresh` (ADR-0018 amendment 2026-07-08, Confirmation #18)', () => {
    const rows = findUnfixableVulns({
      vulnerabilities: [transitiveLockfileRefresh],
      safePackages: new Set(),
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      name: 'stale-lock-pkg',
      severity: 'high',
      advisory: 'GHSA-0000-1111-2222',
      reason: 'fix via lockfile refresh',
    });
  });

  // Class (c) — genuinely-unfixable, `no patched version` subcase
  // (ADR-0018 amendment 2026-06-05, §Detection signals Step 1 + §User-facing
  // reason strings (c) + Confirmation #16 first clause).
  // The vulnerable copy is a transitive dep (`isDirect: false`) AND npm-audit
  // reports `fixAvailable: false` — no satisfying version exists yet, neither
  // a parent bump nor an overrides edit can resolve it. The amendment routes
  // any `fixAvailable === false` vuln to class (c) regardless of `isDirect`,
  // with reason string `no patched version`. The retired category-label
  // `vulnerable transitive dependency` MUST NOT surface — that was the P013
  // mislabel motivating this taxonomy.
  /** @story prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md */
  const transitiveNoPatch = {
    name: 'orphan-pkg',
    severity: 'high',
    isDirect: false,
    fixAvailable: false,
    via: [
      {
        source: 7777777,
        title: 'orphan-pkg: hypothetical advisory used to lock class (c) `no patched version` classification',
        url: 'https://github.com/advisories/GHSA-cccc-dddd-eeee',
        severity: 'high',
      },
    ],
  };

  it('[REQ-UNFIXABLE-DETECT] class (c): classifies a transitive vuln with fixAvailable: false as `no patched version` (ADR-0018 amendment 2026-06-05, Confirmation #16)', () => {
    const rows = findUnfixableVulns({
      vulnerabilities: [transitiveNoPatch],
      safePackages: new Set(),
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      name: 'orphan-pkg',
      severity: 'high',
      advisory: 'GHSA-cccc-dddd-eeee',
      reason: 'no patched version',
    });
  });
});
