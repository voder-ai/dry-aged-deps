/**
 * Tests for loadPackageJson — package.json reader.
 *
 * @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-JSON-PARSE
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-PARSE
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import { loadPackageJson } from './load-package-json.js';

describe('Story 001.0-DEV-RUN-NPM-OUTDATED / 017.0-DEV-OVERRIDES-HYGIENE: loadPackageJson', () => {
  let readSpy;

  beforeEach(() => {
    readSpy = vi.spyOn(fs, 'readFileSync');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('[REQ-JSON-PARSE] returns dependencies and devDependencies fields', () => {
    readSpy.mockReturnValue(
      JSON.stringify({
        dependencies: { a: '1.0.0' },
        devDependencies: { b: '2.0.0' },
      })
    );
    const result = loadPackageJson();
    expect(result.dependencies).toEqual({ a: '1.0.0' });
    expect(result.devDependencies).toEqual({ b: '2.0.0' });
  });

  it('[REQ-OVERRIDES-PARSE] surfaces the overrides block when present', () => {
    readSpy.mockReturnValue(
      JSON.stringify({
        dependencies: {},
        devDependencies: {},
        overrides: { 'brace-expansion': '^5.0.6' },
      })
    );
    const result = loadPackageJson();
    expect(result.overrides).toEqual({ 'brace-expansion': '^5.0.6' });
  });

  it('[REQ-OVERRIDES-PARSE] defaults overrides to an empty object when absent', () => {
    readSpy.mockReturnValue(JSON.stringify({ dependencies: {}, devDependencies: {} }));
    const result = loadPackageJson();
    expect(result.overrides).toEqual({});
  });

  it('[REQ-JSON-PARSE] degrades to empty maps when package.json is missing', () => {
    readSpy.mockImplementation(() => {
      throw new Error('ENOENT');
    });
    const result = loadPackageJson();
    expect(result.dependencies).toEqual({});
    expect(result.devDependencies).toEqual({});
    expect(result.overrides).toEqual({});
  });
});
