/**
 * Tests for severityToModifier / effectiveSoakMs — pure-function
 * realisation of the RFC-002 §Summary locked policy table.
 *
 * The locked table (RFC-002 §Summary):
 *
 *   | Current exposure severity | Soak modifier        |
 *   | ------------------------- | -------------------- |
 *   | Critical                  | 0.0 × default soak   |
 *   | High                      | 0.5 × default soak   |
 *   | Moderate                  | 1.0 × default soak   |
 *   | Low                       | 1.0 × default soak   |
 *   | None / null               | 1.0 × default soak   |
 *
 * T2 fixture per RFC-002 §Tasks: installed package with Critical
 * advisory exposure + a fresh candidate version newer than `min-age`.
 * Expected output: candidate passes the age gate (0-day floor applied).
 *
 * @supports prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md REQ-EXPOSURE-POLICY-TABLE REQ-EXPOSURE-EFFECTIVE-SOAK REQ-EXPOSURE-PURE-FUNCTION
 */

import { describe, it, expect } from 'vitest';

import { severityToModifier, effectiveSoakMs } from './exposure-soak-modifier.js';

describe('Story 018.0-DEV-EXPOSURE-AWARE-SOAK: severityToModifier', () => {
  /** @story prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md */
  it('[REQ-EXPOSURE-POLICY-TABLE] returns 0 for critical (0-day floor)', () => {
    expect(severityToModifier('critical')).toBe(0);
  });

  /** @story prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md */
  it('[REQ-EXPOSURE-POLICY-TABLE] returns 0.5 for high (halved soak)', () => {
    expect(severityToModifier('high')).toBe(0.5);
  });

  /** @story prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md */
  it('[REQ-EXPOSURE-POLICY-TABLE] returns 1.0 for moderate / low / none (unchanged)', () => {
    expect(severityToModifier('moderate')).toBe(1);
    expect(severityToModifier('low')).toBe(1);
    expect(severityToModifier('none')).toBe(1);
    expect(severityToModifier(null)).toBe(1);
  });
});

describe('Story 018.0-DEV-EXPOSURE-AWARE-SOAK: effectiveSoakMs', () => {
  // Concrete soak budgets the operator might run with — `--min-age=7` and
  // `--min-age=14`. The modifier scales whatever the operator sets, NOT a
  // hard-coded 7 (REQ-EXPOSURE-EFFECTIVE-SOAK).
  /** @story prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md */
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  /** @story prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md */
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
  /** @story prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md */
  const twoDaysMs = 2 * 24 * 60 * 60 * 1000;

  /** @story prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md */
  it('[REQ-EXPOSURE-EFFECTIVE-SOAK] returns 0 for critical regardless of base (0-day floor)', () => {
    expect(effectiveSoakMs('critical', sevenDaysMs)).toBe(0);
    expect(effectiveSoakMs('critical', fourteenDaysMs)).toBe(0);
  });

  /** @story prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md */
  it('[REQ-EXPOSURE-EFFECTIVE-SOAK] halves the operator-set base for high exposure', () => {
    expect(effectiveSoakMs('high', sevenDaysMs)).toBe(Math.floor(sevenDaysMs * 0.5));
    expect(effectiveSoakMs('high', fourteenDaysMs)).toBe(fourteenDaysMs * 0.5);
  });

  /** @story prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md */
  it('[REQ-EXPOSURE-EFFECTIVE-SOAK] leaves the operator-set base unchanged for moderate / low / none', () => {
    expect(effectiveSoakMs('moderate', sevenDaysMs)).toBe(sevenDaysMs);
    expect(effectiveSoakMs('low', sevenDaysMs)).toBe(sevenDaysMs);
    expect(effectiveSoakMs('none', sevenDaysMs)).toBe(sevenDaysMs);
    expect(effectiveSoakMs(null, sevenDaysMs)).toBe(sevenDaysMs);
  });

  /** @story prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md */
  it('[REQ-EXPOSURE-PURE-FUNCTION] floors to integer ms', () => {
    // `--min-age=7` × 0.5 modifier × an odd ms count exercises the floor.
    // Construct a base that does not divide evenly by 2.
    const oddBaseMs = sevenDaysMs + 1;
    expect(effectiveSoakMs('high', oddBaseMs)).toBe(Math.floor(oddBaseMs * 0.5));
    expect(Number.isInteger(effectiveSoakMs('high', oddBaseMs))).toBe(true);
  });

  // T2 verbatim acceptance: installed package with Critical advisory
  // exposure + a fresh candidate version newer than `min-age`. Expected
  // output: candidate passes the age gate (0-day floor applied).
  /** @story prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md */
  it('[REQ-EXPOSURE-EFFECTIVE-SOAK] 2-day-old candidate passes the gate under Critical exposure (RFC-002 T2 fixture)', () => {
    const candidateAgeMs = twoDaysMs;
    const baseSoakMs = sevenDaysMs;
    // Under the unconditional soak the 2-day candidate would be blocked.
    expect(candidateAgeMs).toBeLessThan(baseSoakMs);
    // Under Critical exposure the effective soak collapses to 0; the
    // candidate clears the gate.
    const effective = effectiveSoakMs('critical', baseSoakMs);
    expect(effective).toBe(0);
    expect(candidateAgeMs).toBeGreaterThanOrEqual(effective);
  });
});
