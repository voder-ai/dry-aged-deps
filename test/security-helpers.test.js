/**
 * @story ??? - TODO: specify story file
 * @req UNKNOWN - TODO: specify requirement ID and description
 */

import { describe, it, expect } from 'vitest';
import { computeVulnerabilityStats, countAboveThreshold } from '../src/security-helpers.js';

describe('computeVulnerabilityStats', () => {
  const severityWeights = { none: 0, low: 1, moderate: 2, high: 3, critical: 4 };

  it('returns correct metrics when details array present', () => {
    const result = {
      count: 3,
      details: [
        { id: 'a', severity: 'low' },
        { id: 'b', severity: 'high' },
        { id: 'c', severity: 'moderate' },
      ],
    };
    const stats = computeVulnerabilityStats(result, severityWeights);
    expect(stats.totalCount).toBe(3);
    expect(stats.detailsList).toEqual(result.details);
    expect(stats.maxSeverity).toBe('high');
  });

  it('infers count from details length when count missing', () => {
    const details = [
      { id: 'a', severity: 'critical' },
      { id: 'b', severity: 'none' },
    ];
    const stats = computeVulnerabilityStats({ details }, severityWeights);
    expect(stats.totalCount).toBe(2);
    expect(stats.maxSeverity).toBe('critical');
  });

  it('handles missing details array', () => {
    const stats = computeVulnerabilityStats({ count: 2 }, severityWeights);
    expect(stats.totalCount).toBe(2);
    expect(stats.detailsList).toEqual([]);
    expect(stats.maxSeverity).toBe('none');
  });

  it('defaults weight to 0 for unknown severity labels', () => {
    const details = [{ id: 'a', severity: 'unknown' }];
    const stats = computeVulnerabilityStats({ details }, severityWeights);
    expect(stats.maxSeverity).toBe('none');
  });
});

describe('countAboveThreshold', () => {
  const severityWeights = { none: 0, low: 1, moderate: 2, high: 3, critical: 4 };

  it('counts vulnerabilities meeting threshold', () => {
    const list = [{ severity: 'low' }, { severity: 'moderate' }, { severity: 'high' }];
    expect(countAboveThreshold(list, 2, severityWeights)).toBe(2);
  });

  it('includes vulnerabilities equal to threshold', () => {
    const list = [{ severity: 'moderate' }, { severity: 'high' }];
    expect(countAboveThreshold(list, 2, severityWeights)).toBe(2);
  });

  it('returns 0 when no details meet threshold', () => {
    const list = [{ severity: 'low' }];
    expect(countAboveThreshold(list, 2, severityWeights)).toBe(0);
  });

  it('handles empty details list', () => {
    expect(countAboveThreshold([], 1, severityWeights)).toBe(0);
  });

  it('handles severity missing in object', () => {
    const list = [{}, { severity: '' }];
    expect(countAboveThreshold(list, 0, severityWeights)).toBe(2);
  });
});
