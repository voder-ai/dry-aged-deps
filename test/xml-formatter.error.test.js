/**
 * @story ??? - TODO: specify story file
 * @req UNKNOWN - TODO: specify requirement ID and description
 */

import { xmlFormatter } from '../src/xml-formatter.js';

describe('xmlFormatter error output', () => {
  it('should output error block with message, code, details and closing tag', () => {
    const error = new Error('Test failure');
    error.code = 'E_TEST';
    error.details = 'detail text';
    const timestamp = '2025-01-01T00:00:00Z';
    const xml = xmlFormatter({ error, timestamp });

    // Basic XML structure
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain(`<outdated-packages timestamp="${timestamp}">`);

    // Error block
    expect(xml).toContain('<error>');
    expect(xml).toContain('<message>Test failure</message>');
    expect(xml).toContain('<code>E_TEST</code>');
    expect(xml).toContain('<details>detail text</details>');

    // Closing tag
    expect(xml.trim().endsWith('</outdated-packages>')).toBe(true);
  });
});
