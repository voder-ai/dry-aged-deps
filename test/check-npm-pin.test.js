/**
 * Tests for scripts/check-npm-pin.js — the prepush guard that fails fast when a
 * CI npm pin's major diverges from the local lockfile-generator npm.
 *
 * Closes P033: CI npm pin drifts from the lockfile-generator npm, silently
 * stalling the release pipeline. The guard's pure logic (pin extraction + major
 * comparison + zero-pin loud failure) is unit-tested here.
 *
 * @supports docs/rfcs/RFC-006-check-npm-pin-prepush-drift-guard.proposed.md P033
 */

import { describe, it, expect } from 'vitest';
import { parsePins, majorOf, findDrift } from '../scripts/check-npm-pin.js';

describe('check-npm-pin — CI npm pin drift guard (P033 / RFC-006)', () => {
  const WORKFLOW = `
    - name: Install specific npm version
      run: npm install -g npm@11.13.0
  `;
  const THREE_PINS = `
    run: npm install -g npm@11.13.0
    run: npm install -g npm@11.13.0
    run: npm install -g npm@11.13.0
  `;

  it('extracts the npm@<version> pin from a workflow step', () => {
    expect(parsePins(WORKFLOW)).toEqual(['11.13.0']);
  });

  it('extracts every pin when a workflow (or set) carries more than one', () => {
    expect(parsePins(THREE_PINS)).toEqual(['11.13.0', '11.13.0', '11.13.0']);
  });

  it('finds no pins when none are present (guard must then fail loudly, not vacuously)', () => {
    expect(parsePins('run: npm ci')).toEqual([]);
  });

  it('reads the major from a semver string', () => {
    expect(majorOf('11.13.0')).toBe(11);
    expect(majorOf('10.9.2')).toBe(10);
  });

  it('passes (no drift) when every pin major matches the local npm major', () => {
    expect(findDrift(['11.13.0', '11.13.0'], 11)).toEqual([]);
  });

  it('ignores minor/patch differences — only the major boundary changes lockfile shape', () => {
    expect(findDrift(['11.13.1', '11.0.0'], 11)).toEqual([]);
  });

  it('flags drift when a pin major differs from the local npm major (the P033 failure)', () => {
    expect(findDrift(['10.9.2', '11.13.0'], 11)).toEqual(['10.9.2']);
  });
});
