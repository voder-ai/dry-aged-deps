/**
 * @story prompts/dry-aged-deps-user-story-map.md
 */

import { describe, it, expect, vi } from 'vitest';
import { calculateAgeInDays } from '../src/age-calculator';

describe('calculateAgeInDays', () => {
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