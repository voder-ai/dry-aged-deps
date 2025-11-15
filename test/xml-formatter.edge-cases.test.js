/** @story prompts/dry-aged-deps-user-story-map.md */

import { xmlFormatter } from '../src/xml-formatter.js';

/**
 * Story: prompts/009.0-DEV-XML-OUTPUT.md (Error Handling: errors output as XML)
 * Story: prompts/007.0-DEV-SEPARATE-PROD-DEV-THRESHOLDS.md (REQ-CLI-FLAGS)
 */

describe('xmlFormatter error details omission', () => {
  it('omits <details> element when error.details is undefined', () => {
    const error = new Error('Missing details');
    const timestamp = '2025-12-12T12:00:00Z';
    const xml = xmlFormatter({ error, timestamp });

    // Should not include the <details> element for error
    expect(xml).not.toContain('<details>');
    // Should include message and code elements
    expect(xml).toContain('<message>Missing details</message>');
    expect(xml).toContain('<code></code>');
  });
});

describe('xmlFormatter thresholds partial rendering', () => {
  it('renders only prod thresholds when only prod threshold provided', () => {
    const thresholds = { prod: { minAge: 5, minSeverity: 'low' } };
    const timestamp = '2025-12-12T12:00:00Z';
    const xml = xmlFormatter({ thresholds, timestamp });

    expect(xml).toContain('<thresholds>');
    // Prod thresholds should be present
    expect(xml).toContain('<prod>');
    expect(xml).toContain('<min-age>5</min-age>');
    expect(xml).toContain('<min-severity>low</min-severity>');
    expect(xml).toContain('</prod>');
    // Dev thresholds should not be present
    expect(xml).not.toContain('<dev>');
  });

  it('renders only dev thresholds when only dev threshold provided', () => {
    const thresholds = { dev: { minAge: 3, minSeverity: 'critical' } };
    const timestamp = '2025-12-12T12:00:00Z';
    const xml = xmlFormatter({ thresholds, timestamp });

    expect(xml).toContain('<thresholds>');
    // Dev thresholds should be present
    expect(xml).toContain('<dev>');
    expect(xml).toContain('<min-age>3</min-age>');
    expect(xml).toContain('<min-severity>critical</min-severity>');
    expect(xml).toContain('</dev>');
    // Prod thresholds should not be present
    expect(xml).not.toContain('<prod>');
  });
});
