/**
 * Tests for severity threshold logic in filterBySecurity
 *
 * @supports prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md REQ-SEVERITY-LEVELS REQ-FILTERING-LOGIC
 */

import { describe, it, expect } from 'vitest';
import { filterBySecurity } from '../src/filter-by-security.js';

// Helper for legacy numeric stub
// @supports prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md REQ-SEVERITY-LEVELS
const numericStub = async () => 2;

describe('Story 006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD: filterBySecurity severity threshold logic', () => {
  it('[REQ-FILTERING-LOGIC] [REQ-SEVERITY-LEVELS] allows vulnerabilities when all severities are below threshold', async () => {
    const rows = [['pkg1', '1.0.0', '1.1.0', '1.1.0', 5, 'prod']];
    const details = [
      { severity: 'low', title: 'low-severity', name: 'v1' },
      { severity: 'moderate', title: 'moderate-severity', name: 'v2' },
    ];
    const checkVuln = async () => ({
      count: details.length,
      details,
    });
    // Threshold high: low/moderate < high => allowed
    const thresholds = { prodMinSeverity: 'high', devMinSeverity: 'none' };
    const { safeRows, vulnMap, filterReasonMap } = await filterBySecurity(rows, checkVuln, thresholds, 'table');

    expect(safeRows).toEqual(rows);
    const info = vulnMap.get('pkg1');
    expect(info.count).toBe(2); // two vulnerabilities
    expect(info.maxSeverity).toBe('moderate'); // highest severity in details
    expect(info.details).toEqual(details);
    expect(filterReasonMap.has('pkg1')).toBe(false);
  });

  it('[REQ-FILTERING-LOGIC] [REQ-SEVERITY-LEVELS] blocks vulnerabilities at or above the threshold level', async () => {
    const rows = [['pkg2', '1.0.0', '1.1.0', '1.1.0', 5, 'dev']];
    const details = [
      { severity: 'low', title: 'low-severity', name: 'v1' },
      { severity: 'critical', title: 'critical-severity', name: 'v2' },
    ];
    const checkVuln = async () => ({
      count: details.length,
      details,
    });
    // Threshold critical: only critical matches threshold => blocked
    const thresholds = { prodMinSeverity: 'none', devMinSeverity: 'critical' };
    const { safeRows, vulnMap, filterReasonMap } = await filterBySecurity(rows, checkVuln, thresholds, 'json');

    expect(safeRows).toEqual([]);
    const info = vulnMap.get('pkg2');
    expect(info.count).toBe(2);
    expect(info.maxSeverity).toBe('critical');
    expect(filterReasonMap.get('pkg2')).toBe('security');
  });

  it('[REQ-FILTERING-LOGIC] uses legacy numeric stub ignoring threshold (blocks any nonzero count)', async () => {
    const rows = [['pkg3', '1.0.0', '1.1.0', '1.1.0', 5, 'prod']];
    const { safeRows, vulnMap, filterReasonMap } = await filterBySecurity(
      rows,
      numericStub,
      { prodMinSeverity: 'critical', devMinSeverity: 'critical' },
      'table'
    );

    // Legacy numeric stub always blocks nonzero count regardless of threshold
    expect(safeRows).toEqual([]);
    const info = vulnMap.get('pkg3');
    expect(info.count).toBe(2);
    expect(info.maxSeverity).toBe('critical');
    expect(filterReasonMap.get('pkg3')).toBe('security');
  });
});
