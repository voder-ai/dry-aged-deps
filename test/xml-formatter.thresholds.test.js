import { xmlFormatter } from '../src/xml-formatter.js';

describe('xmlFormatter thresholds output', () => {
  it('should include thresholds for prod and dev with min-age and min-severity', () => {
    const rows = [];
    const summary = {
      totalOutdated: 0,
      safeUpdates: 0,
      filteredByAge: 0,
      filteredBySecurity: 0,
      minAge: 5,
    };
    const thresholds = {
      prod: { minAge: 10, minSeverity: 'high' },
      dev: { minAge: 3, minSeverity: 'low' },
    };
    const timestamp = '2024-06-01T12:00:00Z';
    const xml = xmlFormatter({ rows, summary, thresholds, timestamp });

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain(`<outdated-packages timestamp="${timestamp}">`);
    expect(xml).toContain('<thresholds>');
    // Prod thresholds
    expect(xml).toContain('<prod>');
    expect(xml).toContain('<min-age>10</min-age>');
    expect(xml).toContain('<min-severity>high</min-severity>');
    expect(xml).toContain('</prod>');
    // Dev thresholds
    expect(xml).toContain('<dev>');
    expect(xml).toContain('<min-age>3</min-age>');
    expect(xml).toContain('<min-severity>low</min-severity>');
    expect(xml).toContain('</dev>');
  });
});
