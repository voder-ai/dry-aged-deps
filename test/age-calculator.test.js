/**
 * Tests for calculateAgeInDays function
 * @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-AGE-CALC
 */

import { calculateAgeInDays } from '../src/age-calculator';

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
});
