/** @story prompts/dry-aged-deps-user-story-map.md */
/**
 * @story prompts/dry-aged-deps-user-story-map.md
 *//**
 * @story prompts/dry-aged-deps-user-story-map.md
 */ // Story: docs/decisions/0002-json-xml-output-support.md
// Tests for: xmlFormatter error output branch without details

import { describe, it, expect } from 'vitest';
import { xmlFormatter } from '../src/xml-formatter.js';

/**
 * Story: docs/decisions/0002-json-xml-output-support.md
 * @req REQ-XML-ERROR-BRANCH - Should not include <details> element when error.details is absent
 */
describe('xmlFormatter error branch without details', () => {
  it('does not include <details> when error.details is undefined', () => {
    const error = new Error('Another failure');
    error.code = 'E_OTHER';
    // No error.details provided
    const timestamp = '2025-01-02T00:00:00Z';
    const xml = xmlFormatter({ error, timestamp });

    // Error block present
    expect(xml).toContain('<error>');
    expect(xml).toContain('<message>Another failure</message>');
    expect(xml).toContain('<code>E_OTHER</code>');
    // Ensure no <details> element
    expect(xml).not.toContain('<details>');

    // Closing tag
    expect(xml.trim().endsWith('</outdated-packages>')).toBe(true);
  });
});
