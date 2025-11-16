/** @story prompts/dry-aged-deps-user-story-map.md */
import { printOutdated } from '../src/print-outdated.js';
import * as xmlFormatterModule from '../src/xml-formatter.js';

describe('printOutdated XML empty rows', () => {
  it('should call xmlFormatter with empty rows and default thresholds when no packages are outdated', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const formatSpy = vi.spyOn(xmlFormatterModule, 'xmlFormatter');
    const summary = await printOutdated({}, { format: 'xml' });

    // xmlFormatter should be called once with correct parameters
    expect(formatSpy).toHaveBeenCalledTimes(1);
    const args = formatSpy.mock.calls[0][0];
    expect(args.rows).toEqual([]);
    expect(args.summary.totalOutdated).toBe(0);
    expect(args.summary.safeUpdates).toBe(0);
    expect(args.summary.filteredByAge).toBe(0);
    expect(args.summary.filteredBySecurity).toBe(0);
    // Default thresholds should use minAge=7 and minSeverity='none'
    expect(args.thresholds.prod).toEqual({ minAge: 7, minSeverity: 'none' });
    expect(args.thresholds.dev).toEqual({ minAge: 7, minSeverity: 'none' });
    expect(typeof args.timestamp).toBe('string');
    // Summary returned should match expected
    expect(summary).toEqual({
      totalOutdated: 0,
      safeUpdates: 0,
      filteredByAge: 0,
      filteredBySecurity: 0,
    });

    formatSpy.mockRestore();
    logSpy.mockRestore();
  });
});
