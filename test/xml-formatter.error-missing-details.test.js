/** @story prompts/dry-aged-deps-user-story-map.md */

import { describe, it, expect } from 'vitest';
import { xmlFormatter } from '../src/xml-formatter.js';

/**
 * Story: docs/decisions/0002-json-xml-output-support.md
 * @req REQ-XML-ERROR-MISSING-DETAILS - Should not include <details> when error.details is undefined
 */
describe('xmlFormatter error branch without details', () => {
  it('does not include <details> when error.details is undefined', () => {
    const error = new Error('Another failure');
    error.code = 'E_OTHER';
    const timestamp = '2025-01-02T00:00:00Z';
    const xml = xmlFormatter({ error, timestamp });

    expect(xml).toContain('<error>');
    expect(xml).toContain('<message>Another failure</message>');
    expect(xml).toContain('<code>E_OTHER</code>');
    expect(xml).not.toContain('<details>');
    expect(xml.trim().endsWith('</outdated-packages>')).toBe(true);
  });
});