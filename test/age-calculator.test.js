/**
 * Tests for calculateAgeInDays function
 * @story prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md
 * @req REQ-AGE-CALC
 */

import { calculateAgeInDays } from '../src/age-calculator';

describe('prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md: calculateAgeInDays', () => {
  it('calculates correct days difference', () => {
    // Mock Date.now to control current time
    const now = new Date('2023-01-10T00:00:00Z');
    const spy = vi.spyOn(Date, 'now').mockReturnValue(now.getTime());

    const publishDate = '2023-01-01T00:00:00Z';
    const days = calculateAgeInDays(publishDate);
    expect(days).toBe(9);

    spy.mockRestore();
  });
});
