/**
 * Tests for XML Output Format - object-style package entries
 * @story prompts/009.0-DEV-XML-OUTPUT.md
 * @req REQ-XML-ESCAPE - Proper XML escaping for special characters
 */

import { describe, it, expect } from 'vitest';
import { xmlFormatter } from '../src/xml-formatter.js';

describe('xmlFormatter object-style package entries', () => {
  it('should format object-style rows with vulnerabilities and escape special characters', () => {
    const rows = [
      {
        name: 'pkg&<>"\'',
        current: '1.0.0',
        wanted: '1.2.0',
        latest: '2.0.0',
        age: 30,
        recommended: '2.0.0',
        vulnerabilities: {
          count: 2,
          maxSeverity: 'critical',
          details: [
            {
              name: 'vuln1',
              severity: 'high',
              title: 'Title & Info',
              url: 'http://example.com/?q=<script>',
            },
            {
              name: 'vuln2',
              severity: 'low',
              title: 'Another > Test',
              url: "http://example.com/?q='test'",
            },
          ],
        },
        filtered: false,
        filterReason: '',
        dependencyType: 'prod',
      },
    ];
    const summary = {
      totalOutdated: 1,
      safeUpdates: 1,
      filteredByAge: 0,
      filteredBySecurity: 0,
      minAge: 1,
    };
    const thresholds = {
      prod: { minAge: 1, minSeverity: 'none' },
      dev: { minAge: 1, minSeverity: 'none' },
    };
    const timestamp = '2024-12-31T23:59:59Z';
    const xml = xmlFormatter({ rows, summary, thresholds, timestamp });

    // Check escaped characters
    expect(xml).toContain('<name>pkg&amp;&lt;&gt;&quot;&apos;</name>');

    // Check vulnerabilities details
    expect(xml).toContain('<vulnerabilities>');
    expect(xml.match(/<vulnerability>/g)?.length).toBe(2);
    expect(xml).toContain('<title>Title &amp; Info</title>');
    expect(xml).toContain('<url>http://example.com/?q=&lt;script&gt;</url>');
    expect(xml).toContain('<url>http://example.com/?q=&apos;test&apos;</url>');

    // Check dependencyType and filtered fields
    expect(xml).toContain('<filtered>false</filtered>');
    expect(xml).toContain('<dependency-type>prod</dependency-type>');
  });
});
