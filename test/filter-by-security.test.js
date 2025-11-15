import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { filterBySecurity } from '../src/filter-by-security.js';

describe('filterBySecurity', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('filters out rows with vulnerabilities and produces correct vulnMap and filterReasonMap', async () => {
    const rows = [
      ['pkg1', '1.0.0', '1.1.0', '1.1.0', 10, 'prod'],
      ['pkg2', '1.0.0', '1.2.0', '1.2.0', 12, 'dev'],
      ['pkg3', '2.0.0', '2.1.0', '2.1.0', 8, 'prod'],
    ];
    // stub for vulnerabilities: pkg1 safe, pkg2 has 3 vulns, pkg3 throws error
    const checkVuln = async (name, version) => {
      if (name === 'pkg1') return 0;
      if (name === 'pkg2') return 3;
      throw new Error('audit failure');
    };
    const thresholds = { prodMinSeverity: 'high', devMinSeverity: 'low' };
    const format = 'table';

    const { safeRows, vulnMap, filterReasonMap } = await filterBySecurity(rows, checkVuln, thresholds, format);

    // safeRows should include pkg1 (0 vulns) and pkg3 (error treated as safe), but not pkg2
    expect(safeRows).toEqual([
      ['pkg1', '1.0.0', '1.1.0', '1.1.0', 10, 'prod'],
      ['pkg3', '2.0.0', '2.1.0', '2.1.0', 8, 'prod'],
    ]);

    // vulnMap should contain entries for all rows
    expect(vulnMap.get('pkg1')).toEqual({
      count: 0,
      maxSeverity: 'none',
      details: [],
    });
    expect(vulnMap.get('pkg2')).toEqual({
      count: 3,
      maxSeverity: 'low',
      details: [],
    });
    expect(vulnMap.get('pkg3')).toEqual({
      count: 0,
      maxSeverity: 'none',
      details: [],
    });

    // filterReasonMap should only have pkg2 with reason 'security'
    expect(filterReasonMap.has('pkg1')).toBe(false);
    expect(filterReasonMap.get('pkg2')).toBe('security');
    expect(filterReasonMap.has('pkg3')).toBe(false);
  });
});
