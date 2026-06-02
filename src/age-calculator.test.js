/**
 * Tests for calculateAgeInDays function
 * @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-AGE-CALC
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-AGE
 */

import { calculateAgeInDays } from './age-calculator';

describe('Story 002.0-DEV-FETCH-AVAILABLE-VERSIONS: calculateAgeInDays', () => {
  it('[REQ-AGE-CALC] calculates correct days difference', () => {
    // Mock Date.now to control current time
    const now = new Date('2023-01-10T00:00:00Z');
    const spy = vi.spyOn(Date, 'now').mockReturnValue(now.getTime());

    const publishDate = '2023-01-01T00:00:00Z';
    const days = calculateAgeInDays(publishDate);
    expect(days).toBe(9);

    spy.mockRestore();
  });

  it('[REQ-OVERRIDES-AGE] accepts an injected `now` epoch-ms reference time', () => {
    // P021: deterministic age math via injected clock — no Date.now spy needed.
    // The overrides-hygiene module needs this primitive to avoid divergent inline
    // arithmetic; default-argument shape preserves backwards compatibility for
    // all single-arg consumers (buildRows, security-smart-search, etc.).
    const publishDate = '2023-01-01T00:00:00Z';
    const now = new Date('2023-01-10T00:00:00Z').getTime();

    expect(calculateAgeInDays(publishDate, now)).toBe(9);
  });
});
