/** @story prompts/dry-aged-deps-user-story-map.md */
/**
 * @story prompts/dry-aged-deps-user-story-map.md
 *//**
 * @story prompts/dry-aged-deps-user-story-map.md
 */ // Story: docs/decisions/0002-json-xml-output-support.md
// Tests for: xml fetch error suppression and N/A age in xml output

import { printOutdated } from '../src/print-outdated.js';
import { vi, describe, expect } from 'vitest';

// Suppress xmlFormatter import to check raw XML output

describe('printOutdated XML fetch error handling', () => {
  it('suppresses fetchVersionTimes errors and prints <age>N/A</age>', async () => {
    const data = {
      pkgErr: { current: '1.0.0', wanted: '1.1.0', latest: '1.1.0' },
    };
    const fetchStub = vi.fn().mockRejectedValue(new Error('fetch fail'));
    const ageStub = vi.fn();
    const vulnStub = vi.fn().mockResolvedValue(0);
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const summary = await printOutdated(data, {
      format: 'xml',
      fetchVersionTimes: fetchStub,
      calculateAgeInDays: ageStub,
      checkVulnerabilities: vulnStub,
      prodMinAge: 7,
      devMinAge: 7,
    });

    // No error logs for xml format
    expect(errorSpy).not.toHaveBeenCalled();
    // xmlFormatter should be called once
    expect(logSpy).toHaveBeenCalledTimes(1);
    const xml = logSpy.mock.calls[0][0];
    // Age should be N/A in output
    expect(xml).toContain('<age>N/A</age>');
    // Summary filteredByAge should indicate removal by age
    expect(summary).toMatchObject({
      totalOutdated: 1,
      safeUpdates: 0,
      filteredByAge: 1,
    });

    logSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
