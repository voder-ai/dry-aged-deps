/** @story prompts/dry-aged-deps-user-story-map.md */
import { jsonFormatter } from '../src/json-formatter.js';

describe('jsonFormatter', () => {
  it('should produce valid JSON with timestamp, packages, and summary', () => {
    const rows = [
      ['pkg1', '1.0.0', '1.1.0', '1.1.0', 10],
      ['pkg2', '2.0.0', '2.2.0', '2.2.0', 8],
    ];
    const summary = {
      totalOutdated: 2,
      safeUpdates: 2,
      filteredByAge: 0,
      filteredBySecurity: 0,
    };
    const thresholds = {
      prod: { minAge: 7, minSeverity: 'none' },
      dev: { minAge: 7, minSeverity: 'none' },
    };
    const timestamp = '2024-01-01T00:00:00.000Z';
    const json = jsonFormatter({ rows, summary, thresholds, timestamp });
    // Should be parseable JSON
    let obj;
    expect(() => {
      obj = JSON.parse(json);
    }).not.toThrow();

    expect(obj).toHaveProperty('timestamp', timestamp);
    expect(obj).toHaveProperty('packages');
    expect(Array.isArray(obj.packages)).toBe(true);
    expect(obj.packages.length).toBe(2);
    expect(obj.packages[0]).toEqual({
      name: 'pkg1',
      current: '1.0.0',
      wanted: '1.1.0',
      latest: '1.1.0',
      age: 10,
    });
    expect(obj).toHaveProperty('summary');
    expect(obj.summary).toEqual({
      ...summary,
      thresholds,
    });
    // Ensure formatted with indentation
    expect(json.startsWith('{\n  "timestamp"')).toBe(true);
  });
});
