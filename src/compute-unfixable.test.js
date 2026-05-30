/**
 * Tests for computeUnfixable orchestration (audit run + detection + exclusions).
 * @supports prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md REQ-UNFIXABLE-DETECT REQ-UNFIXABLE-DEFAULT-ON REQ-UNFIXABLE-EXCEPTION-RESPECT
 */

import { describe, it, expect } from 'vitest';
import { computeUnfixable } from './compute-unfixable.js';

describe('Story 016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES: computeUnfixable', () => {
  const braceExpansion = {
    name: 'brace-expansion',
    severity: 'moderate',
    isDirect: false,
    fixAvailable: true,
    via: [
      { source: 1115543, url: 'https://github.com/advisories/GHSA-f886-m6hf-6m8v', severity: 'moderate' },
      { source: 1119088, url: 'https://github.com/advisories/GHSA-jxxr-4gwj-5jf2', severity: 'moderate' },
    ],
  };
  // Audit payload shape refactored under RFC-001 T4 so the same fetch can drive
  // both the unfixable surface and the overrides-hygiene surface — see
  // run-project-audit.js docstring.
  const auditStub = async () => ({ vulnerabilities: { 'brace-expansion': braceExpansion } });

  it('[REQ-UNFIXABLE-DEFAULT-ON] returns [] without running audit when disabled', async () => {
    let called = false;
    const rows = await computeUnfixable({
      safePackages: new Set(),
      enabled: false,
      runProjectAudit: async () => {
        called = true;
        return { vulnerabilities: { 'brace-expansion': braceExpansion } };
      },
    });
    expect(rows).toEqual([]);
    expect(called).toBe(false);
  });

  it('[REQ-UNFIXABLE-DETECT] detects unfixable rows from the injected audit', async () => {
    const rows = await computeUnfixable({ safePackages: new Set(), runProjectAudit: auditStub, exclusions: [] });
    expect(rows).toHaveLength(2);
    expect(rows[0].name).toBe('brace-expansion');
  });

  it('[REQ-UNFIXABLE-DETECT] omits packages in the safe-update set', async () => {
    const rows = await computeUnfixable({
      safePackages: new Set(['brace-expansion']),
      runProjectAudit: auditStub,
      exclusions: [],
    });
    expect(rows).toEqual([]);
  });

  it('[REQ-UNFIXABLE-EXCEPTION-RESPECT] honours injected exclusions', async () => {
    const rows = await computeUnfixable({
      safePackages: new Set(),
      runProjectAudit: auditStub,
      exclusions: [1115543],
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].advisory).toBe('GHSA-jxxr-4gwj-5jf2');
  });
});
